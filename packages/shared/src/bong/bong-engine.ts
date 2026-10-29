// Kärnberäkningsmotor och reduceringssystem för Bong-maskinen (V75 och V86)
import {
  BongGameType,
  BongRaceDayData,
  CouponSelection,
  BongCalculationResult,
  ReducedSingleRow,
  HorseValueMetric,
  PayoutDistribution,
  HorseRank,
  BongHorseInput,
  AbcdCondition,
  KravGruppCondition,
} from '../types/bong.js';
import { getGameConfig, GameConfig } from './constants.js';

interface InternalHorseCandidate {
  legIndex: number;
  horseId: string;
  startNumber: number;
  rank: HorseRank;
  betDistribution: number; // 0.0001 - 1.00
  streckPercent: number; // 0.01 - 100.0
  kravgruppIndices: number[]; // index till aktiva kravgrupper
}

export class BongEngine {
  private config: GameConfig;

  constructor(gameType: BongGameType) {
    this.config = getGameConfig(gameType);
  }

  getGameConfig(): GameConfig {
    return this.config;
  }

  /**
   * Huvudberäkning: Utför validering, strykning, kombinatorik, reducering och utdelningsestimering.
   */
  calculate(raceDay: BongRaceDayData, selection: CouponSelection): BongCalculationResult {
    const config = this.config;
    const settings = selection.settings || {};
    const flerbongMultiplier = Math.max(1, Math.floor(settings.flerbongMultiplier || 1));
    const sharesCount = Math.max(1, Math.floor(settings.sharesCount || 1));
    const onlyTopPool = Boolean(settings.onlyTopPool);

    // 1. Förbered kandidathästar per avdelning med reserv- och strykningshantering
    const resolvedLegs = this.resolveLegCandidates(raceDay, selection);

    // 2. Beräkna matematiska grundrader
    const mathRows = this.calculateMathRows(resolvedLegs);

    // Om någon avdelning saknar giltiga hästar returneras ett tomt resultat
    if (mathRows === 0 || resolvedLegs.length !== config.legsCount) {
      return this.buildEmptyResult(mathRows, flerbongMultiplier, sharesCount, onlyTopPool);
    }

    // 3. Förbered kravgrupper för snabb filtrering
    const activeKravgrupper = selection.conditions?.kravgrupper || [];
    const abcdConditions = selection.conditions?.abcd || [];
    const streckFilter = selection.conditions?.strecksumma;
    const payoutFilter = selection.conditions?.payout;

    // Indexera kravgrupperna
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

    // 4. Exekvera reduceringsmotorn via optimerad sökning med grenbeskärning
    const reducedRows: ReducedSingleRow[] = [];
    const currentRow: InternalHorseCandidate[] = new Array(config.legsCount);
    const groupHits = new Int32Array(activeKravgrupper.length);
    const rankCounts = { A: 0, B: 0, C: 0, D: 0, Unranked: 0 };

    // Förkalkylera fasta pott- och divisor-faktorer för utdelningsformeln
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
      accumulatedSum: 0,
      accumulatedProduct: 1.0,
      abcdConditions,
      activeKravgrupper,
      streckFilter,
      payoutFilter,
      payoutFactor,
      vMultiplier,
      reducedRows,
    });

    // 5. Beräkna sammanfattande ekonomi- och utdelningsstatistik
    const reducedCount = reducedRows.length;
    const reductionPercentage =
      mathRows > 0 ? Number((((mathRows - reducedCount) / mathRows) * 100).toFixed(2)) : 0;
    const totalCost = reducedCount * config.radpris * flerbongMultiplier;
    const costPerShare = Number((totalCost / sharesCount).toFixed(2));

    const payoutDistribution = this.calculatePayoutDistribution(reducedRows);
    const valueMetrics = this.calculateValueMetrics(raceDay, resolvedLegs);

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
      payoutDistribution,
      valueMetrics,
      rows: reducedRows,
    };
  }

  /**
   * Rekursiv dfs-sökning med grenbeskärning (pruning) för blixtsnabb reducering
   */
  private searchReducedRows(ctx: {
    legIndex: number;
    legs: InternalHorseCandidate[][];
    currentRow: InternalHorseCandidate[];
    rankCounts: { A: number; B: number; C: number; D: number; Unranked: number };
    groupHits: Int32Array;
    accumulatedSum: number;
    accumulatedProduct: number;
    abcdConditions: AbcdCondition[];
    activeKravgrupper: KravGruppCondition[];
    streckFilter?: { minSum?: number; maxSum?: number };
    payoutFilter?: { minPayout?: number; maxPayout?: number };
    payoutFactor: number;
    vMultiplier: number;
    reducedRows: ReducedSingleRow[];
  }): void {
    const { legIndex, legs, currentRow, rankCounts, groupHits, reducedRows } = ctx;
    const totalLegs = legs.length;
    const remainingLegs = totalLegs - legIndex;

    // Basfall: Vi har nått slutet på en hel enkelrad
    if (legIndex === totalLegs) {
      // Slutvalidera ABCD min- och max-krav
      if (ctx.abcdConditions) {
        for (const cond of ctx.abcdConditions) {
          const count = rankCounts[cond.rank];
          if (cond.min !== undefined && count < cond.min) return;
          if (cond.max !== undefined && count > cond.max) return;
        }
      }

      // Slutvalidera kravgrupper min-krav
      if (ctx.activeKravgrupper) {
        for (let g = 0; g < ctx.activeKravgrupper.length; g++) {
          const group = ctx.activeKravgrupper[g];
          const hits = groupHits[g];
          if (hits < group.min) return;
          if (group.max !== undefined && hits > group.max) return;
        }
      }

      // Slutvalidera strecksumma min-krav
      if (ctx.streckFilter?.minSum !== undefined && ctx.accumulatedSum < ctx.streckFilter.minSum) {
        return;
      }

      // Beräkna estimerad utdelning
      // Utdelning = (Pott / Totala rader) / produkt(streckprocent) * V-multiplikator
      const rawPayout =
        ctx.accumulatedProduct > 0
          ? (ctx.payoutFactor / ctx.accumulatedProduct) * ctx.vMultiplier
          : 0;
      const estimatedPayout = Math.max(ctx.payoutFactor * ctx.vMultiplier, Math.round(rawPayout));

      // Slutvalidera utdelningsfilter
      if (
        ctx.payoutFilter?.minPayout !== undefined &&
        estimatedPayout < ctx.payoutFilter.minPayout
      ) {
        return;
      }
      if (
        ctx.payoutFilter?.maxPayout !== undefined &&
        estimatedPayout > ctx.payoutFilter.maxPayout
      ) {
        return;
      }

      // Raden godkänd! Spara i resultatet
      reducedRows.push({
        horses: currentRow.map((c) => ({
          legIndex: c.legIndex,
          horseId: c.horseId,
          startNumber: c.startNumber,
          rank: c.rank,
          betDistribution: c.betDistribution,
        })),
        strecksumma: Number(ctx.accumulatedSum.toFixed(2)),
        productDistribution: ctx.accumulatedProduct,
        estimatedPayout,
      });
      return;
    }

    // Grenbeskärning (Pruning): Avbryt grenen tidigt om kraven inte längre kan uppfyllas
    if (ctx.abcdConditions) {
      for (const cond of ctx.abcdConditions) {
        const count = rankCounts[cond.rank];
        // Kan inte nå upp till min
        if (cond.min !== undefined && count + remainingLegs < cond.min) {
          return;
        }
        // Har redan överskridit max
        if (cond.max !== undefined && count > cond.max) {
          return;
        }
      }
    }

    // Beskär kravgrupper som redan överskridit sitt max
    if (ctx.activeKravgrupper) {
      for (let g = 0; g < ctx.activeKravgrupper.length; g++) {
        const group = ctx.activeKravgrupper[g];
        if (group.max !== undefined && groupHits[g] > group.max) {
          return;
        }
      }
    }

    // Beskär om strecksumman redan överskridit maxSum
    if (ctx.streckFilter?.maxSum !== undefined && ctx.accumulatedSum > ctx.streckFilter.maxSum) {
      return;
    }

    // Iterera över alla tillgängliga hästar i aktuell avdelning
    const candidates = legs[legIndex];
    for (let i = 0; i < candidates.length; i++) {
      const h = candidates[i];

      // Uppdatera ackumulerade räknare
      currentRow[legIndex] = h;
      rankCounts[h.rank]++;
      for (let k = 0; k < h.kravgruppIndices.length; k++) {
        groupHits[h.kravgruppIndices[k]]++;
      }

      // Rekursivt anrop till nästa avdelning
      this.searchReducedRows({
        ...ctx,
        legIndex: legIndex + 1,
        accumulatedSum: ctx.accumulatedSum + h.streckPercent,
        accumulatedProduct: ctx.accumulatedProduct * h.betDistribution,
      });

      // Återställ tillstånd (Backtracking)
      rankCounts[h.rank]--;
      for (let k = 0; k < h.kravgruppIndices.length; k++) {
        groupHits[h.kravgruppIndices[k]]--;
      }
    }
  }

  /**
   * Hanterar reserver och strukna hästar per avdelning
   */
  private resolveLegCandidates(
    raceDay: BongRaceDayData,
    selection: CouponSelection
  ): InternalHorseCandidate[][] {
    const result: InternalHorseCandidate[][] = [];
    const legsMap = new Map<number, BongHorseInput[]>();

    for (const r of raceDay.races) {
      legsMap.set(r.legIndex, r.horses);
    }

    for (let legIdx = 0; legIdx < this.config.legsCount; legIdx++) {
      const legSel = selection.legs.find((l) => l.legIndex === legIdx);
      const allHorsesInLeg = legsMap.get(legIdx) || [];
      if (!legSel || legSel.selectedHorseIds.length === 0) {
        result.push([]);
        continue;
      }

      const activeHorses: InternalHorseCandidate[] = [];
      const scratchedSelected: string[] = [];

      for (const horseId of legSel.selectedHorseIds) {
        const found = allHorsesInLeg.find(
          (h) => h.id === horseId || String(h.startNumber) === horseId
        );
        if (found) {
          if (found.scratched) {
            scratchedSelected.push(horseId);
          } else {
            const rank = legSel.ranks?.[horseId] || 'Unranked';
            activeHorses.push({
              legIndex: legIdx,
              horseId: found.id,
              startNumber: found.startNumber,
              rank,
              betDistribution: Math.max(0.0001, found.betDistribution),
              streckPercent: Math.max(0.01, found.betDistribution * 100),
              kravgruppIndices: [],
            });
          }
        }
      }

      // Ersätt strukna hästar med reserver om sådana finns
      if (scratchedSelected.length > 0) {
        const selectedIds = new Set(activeHorses.map((h) => h.horseId));
        let reservesToUse: BongHorseInput[] = [];

        if (legSel.reserves === 'AUTO' || !legSel.reserves) {
          // AUTO: Sortera efter streckprocent bland ospelade och ostrukna hästar
          reservesToUse = allHorsesInLeg
            .filter((h) => !h.scratched && !selectedIds.has(h.id))
            .sort((a, b) => b.betDistribution - a.betDistribution);
        } else if (Array.isArray(legSel.reserves)) {
          // Manuella reserver i ordning
          reservesToUse = legSel.reserves
            .map((resId) =>
              allHorsesInLeg.find((h) => h.id === resId || String(h.startNumber) === resId)
            )
            .filter((h): h is BongHorseInput =>
              Boolean(h && !h.scratched && !selectedIds.has(h.id))
            );
        }

        // Fyll på med reserver för antalet strukna hästar
        let reserveIdx = 0;
        for (let s = 0; s < scratchedSelected.length && reserveIdx < reservesToUse.length; s++) {
          const reserveHorse = reservesToUse[reserveIdx++];
          activeHorses.push({
            legIndex: legIdx,
            horseId: reserveHorse.id,
            startNumber: reserveHorse.startNumber,
            rank: 'B', // Reserver klassas som B-häst som standard
            betDistribution: Math.max(0.0001, reserveHorse.betDistribution),
            streckPercent: Math.max(0.01, reserveHorse.betDistribution * 100),
            kravgruppIndices: [],
          });
          selectedIds.add(reserveHorse.id);
        }
      }

      result.push(activeHorses);
    }

    return result;
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

  private calculatePayoutDistribution(rows: ReducedSingleRow[]): PayoutDistribution {
    if (rows.length === 0) {
      return {
        minPayout: 0,
        medianPayout: 0,
        maxPayout: 0,
        histogram: { under1k: 0, from1kTo10k: 0, from10kTo100k: 0, over100k: 0 },
      };
    }

    const payouts = rows.map((r) => r.estimatedPayout).sort((a, b) => a - b);
    const minPayout = payouts[0];
    const maxPayout = payouts[payouts.length - 1];

    let medianPayout = 0;
    const mid = Math.floor(payouts.length / 2);
    if (payouts.length % 2 === 0) {
      medianPayout = Math.round((payouts[mid - 1] + payouts[mid]) / 2);
    } else {
      medianPayout = payouts[mid];
    }

    const histogram = {
      under1k: 0,
      from1kTo10k: 0,
      from10kTo100k: 0,
      over100k: 0,
    };

    for (let i = 0; i < payouts.length; i++) {
      const p = payouts[i];
      if (p < 1000) {
        histogram.under1k++;
      } else if (p < 10000) {
        histogram.from1kTo10k++;
      } else if (p <= 100000) {
        histogram.from10kTo100k++;
      } else {
        histogram.over100k++;
      }
    }

    return {
      minPayout,
      medianPayout,
      maxPayout,
      histogram,
    };
  }

  private calculateValueMetrics(
    _raceDay: BongRaceDayData,
    legs: InternalHorseCandidate[][]
  ): HorseValueMetric[] {
    const metrics: HorseValueMetric[] = [];
    const seen = new Set<string>();

    for (const leg of legs) {
      for (const h of leg) {
        if (seen.has(h.horseId)) continue;
        seen.add(h.horseId);

        // Standardodds-uppskattning om vinnarodds saknas
        const winOdds = 1.0 / Math.max(0.005, h.betDistribution);
        const implicitProbability = Number((this.config.vinnarPayback / winOdds).toFixed(4));
        const valueRatio = Number((implicitProbability / h.betDistribution).toFixed(2));

        let assessment: HorseValueMetric['assessment'] = 'fair';
        if (valueRatio > 1.15) {
          assessment = 'undervalued'; // Understreckad (högt spelvärde)
        } else if (valueRatio < 0.85) {
          assessment = 'overvalued'; // Överstreckad
        }

        metrics.push({
          horseId: h.horseId,
          startNumber: h.startNumber,
          betDistribution: h.betDistribution,
          winOdds,
          implicitProbability,
          valueRatio,
          assessment,
        });
      }
    }

    return metrics;
  }

  /**
   * Exporterar de reducerade enkelraderna till format kompatibelt med filinlämning
   */
  exportToStandardFormat(result: BongCalculationResult): {
    toRows: () => number[][];
    toCsv: (delimiter?: string) => string;
    toAtgFilformat: () => string;
  } {
    const rows = result.rows.map((r) => r.horses.map((h) => h.startNumber));

    return {
      toRows: () => rows,
      toCsv: (delimiter = ',') => rows.map((r) => r.join(delimiter)).join('\n'),
      toAtgFilformat: () => {
        const header = `${this.config.gameType},${result.flerbongMultiplier},${result.reducedRows}`;
        const lines = rows.map((r) => r.join(','));
        return [header, ...lines].join('\n');
      },
    };
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
