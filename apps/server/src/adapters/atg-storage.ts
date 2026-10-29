// Databaslagring för ATG:s kalender och lopp
// Privat, icke-kommersiell användning. Ingen vidarespridning av data.

import Database from 'better-sqlite3';
import { AtgCalendarDay, AtgRaceDetail } from './atg-schemas.js';
import { upsertTrack, upsertRaceDay } from '../db/queries/tracks.js';
import {
  upsertRace,
  upsertHorse,
  upsertPerson,
  upsertStart,
} from '../db/queries/races.js';

/**
 * Sparar ATG:s kalenderdata (banor, tävlingsdagar och lopp) i SQLite.
 */
export function saveCalendarToDb(
  db: Database.Database,
  data: AtgCalendarDay,
  sourceId: string,
  nowIso: string
): void {
  const { date, tracks, games, races } = data;

  // Spara banor
  for (const track of tracks) {
    upsertTrack(db, {
      id: track.id,
      name: track.name,
      country: track.countryCode || 'SE',
      sourceId,
      fetchedAt: nowIso,
    });

    // Hitta eventuell huvudspelform
    let biggestGame: string | undefined;
    for (const [gameType, gameList] of Object.entries(games)) {
      if (gameList.some((g) => g.trackId === track.id)) {
        biggestGame = gameType;
        break;
      }
    }

    const raceDayId = `${date}_${track.id}`;
    const firstRace = races.find((r) => r.track?.id === track.id);

    upsertRaceDay(db, {
      id: raceDayId,
      date,
      trackId: track.id,
      biggestGame,
      firstStart: firstRace?.startTime ? firstRace.startTime.slice(11, 16) : undefined,
      sourceId,
      fetchedAt: nowIso,
    });
  }

  // Spara loppreferenser
  for (const r of races) {
    if (!r.track) continue;
    const raceDayId = `${date}_${r.track.id}`;
    upsertRace(db, {
      id: r.id,
      raceDayId,
      number: r.number,
      name: r.name,
      distanceM: r.distance,
      startMethod: r.startMethod === 'volt' ? 'volt' : 'auto',
      scheduledStart: r.startTime,
      status: 'kommande',
      sourceId,
      fetchedAt: nowIso,
    });
  }
}

/**
 * Sparar loppdetaljer med samtliga startande ekipage i SQLite.
 */
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

  upsertRace(db, {
    id: data.id,
    raceDayId,
    number: data.number,
    name: data.name,
    distanceM: data.distance,
    startMethod: data.startMethod === 'volt' ? 'volt' : 'auto',
    purse: data.purse,
    terms: data.terms,
    scheduledStart: data.startTime,
    status: data.status === 'avgjort' ? 'avgjort' : 'kommande',
    trackCondition: data.track?.condition,
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
    upsertPerson(db, {
      id: s.horse.trainer.id,
      name: s.horse.trainer.name || 'Okänd tränare',
      role: 'tränare',
      sourceId,
      fetchedAt: nowIso,
    });
  }

  if (s.driver && s.driver.id) {
    upsertPerson(db, {
      id: s.driver.id,
      name: s.driver.name || 'Okänd kusk',
      role: 'kusk',
      sourceId,
      fetchedAt: nowIso,
    });
  }

  upsertHorse(db, {
    id: s.horse.id,
    name: s.horse.name,
    sex: s.horse.sex,
    color: s.horse.color,
    trainerId: s.horse.trainer?.id,
    owner: s.horse.owner?.name,
    earningsTotal: s.horse.money,
    recordAuto: s.horse.records?.auto,
    recordVolt: s.horse.records?.volt,
    sourceId,
    fetchedAt: nowIso,
  });

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
    shoesFront: s.shoes?.front?.hasShoe,
    shoesBack: s.shoes?.back?.hasShoe,
    shoesChanged: s.shoes?.front?.changed || s.shoes?.back?.changed,
    sulkyType: s.sulky?.type?.text,
    sulkyColor: s.sulky?.color,
    scratched: s.scratched,
    scratchReason: s.scratchReason,
    sourceId,
    fetchedAt: nowIso,
  });
}
