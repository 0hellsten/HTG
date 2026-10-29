// Djup genuin travkunskap, spårstatistik och sannolikhetslära för Janne Boy
// Privat, icke-kommersiell användning. Ingen vidarespridning av data.

import { BongHorseInput, BongRaceLeg } from '../types/bong.js';

export interface HorseProbabilityAnalysis {
  impliedWinProb: number; // 0.001 - 1.00
  valueRatio: number; // P_win / P_streck
  postAdvantage: number; // 0.5 - 1.35
  equipmentBonus: number; // 0.0 - 0.40
  shoeInfo: string;
  sulkyInfo?: string;
  spikScore: number; // 0 - 100
  skrallScore: number; // 0 - 100
  isSolidSpik: boolean;
  isHighValueSkrall: boolean;
  travSummary: string;
}

export function calculatePostAdvantage(
  postPosition?: number,
  startMethod?: 'volt' | 'auto'
): number {
  const spår = postPosition || 1;
  if (startMethod === 'volt') {
    // Voltstart: springspår (6, 7) och innerspår (1, 3) har enorm fördel
    if (spår === 6 || spår === 7) return 1.3;
    if (spår === 1 || spår === 3) return 1.2;
    if (spår === 2) return 0.9;
    if (spår === 4 || spår === 5) return 0.7; // Snäva spår med galopprisk
    return 0.85;
  }

  // Autostart: Spår 4 och 5 är statistiskt bäst i Sverige
  if (spår === 4 || spår === 5) return 1.25;
  if (spår === 1 || spår === 2 || spår === 3) return 1.15;
  if (spår === 6 || spår === 7) return 0.95;
  if (spår === 9 || spår === 10) return 0.95; // Smygläge i rygg på ledaren
  if (spår === 8 || spår === 11 || spår === 12) return 0.65; // Vingel- och dödslägen
  return 0.8;
}

export function analyzeEquipment(
  horse: BongHorseInput,
  startMethod?: 'volt' | 'auto'
): { bonus: number; shoeInfo: string; sulkyInfo?: string } {
  let bonus = 0;
  let shoeInfo = 'Skor runt om';
  let sulkyInfo: string | undefined;

  const isBarfotaFram = horse.shoeFront === false;
  const isBarfotaBak = horse.shoeBack === false;

  if (isBarfotaFram && isBarfotaBak) {
    shoeInfo = 'Barfota runt om';
    bonus += horse.shoeChanged ? 0.3 : 0.2;
  } else if (isBarfotaFram) {
    shoeInfo = 'Barfota fram';
    bonus += 0.1;
  } else if (isBarfotaBak) {
    shoeInfo = 'Barfota bak';
    bonus += 0.12;
  }

  if (horse.sulkyType === 'american' && startMethod === 'auto') {
    sulkyInfo = 'Amerikansk sulky';
    bonus += 0.15;
  }

  return { bonus, shoeInfo, sulkyInfo };
}

export function analyzeHorseProbabilities(
  horse: BongHorseInput,
  secondHorse: BongHorseInput | undefined,
  leg: BongRaceLeg
): HorseProbabilityAnalysis {
  const betDist = Math.max(0.0005, horse.betDistribution || 0.01);
  const winOdds = Math.max(1.05, horse.winOdds || 15);

  // Sannolikhetslära: Implicita vinstchansen härledd från vinnarodds med 85% återbetalning
  const rawWinProb = 0.85 / winOdds;
  const impliedWinProb = Math.min(0.92, Math.max(0.005, rawWinProb));
  const valueRatio = Number((impliedWinProb / betDist).toFixed(2));

  const postAdv = calculatePostAdvantage(horse.postPosition || horse.startNumber, leg.startMethod);
  const equip = analyzeEquipment(horse, leg.startMethod);

  // Spik med största omsorg:
  // Kräver hög vinstchans (minst 38 %), inte svåraste spåren, samt distans till loppets tvåa
  const secondProb = secondHorse?.winOdds ? 0.85 / secondHorse.winOdds : 0.2;
  const leadMargin = impliedWinProb - secondProb;
  const spårNr = horse.postPosition || horse.startNumber;
  const isBadPost =
    (leg.startMethod === 'auto' && (spårNr === 8 || spårNr === 12)) ||
    (leg.startMethod === 'volt' && (spårNr === 4 || spårNr === 5));

  let spikScore = Math.round(
    impliedWinProb * 60 +
      betDist * 25 +
      postAdv * 15 +
      equip.bonus * 20 +
      (leadMargin > 0.15 ? 15 : 0) -
      (isBadPost ? 25 : 0)
  );
  spikScore = Math.min(99, Math.max(5, spikScore));

  const isSolidSpik =
    impliedWinProb >= 0.38 &&
    betDist >= 0.34 &&
    spikScore >= 70 &&
    leadMargin >= 0.12 &&
    (!isBadPost || impliedWinProb > 0.65);

  // Högoddsare / Skräll med största omsorg:
  // Får inte vara chanslös (minst 2% vinstchans), max 15% streckad, men högt spelvärde (VR >= 1.25)
  const isSmygPost = spårNr <= 3 || spårNr === 9 || spårNr === 10;
  let skrallScore = 0;
  if (betDist <= 0.16 && impliedWinProb >= 0.02) {
    skrallScore = Math.round(
      valueRatio * 25 +
        (isSmygPost ? 20 : 5) +
        equip.bonus * 30 +
        (horse.driverWinPercentage ? horse.driverWinPercentage * 1.5 : 10)
    );
  }
  skrallScore = Math.min(98, Math.max(0, skrallScore));

  const isHighValueSkrall =
    betDist <= 0.15 && impliedWinProb >= 0.025 && valueRatio >= 1.25 && skrallScore >= 45;

  let travSummary = '';
  if (isSolidSpik) {
    travSummary = `Omgångens mest omsorgsfullt granskade spik! ${Math.round(impliedWinProb * 100)} % vinstchans, fördelaktigt läge (spår ${spårNr}) och ${equip.shoeInfo.toLowerCase()}.`;
  } else if (isHighValueSkrall) {
    travSummary = `Super-spelvärd skräll (${Math.round(betDist * 100)} % streckad till ${winOdds} odds = spelvärde ${valueRatio}x). ${equip.shoeInfo} och smygläge!`;
  } else if (valueRatio >= 1.2) {
    travSummary = `Bra spelvärde (${valueRatio}x). Underskattad i förhållande till vinnaroddset.`;
  } else if (valueRatio < 0.75 && betDist > 0.35) {
    travSummary = `Överstreckad favorit (${Math.round(betDist * 100)} % streckad men bara ${Math.round(impliedWinProb * 100)} % vinstodds). Sårbar för gardering!`;
  } else {
    travSummary = `Streckad på ${Math.round(betDist * 100)} % med ${winOdds} i vinnarodds.`;
  }

  return {
    impliedWinProb,
    valueRatio,
    postAdvantage: postAdv,
    equipmentBonus: equip.bonus,
    shoeInfo: equip.shoeInfo,
    sulkyInfo: equip.sulkyInfo,
    spikScore,
    skrallScore,
    isSolidSpik,
    isHighValueSkrall,
    travSummary,
  };
}
