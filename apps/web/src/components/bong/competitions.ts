import { BongGameType, BongRaceDayData } from '@stallbacken/shared';

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

export function formatCompetitionFromApi(g: {
  id: string;
  gameType: BongGameType;
  gameName: string;
  date: string;
  trackName: string;
  startTime: string;
  turnover: number;
  jackpotPool: number;
}): BongCompetition {
  const d = new Date(g.date);
  const todayStr = new Date().toISOString().slice(0, 10);
  const isToday = g.date === todayStr;

  const weekdays = ['Sön', 'Mån', 'Tis', 'Ons', 'Tor', 'Fre', 'Lör'];
  const fullWeekdays = ['Söndag', 'Måndag', 'Tisdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lördag'];
  const months = [
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

  const dayOfWeek = isNaN(d.getDay()) ? 6 : d.getDay();
  const dayNr = isNaN(d.getDate()) ? 1 : d.getDate();
  const month = isNaN(d.getMonth()) ? 'okt' : months[d.getMonth()];

  const weekdayShort = isToday ? 'Idag' : weekdays[dayOfWeek];
  const fullDateText = `${isToday ? 'Idag ' : ''}${fullWeekdays[dayOfWeek]} ${dayNr} ${month}`;
  const dateFormatted = `${dayNr} ${month}`;

  return {
    id: g.id,
    dateIso: g.date,
    weekday: weekdayShort,
    dateFormatted,
    fullDateText,
    gameType: g.gameType,
    gameName: g.gameName,
    trackName: g.trackName,
    startTime: g.startTime,
    turnover: g.turnover,
    jackpotPool: g.jackpotPool || undefined,
    isToday,
  };
}

export function buildFallbackBongRaceDay(gameType: BongGameType): BongRaceDayData {
  const count = gameType === 'V86' ? 8 : 7;
  const races = Array.from({ length: count }, (_, idx) => ({
    legIndex: idx,
    raceNumber: idx + 1,
    trackName: gameType === 'V86' ? (idx % 2 === 0 ? 'Solvalla' : 'Åby') : 'Solvalla',
    raceName: `Avdelning ${idx + 1}`,
    startTime: gameType === 'V86' ? '20:30' : '16:20',
    distance: 2140,
    startMethod: 'auto' as const,
    horses: Array.from({ length: 12 }, (__, hIdx) => ({
      id: `hb_${idx}_${hIdx + 1}`,
      startNumber: hIdx + 1,
      postPosition: hIdx + 1,
      name: `Startande häst ${hIdx + 1}`,
      driverName: 'Kusk',
      trainerName: 'Tränare',
      betDistribution: Number((1 / 12).toFixed(4)),
      winOdds: 10.0,
      sulkyType: 'regular' as const,
      shoeFront: true,
      shoeBack: true,
      scratched: false,
    })),
  }));

  return {
    gameType,
    turnover: 0,
    trackName: 'Svensk travbana',
    date: 'Idag',
    startTime: gameType === 'V86' ? '20:30' : '16:20',
    races,
  };
}
