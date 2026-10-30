import { RaceDay, Race, Start, RaceOddsData } from '@stallbacken/shared';
import { LEG_REAL_HORSES } from '../../components/bong/realBongHorses';

const START_TIMES = ['16:20', '16:42', '17:05', '17:27', '17:50', '18:15', '18:40', '19:05'];
const RACE_NAMES = [
  'Klass II - Försök 1',
  'Klass I - Försök 2',
  'Bronsdivisionen - Försök 3',
  'Diamantstoet - Försök 4',
  'Silverdivisionen - Försök 5',
  'Gulddivisionen - H.K.H. Prins Daniels Lopp',
  'Stayerlopp - Walter Lundbergs Memorial',
  'Fyraåringseliten',
];

export function getMockTodayRaceDays(): RaceDay[] {
  const todayStr = new Date().toISOString().slice(0, 10);
  const races = buildMockRaces('rd_solvalla_today', todayStr);

  return [
    {
      id: 'rd_solvalla_today',
      date: todayStr,
      trackId: '1',
      trackName: 'Solvalla',
      biggestGame: 'V75',
      firstStart: '16:20',
      racesCount: races.length,
      races,
    },
  ];
}

export function buildMockRaces(raceDayId: string, dateStr: string): Race[] {
  return Array.from({ length: 8 }, (_, i) => ({
    id: `race_${i + 1}`,
    raceDayId,
    number: i + 1,
    name: RACE_NAMES[i] || `Lopp ${i + 1}`,
    distanceM: i === 6 ? 2640 : i === 2 ? 1640 : 2140,
    startMethod: i === 3 ? 'volt' : 'auto',
    purse: '220 000 kr',
    terms: '3-åriga och äldre.',
    status: i === 0 ? 'spelbart' : 'kommande',
    scheduledStart: `${dateStr}T${START_TIMES[i] || '16:20'}:00Z`,
    trackCondition: 'Lätt bana',
    trackName: 'Solvalla',
  }));
}

export function getMockRaceDetails(raceId: string): { race: Race; starts: Start[] } {
  const todayStr = new Date().toISOString().slice(0, 10);
  const races = buildMockRaces('rd_solvalla_today', todayStr);
  const raceIndex = Math.max(0, parseInt(raceId.replace('race_', ''), 10) - 1 || 0);
  const race = races[raceIndex] || races[0];

  const templateHorses = LEG_REAL_HORSES[raceIndex % LEG_REAL_HORSES.length] || LEG_REAL_HORSES[0];
  const starts: Start[] = templateHorses.map((h, idx) => ({
    id: `start_${race.id}_${idx + 1}`,
    raceId: race.id,
    horseId: h.id,
    horseName: h.name,
    startNumber: idx + 1,
    postPosition: idx + 1,
    distanceM: race.distanceM,
    driverName: h.driverName,
    trainerName: h.trainerName,
    shoesFront: idx % 3 === 0,
    shoesBack: idx % 2 === 0,
    shoesChanged: idx % 4 === 0,
    sulkyType: idx % 2 === 0 ? 'american' : 'regular',
    scratched: false,
    record: `1.${10 + (idx % 4)},${idx + 2}a`,
    earnings: 250000 + (12 - idx) * 150000,
    winOdds: parseFloat((2.2 + idx * 1.8).toFixed(1)),
    stakePercent: Math.max(2, Math.round(40 / (idx + 1))),
  }));

  return { race, starts };
}

export function getMockRaceOdds(raceId: string): RaceOddsData {
  const { starts } = getMockRaceDetails(raceId);
  const now = new Date();
  return {
    raceId,
    recordedAt: now.toISOString(),
    timeFormatted: now.toTimeString().slice(0, 5),
    gameType: 'V75',
    odds: starts.map((s) => ({
      startNumber: s.startNumber,
      horseId: s.horseId,
      winOdds: s.winOdds || 5.0,
      placeOdds: parseFloat(((s.winOdds || 5.0) * 0.4).toFixed(1)),
      stakePercent: s.stakePercent || 5,
    })),
  };
}
