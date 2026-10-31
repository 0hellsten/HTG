import {
  BongGameType,
  BongRaceDayData,
  CouponSelection,
  BongCalculationResult,
  ReducedSingleRow,
  AbcdCondition,
  KravGruppCondition,
} from '../types/bong.js';
import { getGameConfig, GameConfig } from './constants.js';
import {
  InternalHorseCandidate,
  calculatePayoutDistribution,
  calculateValueMetrics,
  resolveLegCandidates,
  exportToStandardFormat,
} from './bong-calculations.js';

export class BongEngine {
  private config: GameConfig;

  constructor(gameType: BongGameType) {
    this.config = getGameConfig(gameType);
  }

  getGameConfig(): GameConfig {
    return this.config;
  }

  calculate(raceDay: BongRaceDayData, selection: CouponSelection): BongCalculationResult {
    const config = this.config;
    const settings = selection.settings || {};
    const flerbongMultiplier = Math.max(1, Math.floor(settings.flerbongMultiplier || 1));
    const sharesCount = Math.max(1, Math.floor(settings.sharesCount || 1));
    const onlyTopPool = Boolean(settings.onlyTopPool);
    const actualLegsCount = raceDay.races.length > 0 ? raceDay.races.length : config.legsCount;

    const resolvedLegs = resolveLegCandidates(config, raceDay, selection);
    const mathRows = this.calculateMathRows(resolvedLegs);

    if (mathRows === 0 || resolvedLegs.length !== actualLegsCount) {
      return this.buildEmptyResult(mathRows, flerbongMultiplier, sharesCount, onlyTopPool);
    }

    const activeKravgrupper = selection.conditions?.kravgrupper || [];
    const abcdConditions = selection.conditions?.abcd || [];
    const streckFilter = selection.conditions?.strecksumma;
    const payoutFilter = selection.conditions?.payout;

    for (let legIdx = 0; legIdx < resolvedLegs.length; legIdx++) {
      for (const candidate of resolvedLegs[legIdx]) {
        candidate.kravgruppIndices = [];
        for (let gIdx = 0; gIdx < activeKravgrupper.length; gIdx++) {
          const group = activeKravgrupper[gIdx];
          const isMember = group.horses.some(
            (h) => h.legIndex === legIdx && h.horseId === candidate.horseId
          );
          if (isMember) {
            candidate.kravgruppIndices.push(gIdx);
          }
        }
      }
    }

    const reducedRows: ReducedSingleRow[] = [];
    const currentRow: InternalHorseCandidate[] = new Array(actualLegsCount);
    const groupHits = new Int32Array(activeKravgrupper.length);
    const rankCounts = { A: 0, B: 0, C: 0, D: 0, Unranked: 0 };

    const topPoolPot =
      raceDay.turnover * config.netPrizePoolFactor * config.topPoolShare +
      (raceDay.jackpotPool || 0);
    const totalCouponRowsPlayed = raceDay.turnover / config.radpris;
    const payoutFactor = topPoolPot / totalCouponRowsPlayed;
    const vMultiplier = onlyTopPool ? config.vMultiplier : 1.0;

    this.searchReducedRows({
      legIndex: 0,
      legs: resolvedLegs,
      currentRow,
      rankCounts,
      groupHits,
      accumulatedProbability: 1.0,
      accumulatedStrecksumma: 0,
      reducedRows,
      activeKravgrupper,
      abcdConditions,
      streckFilter,
      payoutFilter,
      payoutFactor,
      vMultiplier,
    });

    const reducedCount = reducedRows.length;
    const reductionPercentage =
      mathRows > 0 ? Number((((mathRows - reducedCount) / mathRows) * 100).toFixed(1)) : 0;
    const totalCost = Number((reducedCount * config.radpris * flerbongMultiplier).toFixed(2));
    const costPerShare = Number((totalCost / sharesCount).toFixed(2));

    return {
      gameType: config.gameType,
      legsCount: config.legsCount,
      mathRows,
      reducedRows: reducedCount,
      reductionPercentage,
      totalCost,
      costPerShare,
      radpris: config.radpris,
      flerbongMultiplier,
      sharesCount,
      onlyTopPool,
      payoutDistribution: calculatePayoutDistribution(reducedRows),
      valueMetrics: calculateValueMetrics(config, resolvedLegs),
      rows: reducedRows,
    };
  }

  private searchReducedRows(ctx: {
    legIndex: number;
    legs: InternalHorseCandidate[][];
    currentRow: InternalHorseCandidate[];
    rankCounts: { A: number; B: number; C: number; D: number; Unranked: number };
    groupHits: Int32Array;
    accumulatedProbability: number;
    accumulatedStrecksumma: number;
    reducedRows: ReducedSingleRow[];
    activeKravgrupper: KravGruppCondition[];
    abcdConditions: AbcdCondition[];
    streckFilter?: { minSum?: number; maxSum?: number };
    payoutFilter?: { minPayout?: number; maxPayout?: number };
    payoutFactor: number;
    vMultiplier: number;
  }): void {
    const { legIndex, legs, currentRow, rankCounts, groupHits, reducedRows } = ctx;
    const config = this.config;

    if (legIndex === config.legsCount) {
      if (!this.passesAbcdFilters(rankCounts, ctx.abcdConditions)) return;
      if (!this.passesKravgrupper(groupHits, ctx.activeKravgrupper)) return;
      if (ctx.streckFilter) {
        if (
          ctx.streckFilter.minSum !== undefined &&
          ctx.accumulatedStrecksumma < ctx.streckFilter.minSum
        )
          return;
        if (
          ctx.streckFilter.maxSum !== undefined &&
          ctx.accumulatedStrecksumma > ctx.streckFilter.maxSum
        )
          return;
      }

      const pAll = Math.max(1e-12, ctx.accumulatedProbability);
      let estimatedPayout = (1 / pAll) * ctx.payoutFactor * ctx.vMultiplier;
      estimatedPayout = Math.max(10, Math.round(estimatedPayout));

      if (ctx.payoutFilter) {
        if (
          ctx.payoutFilter.minPayout !== undefined &&
          estimatedPayout < ctx.payoutFilter.minPayout
        )
          return;
        if (
          ctx.payoutFilter.maxPayout !== undefined &&
          estimatedPayout > ctx.payoutFilter.maxPayout
        )
          return;
      }

      reducedRows.push({
        horses: currentRow.map((c) => ({
          legIndex: c.legIndex,
          horseId: c.horseId,
          startNumber: c.startNumber,
          rank: c.rank,
          betDistribution: c.betDistribution,
        })),
        strecksumma: Math.round(ctx.accumulatedStrecksumma),
        productDistribution: pAll,
        estimatedPayout,
      });
      return;
    }

    const currentLegCandidates = legs[legIndex];
    for (let i = 0; i < currentLegCandidates.length; i++) {
      const candidate = currentLegCandidates[i];

      currentRow[legIndex] = candidate;
      rankCounts[candidate.rank]++;
      for (const gIdx of candidate.kravgruppIndices) {
        groupHits[gIdx]++;
      }

      const nextProb = ctx.accumulatedProbability * candidate.betDistribution;
      const nextStreck = ctx.accumulatedStrecksumma + candidate.streckPercent;

      this.searchReducedRows({
        ...ctx,
        legIndex: legIndex + 1,
        accumulatedProbability: nextProb,
        accumulatedStrecksumma: nextStreck,
      });

      rankCounts[candidate.rank]--;
      for (const gIdx of candidate.kravgruppIndices) {
        groupHits[gIdx]--;
      }
    }
  }

  private passesAbcdFilters(
    rankCounts: { A: number; B: number; C: number; D: number; Unranked: number },
    conditions: AbcdCondition[]
  ): boolean {
    for (const cond of conditions) {
      const count = rankCounts[cond.rank];
      if (cond.min !== undefined && count < cond.min) return false;
      if (cond.max !== undefined && count > cond.max) return false;
    }
    return true;
  }

  private passesKravgrupper(groupHits: Int32Array, groups: KravGruppCondition[]): boolean {
    for (let i = 0; i < groups.length; i++) {
      const g = groups[i];
      const hits = groupHits[i];
      if (hits < g.min) return false;
      if (g.max !== undefined && hits > g.max) return false;
    }
    return true;
  }

  private calculateMathRows(legs: InternalHorseCandidate[][]): number {
    if (legs.length === 0) return 0;
    let count = 1;
    for (const leg of legs) {
      if (leg.length === 0) return 0;
      count *= leg.length;
    }
    return count;
  }

  exportToStandardFormat(result: BongCalculationResult): {
    toRows: () => number[][];
    toCsv: (delimiter?: string) => string;
    toAtgFilformat: () => string;
  } {
    return exportToStandardFormat(this.config, result);
  }

  private buildEmptyResult(
    mathRows: number,
    flerbongMultiplier: number,
    sharesCount: number,
    onlyTopPool: boolean
  ): BongCalculationResult {
    return {
      gameType: this.config.gameType,
      legsCount: this.config.legsCount,
      mathRows,
      reducedRows: 0,
      reductionPercentage: 0,
      totalCost: 0,
      costPerShare: 0,
      radpris: this.config.radpris,
      flerbongMultiplier,
      sharesCount,
      onlyTopPool,
      payoutDistribution: {
        minPayout: 0,
        medianPayout: 0,
        maxPayout: 0,
        histogram: { under1k: 0, from1kTo10k: 0, from10kTo100k: 0, over100k: 0 },
      },
      valueMetrics: [],
      rows: [],
    };
  }
}
