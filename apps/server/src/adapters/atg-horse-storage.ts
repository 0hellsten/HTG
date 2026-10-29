// Databaslagring för ATG:s hästprofil och historik
// Privat, icke-kommersiell användning. Ingen vidarespridning av data.

import Database from 'better-sqlite3';
import { HorsePastStart } from '@stallbacken/shared';
import { AtgHorseProfile, AtgHorseResults, AtgKmTimeSchema } from './atg-schemas.js';
import { upsertHorse, upsertPerson } from '../db/queries/horses.js';
import { saveHorseResults } from '../db/queries/horse-results.js';
import { z } from 'zod';

type AtgKmTime = z.infer<typeof AtgKmTimeSchema>;

export function formatAtgKmTime(kmTime?: AtgKmTime | null, startMethod?: string): string | undefined {
  if (!kmTime || kmTime.seconds === undefined) return undefined;
  const mins = kmTime.minutes ?? 1;
  const secs = String(kmTime.seconds).padStart(2, '0');
  const tenths = kmTime.tenths ?? 0;
  const suffix = (startMethod === 'auto' || startMethod === 'a') ? 'a' : '';
  return `${mins}.${secs},${tenths}${suffix}`;
}

export function saveHorseProfileToDb(
  db: Database.Database,
  profile: AtgHorseProfile,
  sourceId: string,
  nowIso: string
): void {
  const life = profile.statistics?.life;
  const placements = life?.placement || {};
  const wins = placements['1'] ?? 0;
  const seconds = placements['2'] ?? 0;
  const thirds = placements['3'] ?? 0;

  // Hitta bästa tider från life.records
  let recordAuto: string | undefined;
  let recordVolt: string | undefined;
  if (life?.records) {
    for (const rec of life.records) {
      const formatted = formatAtgKmTime(rec.time, rec.startMethod);
      if (rec.startMethod === 'auto' && (!recordAuto || (formatted && formatted < recordAuto))) {
        recordAuto = formatted;
      } else if (rec.startMethod !== 'auto' && (!recordVolt || (formatted && formatted < recordVolt))) {
        recordVolt = formatted;
      }
    }
  }

  // Tränare
  if (profile.trainer?.id) {
    const trainerName = profile.trainer.name ||
      [profile.trainer.firstName, profile.trainer.lastName].filter(Boolean).join(' ') ||
      'Tränare';
    upsertPerson(db, {
      id: profile.trainer.id,
      name: trainerName,
      role: 'tränare',
      license: profile.trainer.license,
      sourceId,
      fetchedAt: nowIso,
    });
  }

  const earningsTotal = profile.money || (life?.earnings ? Math.round(life.earnings / 100) : 0);
  const starts = life?.starts ?? 0;
  const winPercent = life?.winPercentage ? Math.round(life.winPercentage / 100) : 0;
  const placePercent = life?.placePercentage ? Math.round(life.placePercentage / 100) : 0;
  const earningsPerStart = life?.earningsPerStart ? Math.round(life.earningsPerStart / 100) : (starts > 0 ? Math.round(earningsTotal / starts) : 0);

  const currentYear = new Date().getFullYear();
  const birthYear = profile.age ? currentYear - profile.age : undefined;

  upsertHorse(db, {
    id: profile.id,
    name: profile.name,
    birthYear,
    sex: profile.sex,
    color: profile.color,
    breed: profile.breed,
    trainerId: profile.trainer?.id,
    owner: profile.owner?.name,
    breeder: profile.breeder?.name,
    homeTrack: profile.homeTrack?.name,
    sireName: profile.pedigree?.father?.name,
    damName: profile.pedigree?.mother?.name,
    damsireName: profile.pedigree?.grandfather?.name,
    earningsTotal,
    recordAuto,
    recordVolt,
    starts,
    wins,
    seconds,
    thirds,
    winPercentage: winPercent,
    placePercentage: placePercent,
    earningsPerStart,
    sourceId,
    fetchedAt: nowIso,
  });
}

export function saveHorseResultsToDb(
  db: Database.Database,
  horseId: string,
  resultsData: AtgHorseResults,
  sourceId: string,
  nowIso: string
): HorsePastStart[] {
  const converted: HorsePastStart[] = [];

  for (const rec of resultsData.records) {
    const raceType = rec.race?.type === 'qualifier' ? 'qualifier' : 'regular';
    const rawStartMethod = rec.race?.startMethod;
    const startMethod = (rawStartMethod === 'volte' || rawStartMethod === 'volt') ? 'volt' : 'auto';
    const raceNumber = rec.race?.number ?? 1;
    const id = `${horseId}_${rec.date}_${raceNumber}`;

    // Odds: om odds är t.ex. 746 innebär det 7.46
    let odds: number | undefined;
    if (rec.odds !== null && rec.odds !== undefined) {
      odds = rec.odds > 99 ? Math.round((rec.odds / 100) * 10) / 10 : rec.odds;
    }

    // Skor
    let shoesFront: boolean | undefined;
    let shoesBack: boolean | undefined;
    if (rec.start?.horse?.shoes) {
      const sf = rec.start.horse.shoes.front;
      const sb = rec.start.horse.shoes.back;
      shoesFront = typeof sf === 'boolean' ? sf : sf?.hasShoe;
      shoesBack = typeof sb === 'boolean' ? sb : sb?.hasShoe;
    }

    // Förstapris: i öre hos ATG (3 500 000 öre = 35 000 kr)
    let firstPrize = rec.race?.firstPrize || 0;
    if (firstPrize > 100000) {
      firstPrize = Math.round(firstPrize / 100);
    }

    // Kusk
    const driver = rec.start?.driver;
    const driverName = driver
      ? [driver.firstName, driver.lastName].filter(Boolean).join(' ') || driver.shortName
      : undefined;

    const kmTime = formatAtgKmTime(rec.kmTime, startMethod);

    converted.push({
      id,
      horseId,
      date: rec.date,
      trackName: rec.track.name,
      raceNumber: rec.race?.number,
      raceType,
      startMethod,
      distanceM: rec.start?.distance || 2140,
      postPosition: rec.start?.postPosition,
      driverName,
      place: rec.place,
      kmTime,
      odds,
      shoesFront,
      shoesBack,
      sulkyType: rec.start?.horse?.sulky?.type?.text,
      firstPrize,
    });
  }

  saveHorseResults(db, horseId, converted, sourceId, nowIso);
  return converted;
}
