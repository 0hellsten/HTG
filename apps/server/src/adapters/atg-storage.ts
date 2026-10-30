import Database from 'better-sqlite3';
import { AtgCalendarDay, AtgRaceDetail } from './atg-schemas.js';
import { upsertTrack, upsertRaceDay } from '../db/queries/tracks.js';
import { upsertRace, upsertHorse, upsertPerson, upsertStart } from '../db/queries/races.js';
import { formatAtgKmTime } from './atg-horse-storage.js';

export function mapSwedishSex(raw?: string): string | undefined {
  if (!raw) return undefined;
  const lower = raw.toLowerCase();
  if (lower === 'gelding' || lower === 'valack') return 'Valack';
  if (lower === 'mare' || lower === 'filly' || lower === 'sto') return 'Sto';
  if (lower === 'stallion' || lower === 'colt' || lower === 'hingst') return 'Hingst';
  return raw;
}

export function mapSwedishTrackCondition(raw?: string): string | undefined {
  if (!raw) return undefined;
  const lower = raw.toLowerCase();
  if (lower === 'light' || lower === 'lätt bana') return 'Lätt bana';
  if (lower === 'heavy' || lower === 'tung bana') return 'Tung bana';
  if (lower === 'winter' || lower === 'vinterbana') return 'Vinterbana';
  if (lower === 'good' || lower === 'god') return 'God bana';
  if (lower === 'muddy' || lower === 'lerig') return 'Något tung bana';
  return raw;
}

export function mapSwedishSulky(raw?: string): string | undefined {
  if (!raw) return undefined;
  const lower = raw.toLowerCase();
  if (lower.includes('amerikansk') || lower === 'american' || lower === 'custom') return 'Amerikansk sulky';
  if (lower.includes('vanlig') || lower === 'regular' || lower === 'standard') return 'Vanlig vagn';
  return raw;
}

export function saveCalendarToDb(
  db: Database.Database,
  data: AtgCalendarDay,
  sourceId: string,
  nowIso: string
): void {
  const { date, tracks, games, races } = data;

  const sortedTracks = [...tracks].sort((a, b) => {
    const aSe = a.countryCode === 'SE' ? 0 : 1;
    const bSe = b.countryCode === 'SE' ? 0 : 1;
    return aSe - bSe;
  });

  for (const track of sortedTracks) {
    upsertTrack(db, {
      id: track.id,
      name: track.name,
      country: track.countryCode || 'SE',
      sourceId,
      fetchedAt: nowIso,
    });

    let biggestGame: string | undefined = track.biggestGameType;
    if (!biggestGame) {
      for (const [gameType, gameList] of Object.entries(games)) {
        if (
          gameList.some(
            (g) => g.trackId === track.id || (g.tracks && g.tracks.includes(track.id))
          )
        ) {
          biggestGame = gameType;
          break;
        }
      }
    }

    const raceDayId = `${date}_${track.id}`;
    const trackRaces = track.races || [];
    const firstRace = trackRaces[0] || races.find((r) => r.track?.id === track.id);
    const firstStartTime = track.startTime || firstRace?.startTime;

    upsertRaceDay(db, {
      id: raceDayId,
      date,
      trackId: track.id,
      biggestGame,
      firstStart: firstStartTime ? firstStartTime.slice(11, 16) : undefined,
      sourceId,
      fetchedAt: nowIso,
    });

    for (const r of trackRaces) {
      const scheduledStart = r.startTime || nowIso;
      const status = r.status || (scheduledStart < nowIso ? 'klar' : 'kommande');

      upsertRace(db, {
        id: r.id,
        raceDayId,
        number: r.number,
        name: r.name || `Lopp ${r.number}`,
        distanceM: r.distance || 2140,
        startMethod: r.startMethod === 'volt' ? 'volt' : 'auto',
        scheduledStart,
        status,
        sourceId,
        fetchedAt: nowIso,
      });
    }
  }

  for (const r of races) {
    if (!r.track) continue;
    const raceDayId = `${date}_${r.track.id}`;
    const scheduledStart = r.startTime || nowIso;
    const status = r.status || (scheduledStart < nowIso ? 'klar' : 'kommande');

    upsertRace(db, {
      id: r.id,
      raceDayId,
      number: r.number,
      name: r.name,
      distanceM: r.distance,
      startMethod: r.startMethod === 'volt' ? 'volt' : 'auto',
      scheduledStart,
      status,
      sourceId,
      fetchedAt: nowIso,
    });
  }
}

export function saveRaceDetailToDb(
  db: Database.Database,
  data: AtgRaceDetail,
  sourceId: string,
  nowIso: string
): void {
  const raceIdParts = data.id.split('_');
  const date = raceIdParts[0];
  const trackId = raceIdParts[1] || '1';
  const raceDayId = `${date}_${trackId}`;

  if (data.track) {
    upsertTrack(db, {
      id: data.track.id,
      name: data.track.name,
      country: data.track.countryCode || 'SE',
      sourceId,
      fetchedAt: nowIso,
    });

    upsertRaceDay(db, {
      id: raceDayId,
      date,
      trackId: data.track.id,
      sourceId,
      fetchedAt: nowIso,
    });
  }

  const scheduledStart = data.scheduledStartTime || data.startTime;
  const status =
    data.status === 'completed' || data.status === 'results' || data.status === 'avgjort'
      ? 'avgjort'
      : scheduledStart < nowIso
        ? 'klar'
        : 'kommande';

  upsertRace(db, {
    id: data.id,
    raceDayId,
    number: data.number,
    name: data.name,
    distanceM: data.distance,
    startMethod: data.startMethod === 'volt' || data.startMethod === 'volte' ? 'volt' : 'auto',
    purse: data.prize || data.purse,
    terms: data.terms,
    scheduledStart,
    status,
    trackCondition: mapSwedishTrackCondition(data.track?.condition),
    sourceId,
    fetchedAt: nowIso,
  });

  for (const s of data.starts) {
    saveEquipage(db, s, data.id, data.distance, sourceId, nowIso);
  }
}

function saveEquipage(
  db: Database.Database,
  s: AtgRaceDetail['starts'][number],
  raceId: string,
  raceDistance: number,
  sourceId: string,
  nowIso: string
): void {
  if (s.horse.trainer && s.horse.trainer.id) {
    const trainerName =
      s.horse.trainer.name ||
      [s.horse.trainer.firstName, s.horse.trainer.lastName].filter(Boolean).join(' ') ||
      'Okänd tränare';
    upsertPerson(db, {
      id: s.horse.trainer.id,
      name: trainerName,
      role: 'tränare',
      sourceId,
      fetchedAt: nowIso,
    });
  }

  if (s.driver && s.driver.id) {
    const driverName =
      s.driver.name ||
      [s.driver.firstName, s.driver.lastName].filter(Boolean).join(' ') ||
      'Okänd kusk';
    upsertPerson(db, {
      id: s.driver.id,
      name: driverName,
      role: 'kusk',
      sourceId,
      fetchedAt: nowIso,
    });
  }

  let recordAuto = s.horse.records?.auto;
  let recordVolt = s.horse.records?.volt;

  if (s.horse.record?.time) {
    const recFormatted = formatAtgKmTime(s.horse.record.time, s.horse.record.startMethod);
    if (s.horse.record.startMethod === 'auto' && !recordAuto) {
      recordAuto = recFormatted;
    } else if (s.horse.record.startMethod !== 'auto' && !recordVolt) {
      recordVolt = recFormatted;
    }
  }

  const lifeStats = s.horse.statistics?.life;
  if (lifeStats?.records) {
    for (const rec of lifeStats.records) {
      const formatted = formatAtgKmTime(rec.time, rec.startMethod);
      if (rec.startMethod === 'auto' && (!recordAuto || (formatted && formatted < recordAuto))) {
        recordAuto = formatted;
      } else if (
        rec.startMethod !== 'auto' &&
        (!recordVolt || (formatted && formatted < recordVolt))
      ) {
        recordVolt = formatted;
      }
    }
  }

  const earningsTotal =
    s.horse.money || (lifeStats?.earnings ? Math.round(lifeStats.earnings / 100) : undefined);
  const startsCount = lifeStats?.starts;
  const winsCount = lifeStats?.placement ? lifeStats.placement['1'] : undefined;
  const secondsCount = lifeStats?.placement ? lifeStats.placement['2'] : undefined;
  const thirdsCount = lifeStats?.placement ? lifeStats.placement['3'] : undefined;
  const winPercent = lifeStats?.winPercentage ? Math.round(lifeStats.winPercentage / 100) : undefined;
  const placePercent = lifeStats?.placePercentage ? Math.round(lifeStats.placePercentage / 100) : undefined;
  const earningsPerStart = lifeStats?.earningsPerStart
    ? Math.round(lifeStats.earningsPerStart / 100)
    : undefined;

  const currentYear = new Date().getFullYear();
  const birthYear = s.horse.age ? currentYear - s.horse.age : undefined;

  upsertHorse(db, {
    id: s.horse.id,
    name: s.horse.name,
    birthYear,
    sex: mapSwedishSex(s.horse.sex),
    color: s.horse.color,
    trainerId: s.horse.trainer?.id,
    owner: s.horse.owner?.name,
    breeder: s.horse.breeder?.name,
    homeTrack: s.horse.homeTrack,
    sireName: s.horse.pedigree?.father?.name,
    damName: s.horse.pedigree?.mother?.name,
    damsireName: s.horse.pedigree?.grandfather?.name,
    earningsTotal,
    recordAuto,
    recordVolt,
    starts: startsCount,
    wins: winsCount,
    seconds: secondsCount,
    thirds: thirdsCount,
    winPercentage: winPercent,
    placePercentage: placePercent,
    earningsPerStart,
    sourceId,
    fetchedAt: nowIso,
  });

  const shoesFront = s.shoes?.front?.hasShoe ?? s.horse.shoes?.front?.hasShoe;
  const shoesBack = s.shoes?.back?.hasShoe ?? s.horse.shoes?.back?.hasShoe;
  const shoesChanged =
    s.shoes?.front?.changed ||
    s.shoes?.back?.changed ||
    s.horse.shoes?.front?.changed ||
    s.horse.shoes?.back?.changed ||
    false;

  const sulkyTypeRaw = s.sulky?.type?.text || s.horse.sulky?.type?.text;
  const sulkyType = mapSwedishSulky(sulkyTypeRaw);
  const sulkyColor = s.sulky?.color || s.horse.sulky?.colour?.text || s.horse.sulky?.color;

  const startId = `${raceId}_${s.number}`;
  upsertStart(db, {
    id: startId,
    raceId,
    horseId: s.horse.id,
    startNumber: s.number,
    postPosition: s.postPosition || s.number,
    distanceM: s.distance || raceDistance || 2140,
    driverId: s.driver?.id,
    trainerId: s.horse.trainer?.id,
    shoesFront,
    shoesBack,
    shoesChanged,
    sulkyType,
    sulkyColor,
    scratched: s.scratched,
    scratchReason: s.scratchReason,
    sourceId,
    fetchedAt: nowIso,
  });
}
