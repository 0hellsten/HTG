import { BongGameType, BongRaceDayData, BongHorseInput, BongRaceLeg } from '@stallbacken/shared';
import { BongCompetition } from './competitions';

// Skapa standard-hästar för en realistisk V75/V86-omgång
export function createDefaultHorses(legIndex: number): BongHorseInput[] {
  const driverNames = [
    'Örjan Kihlström',
    'Björn Goop',
    'Daniel Wäjersten',
    'Erik Adielsson',
    'Magnus A Djuse',
    'Mats E Djuse',
    'Carl Johan Jepson',
    'Adrian Kolgjini',
    'Per Linderoth',
    'Jorma Kontio',
    'Ulf Ohlsson',
    'Claes Sjöström',
  ];

  const prefixes = [
    'Global',
    'Mellby',
    'Don',
    'Ready',
    'Fame',
    'King',
    'Queen',
    'Star',
    'Speedy',
    'Perfect',
    'Power',
    'Magic',
  ];
  const suffixes = [
    'Badman',
    'River',
    'Star',
    'Hill',
    'Winner',
    'Rocket',
    'Prince',
    'Princess',
    'Knight',
    'Crown',
    'Thunder',
    'Boy',
  ];
  const distributionPresets = [
    0.42, 0.24, 0.14, 0.08, 0.04, 0.03, 0.02, 0.015, 0.008, 0.004, 0.002, 0.001,
  ];

  return Array.from({ length: 12 }, (_, i) => {
    const nr = i + 1;
    const betDist = distributionPresets[i] || 0.01;
    const winOdds = Number((0.85 / Math.max(0.005, betDist)).toFixed(1));
    const name = `${prefixes[(legIndex + i) % prefixes.length]} ${suffixes[(legIndex * 2 + i) % suffixes.length]}`;

    return {
      id: `h_${legIndex}_${nr}`,
      startNumber: nr,
      name,
      driverName: driverNames[i % driverNames.length],
      scratched: false,
      betDistribution: betDist,
      winOdds,
    };
  });
}

const V75_LEGS_INFO: Omit<BongRaceLeg, 'horses'>[] = [
  {
    legIndex: 0,
    raceNumber: 5,
    trackName: 'Solvalla',
    startTime: '16:20',
    distance: 2140,
    startMethod: 'auto',
    raceName: 'Klass II, Försök 1',
  },
  {
    legIndex: 1,
    raceNumber: 6,
    trackName: 'Solvalla',
    startTime: '16:42',
    distance: 2640,
    startMethod: 'volt',
    raceName: 'Klass I, Försök 2',
  },
  {
    legIndex: 2,
    raceNumber: 7,
    trackName: 'Solvalla',
    startTime: '17:05',
    distance: 1640,
    startMethod: 'auto',
    raceName: 'Gulddivisionen',
  },
  {
    legIndex: 3,
    raceNumber: 8,
    trackName: 'Solvalla',
    startTime: '17:27',
    distance: 2140,
    startMethod: 'volt',
    raceName: 'Diamantstoet, Försök 3',
  },
  {
    legIndex: 4,
    raceNumber: 9,
    trackName: 'Solvalla',
    startTime: '17:50',
    distance: 2140,
    startMethod: 'auto',
    raceName: 'Bronsdivisionen, Försök 1',
  },
  {
    legIndex: 5,
    raceNumber: 10,
    trackName: 'Solvalla',
    startTime: '18:20',
    distance: 2140,
    startMethod: 'auto',
    raceName: 'Silverdivisionen, Försök 2',
  },
  {
    legIndex: 6,
    raceNumber: 11,
    trackName: 'Solvalla',
    startTime: '18:43',
    distance: 2140,
    startMethod: 'auto',
    raceName: 'Walter Lundbergs Memorial',
  },
];

const V86_LEGS_INFO: Omit<BongRaceLeg, 'horses'>[] = [
  {
    legIndex: 0,
    raceNumber: 6,
    trackName: 'Åby',
    startTime: '20:30',
    distance: 2140,
    startMethod: 'auto',
    raceName: 'Xpress-sprinten',
  },
  {
    legIndex: 1,
    raceNumber: 7,
    trackName: 'Solvalla',
    startTime: '20:41',
    distance: 1640,
    startMethod: 'auto',
    raceName: 'Stolopp',
  },
  {
    legIndex: 2,
    raceNumber: 7,
    trackName: 'Åby',
    startTime: '20:52',
    distance: 2640,
    startMethod: 'volt',
    raceName: 'Stayerlopp',
  },
  {
    legIndex: 3,
    raceNumber: 8,
    trackName: 'Solvalla',
    startTime: '21:03',
    distance: 2140,
    startMethod: 'auto',
    raceName: 'Klass I',
  },
  {
    legIndex: 4,
    raceNumber: 8,
    trackName: 'Åby',
    startTime: '21:14',
    distance: 2140,
    startMethod: 'auto',
    raceName: 'Diamantstoet',
  },
  {
    legIndex: 5,
    raceNumber: 9,
    trackName: 'Solvalla',
    startTime: '21:26',
    distance: 2140,
    startMethod: 'volt',
    raceName: 'Treåringslopp',
  },
  {
    legIndex: 6,
    raceNumber: 9,
    trackName: 'Åby',
    startTime: '21:40',
    distance: 1640,
    startMethod: 'auto',
    raceName: 'Snabblopp',
  },
  {
    legIndex: 7,
    raceNumber: 10,
    trackName: 'Solvalla',
    startTime: '21:51',
    distance: 2140,
    startMethod: 'auto',
    raceName: 'Fyraåringsstjärnan',
  },
];

export function buildDefaultRaceDay(gameType: BongGameType): BongRaceDayData {
  const isV75 = gameType === 'V75';
  const turnover = isV75 ? 52000000 : 28000000;
  const jackpot = isV75 ? 14000000 : 4000000;
  const trackName = isV75 ? 'Solvalla' : 'Solvalla / Åby (Xpress)';
  const date = isV75 ? 'Lördag' : 'Onsdag';
  const startTime = isV75 ? '16:20' : '20:30';
  const legsInfo = isV75 ? V75_LEGS_INFO : V86_LEGS_INFO;

  return {
    gameType,
    turnover,
    jackpotPool: jackpot,
    trackName,
    date,
    startTime,
    races: legsInfo.map((info, legIdx) => ({
      ...info,
      horses: createDefaultHorses(legIdx),
    })),
  };
}

export function buildRaceDayFromCompetition(competition: BongCompetition): BongRaceDayData {
  const isV86 = competition.gameType === 'V86';
  const legsInfo = isV86 ? V86_LEGS_INFO : V75_LEGS_INFO;

  return {
    gameType: competition.gameType,
    turnover: competition.turnover,
    jackpotPool: competition.jackpotPool,
    trackName: competition.trackName,
    date: competition.fullDateText,
    startTime: competition.startTime,
    races: legsInfo.map((info, legIdx) => ({
      ...info,
      trackName: isV86 ? info.trackName : competition.trackName,
      horses: createDefaultHorses(legIdx),
    })),
  };
}
