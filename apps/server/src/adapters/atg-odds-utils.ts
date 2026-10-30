import Database from 'better-sqlite3';
import { RaceOddsData, HorseOdds } from '@stallbacken/shared';
import { AtgGameResponse } from './atg-odds-schemas.js';

export function normalizeOdds(
  vinnareData: AtgGameResponse,
  markingGameData: AtgGameResponse | null,
  raceId: string,
  nowIso: string
): RaceOddsData {
  const race = vinnareData.races.find((r) => r.id === raceId) || vinnareData.races[0];
  const starts = race?.starts || [];

  const recordedAt = race?.startTime || nowIso;
  const timeFormatted = recordedAt.includes('T')
    ? recordedAt.split('T')[1].slice(0, 5)
    : recordedAt.slice(11, 16) || '–';

  const markingStarts = markingGameData?.races.find((r) => r.id === raceId)?.starts || [];
  const markingMap = new Map<number, number>();

  for (const ms of markingStarts) {
    if (ms.pools) {
      for (const [poolKey, poolVal] of Object.entries(ms.pools)) {
        if (
          poolKey !== 'vinnare' &&
          poolKey !== 'plats' &&
          poolVal &&
          typeof poolVal.betDistribution === 'number'
        ) {
          markingMap.set(ms.number, Math.round((poolVal.betDistribution / 100) * 10) / 10);
          break;
        }
      }
    }
  }

  const odds: HorseOdds[] = starts.map((s) => {
    const vPool = s.pools?.vinnare;
    const pPool = s.pools?.plats;

    const winOdds =
      vPool?.odds !== null && vPool?.odds !== undefined
        ? vPool.odds > 99
          ? Math.round((vPool.odds / 100) * 100) / 100
          : vPool.odds
        : undefined;

    const placeOdds =
      pPool?.minOdds !== null && pPool?.minOdds !== undefined
        ? pPool.minOdds > 99
          ? Math.round((pPool.minOdds / 100) * 100) / 100
          : pPool.minOdds
        : undefined;

    let stakePercent = markingMap.get(s.number);
    if (stakePercent === undefined && s.pools?.streck?.betDistribution !== undefined) {
      const rawDist = s.pools.streck.betDistribution;
      stakePercent = rawDist !== null ? Math.round((rawDist / 100) * 10) / 10 : undefined;
    }

    return {
      startId: `${raceId}_${s.number}`,
      startNumber: s.number,
      winOdds,
      placeOdds,
      stakePercent,
    };
  });

  return {
    raceId,
    recordedAt,
    timeFormatted,
    gameType: markingGameData?.type || 'Vinnare',
    odds,
  };
}

export function syncOddsToStarts(db: Database.Database, oddsData: RaceOddsData): void {
  const stmt = db.prepare(`
    UPDATE starts
    SET win_odds = COALESCE(?, win_odds),
        stake_percent = COALESCE(?, stake_percent),
        updated_at = datetime('now')
    WHERE race_id = ? AND start_number = ?
  `);

  const updateMany = db.transaction(() => {
    for (const h of oddsData.odds) {
      stmt.run(h.winOdds || null, h.stakePercent || null, oddsData.raceId, h.startNumber);
    }
  });

  try {
    updateMany();
  } catch {}
}
