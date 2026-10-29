// Kommande travtävlingar och omgångar för Bong-maskinen
// Privat, icke-kommersiell användning. Ingen vidarespridning av data.

import { BongGameType } from '@stallbacken/shared';

export interface BongCompetition {
  id: string;
  dateIso: string;
  weekday: string;
  dateFormatted: string;
  fullDateText: string;
  gameType: BongGameType;
  gameName: string;
  trackName: string;
  startTime: string;
  turnover: number;
  jackpotPool?: number;
  isToday: boolean;
}

const MONTH_NAMES_SHORT = [
  'jan',
  'feb',
  'mar',
  'apr',
  'maj',
  'jun',
  'jul',
  'aug',
  'sep',
  'okt',
  'nov',
  'dec',
];
const WEEKDAY_NAMES_SHORT = ['Sön', 'Mån', 'Tis', 'Ons', 'Tor', 'Fre', 'Lör'];
const WEEKDAY_NAMES_FULL = ['Söndag', 'Måndag', 'Tisdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lördag'];

/**
 * Genererar kommande tävlingar från dagens datum och 14 dagar framåt.
 */
export function getUpcomingBongCompetitions(startDate: Date = new Date()): BongCompetition[] {
  const result: BongCompetition[] = [];

  for (let offset = 0; offset < 14; offset++) {
    const cur = new Date(startDate.getTime() + offset * 24 * 3600 * 1000);
    const dayOfWeek = cur.getDay(); // 0 = Sön, 3 = Ons, 6 = Lör
    const dateIso = cur.toISOString().slice(0, 10);
    const dayNr = cur.getDate();
    const month = MONTH_NAMES_SHORT[cur.getMonth()];
    const isToday = offset === 0;

    const weekdayShort = isToday ? 'Idag' : WEEKDAY_NAMES_SHORT[dayOfWeek];
    const fullDateText = `${isToday ? 'Idag ' : ''}${WEEKDAY_NAMES_FULL[dayOfWeek]} ${dayNr} ${month}`;
    const dateFormatted = `${dayNr} ${month}`;

    let gameType: BongGameType = 'V75';
    let gameName = 'V75';
    let trackName = 'Solvalla';
    let startTime = '16:20';
    let turnover = 48500000;
    let jackpotPool: number | undefined = undefined;

    if (dayOfWeek === 6) {
      // Lördagar = V75 Stora Rikstravet
      gameType = 'V75';
      gameName = 'V75';
      trackName = offset === 2 ? 'Jägersro' : offset === 9 ? 'Bergsåker' : 'Solvalla';
      startTime = '16:20';
      turnover = 58200000;
      jackpotPool = 14500000;
    } else if (dayOfWeek === 3) {
      // Onsdagar = V86 Xpress
      gameType = 'V86';
      gameName = 'V86';
      trackName = 'Solvalla / Åby (Xpress)';
      startTime = '20:30';
      turnover = 24800000;
      jackpotPool = 5200000;
    } else if (dayOfWeek === 0) {
      // Söndagar = Grand Slam 75
      gameType = 'V75';
      gameName = 'GS75';
      trackName = offset === 3 ? 'Axevalla' : 'Kalmar';
      startTime = '15:00';
      turnover = 12500000;
      jackpotPool = 2000000;
    } else if (dayOfWeek === 5) {
      // Fredagar = V64 / Fredagstrav
      gameType = 'V75';
      gameName = 'V64';
      trackName = 'Romme';
      startTime = '19:30';
      turnover = 8900000;
    } else {
      // Vardagar (Mån, Tis, Tor)
      gameType = 'V75';
      gameName = 'V64';
      trackName =
        dayOfWeek === 1
          ? 'Färjestad'
          : dayOfWeek === 2
            ? 'Eskilstuna'
            : isToday
              ? 'Solvalla'
              : 'Åby';
      startTime = '19:30';
      turnover = 7500000;
    }

    result.push({
      id: dateIso,
      dateIso,
      weekday: weekdayShort,
      dateFormatted,
      fullDateText,
      gameType,
      gameName,
      trackName,
      startTime,
      turnover,
      jackpotPool,
      isToday,
    });
  }

  return result;
}
