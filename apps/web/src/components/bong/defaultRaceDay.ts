import { BongGameType, BongRaceDayData, BongHorseInput } from '@stallbacken/shared';

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

export function buildDefaultRaceDay(gameType: BongGameType): BongRaceDayData {
  const legsCount = gameType === 'V75' ? 7 : 8;
  const turnover = gameType === 'V75' ? 52000000 : 28000000;
  const jackpot = gameType === 'V75' ? 14000000 : 4000000;

  return {
    gameType,
    turnover,
    jackpotPool: jackpot,
    races: Array.from({ length: legsCount }, (_, legIdx) => ({
      legIndex: legIdx,
      raceNumber: legIdx + 1,
      horses: createDefaultHorses(legIdx),
    })),
  };
}
