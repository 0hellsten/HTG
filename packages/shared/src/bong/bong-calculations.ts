import {
  BongRaceDayData,
  CouponSelection,
  BongCalculationResult,
  ReducedSingleRow,
  HorseValueMetric,
  PayoutDistribution,
  HorseRank,
  BongHorseInput,
} from '../types/bong.js';
import { GameConfig } from './constants.js';

export interface InternalHorseCandidate {
  legIndex: number;
  horseId: string;
  startNumber: number;
  rank: HorseRank;
  betDistribution: number;
  streckPercent: number;
  kravgruppIndices: number[];
}

export function calculatePayoutDistribution(rows: ReducedSingleRow[]): PayoutDistribution {
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

export function calculateValueMetrics(
  config: GameConfig,
  legs: InternalHorseCandidate[][]
): HorseValueMetric[] {
  const metrics: HorseValueMetric[] = [];
  const seen = new Set<string>();

  for (const leg of legs) {
    for (const h of leg) {
      if (seen.has(h.horseId)) continue;
      seen.add(h.horseId);

      const winOdds = 1.0 / Math.max(0.005, h.betDistribution);
      const implicitProbability = Number((config.vinnarPayback / winOdds).toFixed(4));
      const valueRatio = Number((implicitProbability / h.betDistribution).toFixed(2));

      let assessment: HorseValueMetric['assessment'] = 'fair';
      if (valueRatio > 1.15) {
        assessment = 'undervalued';
      } else if (valueRatio < 0.85) {
        assessment = 'overvalued';
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

export function resolveLegCandidates(
  config: GameConfig,
  raceDay: BongRaceDayData,
  selection: CouponSelection
): InternalHorseCandidate[][] {
  const result: InternalHorseCandidate[][] = [];
  const legsMap = new Map<number, BongHorseInput[]>();

  for (const race of raceDay.races) {
    legsMap.set(race.legIndex, race.horses);
  }

  for (let legIdx = 0; legIdx < config.legsCount; legIdx++) {
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

    if (scratchedSelected.length > 0) {
      const selectedIds = new Set(activeHorses.map((h) => h.horseId));
      let reservesToUse: BongHorseInput[] = [];

      if (legSel.reserves === 'AUTO' || !legSel.reserves) {
        reservesToUse = allHorsesInLeg
          .filter((h) => !h.scratched && !selectedIds.has(h.id))
          .sort((a, b) => b.betDistribution - a.betDistribution);
      } else if (Array.isArray(legSel.reserves)) {
        reservesToUse = legSel.reserves
          .map((resId) =>
            allHorsesInLeg.find((h) => h.id === resId || String(h.startNumber) === resId)
          )
          .filter((h): h is BongHorseInput => Boolean(h && !h.scratched && !selectedIds.has(h.id)));
      }

      let reserveIdx = 0;
      for (let s = 0; s < scratchedSelected.length && reserveIdx < reservesToUse.length; s++) {
        const reserveHorse = reservesToUse[reserveIdx++];
        activeHorses.push({
          legIndex: legIdx,
          horseId: reserveHorse.id,
          startNumber: reserveHorse.startNumber,
          rank: 'B',
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

export function exportToStandardFormat(
  config: GameConfig,
  result: BongCalculationResult
): {
  toRows: () => number[][];
  toCsv: (delimiter?: string) => string;
  toAtgFilformat: () => string;
} {
  const rows = result.rows.map((r) => r.horses.map((h) => h.startNumber));

  return {
    toRows: () => rows,
    toCsv: (delimiter = ',') => rows.map((r) => r.join(delimiter)).join('\n'),
    toAtgFilformat: () => {
      const header = `${config.gameType},${result.flerbongMultiplier},${result.reducedRows}`;
      const lines = rows.map((r) => r.join(','));
      return [header, ...lines].join('\n');
    },
  };
}
