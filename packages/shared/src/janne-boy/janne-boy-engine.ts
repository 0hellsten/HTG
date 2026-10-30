import { BongRaceDayData, BongRaceLeg, BongHorseInput } from '../types/bong.js';
import {
  JanneBoyConfig,
  JanneBoySystemResult,
  JanneBoyLegSuggestion,
  JanneBoyHorsePick,
  JanneBoyStrategy,
} from '../types/janne-boy.js';
import { analyzeHorseProbabilities, HorseProbabilityAnalysis } from './trav-expertis.js';
import { calculateValueScore, createOverallExplanation, pickQuote } from './janne-boy-format.js';

interface ScoredHorse {
  horse: BongHorseInput;
  score: number;
  analysis: HorseProbabilityAnalysis;
}

export class JanneBoyEngine {
  public generate(raceDay: BongRaceDayData, config: JanneBoyConfig): JanneBoySystemResult {
    const gameType = config.gameType;
    const rowPrice = gameType === 'V75' ? 0.5 : 0.25;
    const budget = Math.max(rowPrice * 2, config.budget);
    const targetRows = Math.floor(budget / rowPrice);

    const legs = raceDay.races;

    const scoredLegs = legs.map((leg) => this.scoreHorsesInLeg(leg, config));

    const legOpenness = scoredLegs.map((scoredList, idx) =>
      this.calculateLegOpenness(scoredList, idx, config)
    );

    const allocation = this.optimizeAllocation(legOpenness, targetRows, scoredLegs, config);

    const legSuggestions: JanneBoyLegSuggestion[] = legs.map((leg, idx) => {
      const count = allocation[idx] || 1;
      const scoredList = scoredLegs[idx];
      const selected = this.pickHorsesForLeg(scoredList, count, idx, config);
      const isSpik = selected.length === 1;
      const reason = this.createLegReason(selected, isSpik, config.strategy);

      return {
        legIndex: idx,
        raceNumber: leg.raceNumber || idx + 1,
        trackName: leg.trackName,
        startTime: leg.startTime,
        distance: leg.distance,
        startMethod: leg.startMethod,
        raceName: leg.raceName,
        selectedHorses: selected,
        isSpik,
        reason,
      };
    });

    const totalRows = legSuggestions.reduce((acc, leg) => acc * leg.selectedHorses.length, 1);
    const costSek = totalRows * rowPrice;
    const spikarCount = legSuggestions.filter((l) => l.isSpik).length;
    const skrallarCount = legSuggestions.reduce(
      (acc, l) => acc + l.selectedHorses.filter((h) => h.isValueCandidate).length,
      0
    );

    const valueScore = calculateValueScore(legSuggestions);
    const explanation = createOverallExplanation(
      config.strategy,
      spikarCount,
      skrallarCount,
      totalRows,
      costSek
    );
    const funQuote = pickQuote(config.strategy);

    return {
      gameType,
      strategy: config.strategy,
      budgetSek: budget,
      costSek,
      totalRows,
      rowPrice,
      legs: legSuggestions,
      explanation,
      spikarCount,
      skrallarCount,
      valueScore,
      funQuote,
      createdAt: new Date().toISOString(),
    };
  }

  private scoreHorsesInLeg(leg: BongRaceLeg, config: JanneBoyConfig): ScoredHorse[] {
    const available = leg.horses.filter((h) => !h.scratched);
    const sortedByProb = [...available].sort(
      (a, b) => (b.betDistribution || 0) - (a.betDistribution || 0)
    );
    const secondHorse = sortedByProb[1];

    return available
      .map((h) => {
        const analysis = analyzeHorseProbabilities(h, secondHorse, leg);
        let score = 0;

        switch (config.strategy) {
          case 'sakerhet':
            score =
              analysis.impliedWinProb * 65 +
              (h.betDistribution || 0.01) * 35 +
              analysis.postAdvantage * 10 +
              analysis.equipmentBonus * 10;
            break;
          case 'miljondrag':
            score =
              analysis.valueRatio * 35 +
              analysis.skrallScore * 0.4 +
              analysis.postAdvantage * 12 +
              analysis.equipmentBonus * 15;
            break;
          case 'form':
            score =
              analysis.impliedWinProb * 40 +
              analysis.equipmentBonus * 35 +
              analysis.postAdvantage * 15 +
              analysis.valueRatio * 15;
            break;
          case 'balanserad':
          default:
            score =
              analysis.impliedWinProb * 45 +
              (h.betDistribution || 0.01) * 25 +
              analysis.postAdvantage * 15 +
              analysis.equipmentBonus * 15 +
              (analysis.valueRatio > 1.2 ? 15 : 0);
            break;
        }

        const lockedInLeg = config.lockedHorses?.[leg.legIndex] || [];
        if (lockedInLeg.includes(h.id)) score += 5000;

        const excludedInLeg = config.excludedHorses?.[leg.legIndex] || [];
        if (excludedInLeg.includes(h.id)) score = -500;

        return { horse: h, score, analysis };
      })
      .sort((a, b) => b.score - a.score);
  }

  private calculateLegOpenness(
    scoredList: ScoredHorse[],
    legIdx: number,
    config: JanneBoyConfig
  ): number {
    const locked = config.lockedHorses?.[legIdx] || [];
    if (locked.length === 1) return 0;
    if (scoredList.length <= 1) return 0;

    const top1 = scoredList[0];
    const top2 = scoredList[1];

    if (top1.analysis.isSolidSpik && config.strategy !== 'miljondrag') {
      return 0.05;
    }

    if (config.strategy === 'miljondrag') return 2.5;

    const diff = Math.max(0.01, top1.score - top2.score);
    return Math.max(0.1, 1.0 / diff);
  }

  private optimizeAllocation(
    openness: number[],
    targetRows: number,
    scoredLegs: ScoredHorse[][],
    config: JanneBoyConfig
  ): number[] {
    const legsCount = openness.length;
    const allocation = new Array(legsCount).fill(1);

    for (let i = 0; i < legsCount; i++) {
      const locked = config.lockedHorses?.[i] || [];
      if (locked.length > 1) allocation[i] = locked.length;
    }

    let currentRows = allocation.reduce((acc, count) => acc * count, 1);
    if (currentRows > targetRows) return allocation;

    const maxSpikar =
      config.strategy === 'sakerhet'
        ? 2
        : config.strategy === 'miljondrag'
          ? targetRows < 40
            ? 1
            : 0
          : 1;

    const userSpikIndices = Object.entries(config.lockedHorses || {})
      .filter(([_, ids]) => ids.length === 1)
      .map(([legIdx]) => Number(legIdx));

    const spikIndices = [
      ...userSpikIndices,
      ...openness
        .map((op, idx) => ({ idx, op, solid: scoredLegs[idx][0]?.analysis.isSolidSpik }))
        .filter((item) => !userSpikIndices.includes(item.idx))
        .sort((a, b) => (b.solid ? 1 : 0) - (a.solid ? 1 : 0) || a.op - b.op)
        .slice(0, Math.max(0, maxSpikar - userSpikIndices.length))
        .map((item) => item.idx),
    ];

    let improved = true;
    while (improved) {
      improved = false;
      let bestLeg = -1;
      let bestBenefit = -1;

      for (let i = 0; i < legsCount; i++) {
        const currentCount = allocation[i];
        if (currentCount >= scoredLegs[i].length) continue;

        if (userSpikIndices.includes(i)) continue;

        if (spikIndices.includes(i) && currentCount === 1) {
          const anyOtherCanGrow = allocation.some(
            (c, oIdx) => !spikIndices.includes(oIdx) && c < scoredLegs[oIdx].length
          );
          if (anyOtherCanGrow) continue;
        }

        const nextRows = (currentRows / currentCount) * (currentCount + 1);
        if (nextRows <= targetRows) {
          const nextHorse = scoredLegs[i][currentCount];
          const horseScore = nextHorse ? Math.max(0.1, nextHorse.score) : 0.1;
          const benefit = (openness[i] + 0.5) * horseScore;

          if (benefit > bestBenefit) {
            bestBenefit = benefit;
            bestLeg = i;
          }
        }
      }

      if (bestLeg !== -1) {
        currentRows = (currentRows / allocation[bestLeg]) * (allocation[bestLeg] + 1);
        allocation[bestLeg]++;
        improved = true;
      }
    }

    return allocation;
  }

  private pickHorsesForLeg(
    scoredList: ScoredHorse[],
    count: number,
    legIdx: number,
    config: JanneBoyConfig
  ): JanneBoyHorsePick[] {
    const lockedIds = config.lockedHorses?.[legIdx] || [];
    const lockedPicks = scoredList.filter((s) => lockedIds.includes(s.horse.id));
    const nonLockedPicks = scoredList.filter((s) => !lockedIds.includes(s.horse.id));

    const combined = [
      ...lockedPicks,
      ...nonLockedPicks.slice(0, Math.max(0, count - lockedPicks.length)),
    ];

    return combined.slice(0, count).map((s) => ({
      id: s.horse.id,
      startNumber: s.horse.startNumber,
      name: s.horse.name,
      driverName: s.horse.driverName,
      trainerName: s.horse.trainerName,
      betDistribution: s.horse.betDistribution,
      winOdds: s.horse.winOdds,
      isSpikCandidate: s.analysis.isSolidSpik,
      isValueCandidate: s.analysis.isHighValueSkrall,
      score: Number(s.score.toFixed(1)),
      postPosition: s.horse.postPosition || s.horse.startNumber,
      shoeInfo: s.analysis.shoeInfo,
      sulkyInfo: s.analysis.sulkyInfo,
      impliedProbability: Math.round(s.analysis.impliedWinProb * 100),
      valueRatio: s.analysis.valueRatio,
      spikQualityScore: s.analysis.spikScore,
      skrallPotentialScore: s.analysis.skrallScore,
      careAnalysis: s.analysis.travSummary,
    }));
  }

  private createLegReason(
    selected: JanneBoyHorsePick[],
    isSpik: boolean,
    strategy: JanneBoyStrategy
  ): string {
    const horse = selected[0];
    const name = horse.name || `nr ${horse.startNumber}`;

    if (isSpik) {
      if (horse.careAnalysis) return horse.careAnalysis;
      if (strategy === 'miljondrag') {
        return `Fräck spik på ${name}! Bra spelvärde (${horse.valueRatio || 1}x) och underskattad i loppet.`;
      }
      return `Omsorgsfullt vald spik! ${name} har bästa förutsättningarna med ${horse.shoeInfo?.toLowerCase() || 'bra balans'}.`;
    }

    const valueHorse = selected.find((h) => h.isValueCandidate);
    if (valueHorse) {
      return `Garderas (${selected.length} hästar). Öppet lopp där ${valueHorse.name || `nr ${valueHorse.startNumber}`} är ett högintressant speldrag med spelvärde ${valueHorse.valueRatio}x!`;
    }

    return `Garderas med ${selected.length} hästar. Jämnt lopp där strecken fördelas mellan de mest betrodda ekipagen.`;
  }
}
