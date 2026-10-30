import {
  HorseProfileResponse,
  HorseDetail,
  HorsePastStart,
  HorseRankingItem,
  HorseRankingsResponse,
  HorseRankingCategory,
} from '@stallbacken/shared';
import { LEG_REAL_HORSES } from '../../components/bong/realBongHorses';

const ALL_FLAT_HORSES = LEG_REAL_HORSES.flat();

export function findMockHorse(horseIdOrName: string) {
  const clean = horseIdOrName.toLowerCase();
  return (
    ALL_FLAT_HORSES.find(
      (h) => h.id.toLowerCase() === clean || h.name.toLowerCase() === clean
    ) || ALL_FLAT_HORSES[0]
  );
}

export function getMockHorseProfile(horseId: string): HorseProfileResponse {
  const h = findMockHorse(horseId);

  const horseDetail: HorseDetail = {
    id: h.id,
    name: h.name,
    nationality: 'SE',
    birthYear: 2018,
    age: 7,
    sex: 'Valack',
    color: 'Brun',
    breed: 'Varmblodig travare',
    trainerName: h.trainerName,
    owner: 'Stall Travglädje',
    breeder: 'Nordic Trot AB',
    homeTrack: 'Solvalla',
    pedigree: {
      father: 'Readly Express',
      mother: 'Top Flight',
      grandfather: 'Maharajah',
    },
    records: {
      auto: '1.09,8a',
      volt: '1.12,4',
    },
    earningsTotal: 4850000,
    starts: 42,
    wins: 18,
    seconds: 9,
    thirds: 5,
    winPercentage: 42.8,
    placePercentage: 76.2,
    earningsPerStart: 115476,
  };

  const pastStarts: HorsePastStart[] = [
    {
      id: 'past_1',
      horseId: h.id,
      date: '2026-10-18',
      trackName: 'Solvalla',
      raceNumber: 7,
      raceType: 'regular',
      startMethod: 'auto',
      distanceM: 2140,
      postPosition: 3,
      driverName: h.driverName,
      place: '1',
      kmTime: '1.11,2a',
      odds: 2.8,
      shoesFront: false,
      shoesBack: false,
      sulkyType: 'american',
      firstPrize: 150000,
    },
    {
      id: 'past_2',
      horseId: h.id,
      date: '2026-09-26',
      trackName: 'Åby',
      raceNumber: 10,
      raceType: 'regular',
      startMethod: 'auto',
      distanceM: 2140,
      postPosition: 5,
      driverName: h.driverName,
      place: '2',
      kmTime: '1.11,8a',
      odds: 3.4,
      shoesFront: false,
      shoesBack: false,
      sulkyType: 'american',
      firstPrize: 220000,
    },
    {
      id: 'past_3',
      horseId: h.id,
      date: '2026-09-05',
      trackName: 'Jägersro',
      raceNumber: 6,
      raceType: 'regular',
      startMethod: 'volt',
      distanceM: 2160,
      postPosition: 2,
      driverName: h.driverName,
      place: '1',
      kmTime: '1.12,6',
      odds: 1.9,
      shoesFront: true,
      shoesBack: false,
      sulkyType: 'regular',
      firstPrize: 110000,
    },
    {
      id: 'past_4',
      horseId: h.id,
      date: '2026-08-15',
      trackName: 'Bergsåker',
      raceNumber: 9,
      raceType: 'regular',
      startMethod: 'auto',
      distanceM: 1640,
      postPosition: 4,
      driverName: h.driverName,
      place: '3',
      kmTime: '1.10,3a',
      odds: 4.2,
      shoesFront: false,
      shoesBack: false,
      sulkyType: 'american',
      firstPrize: 150000,
    },
  ];

  return {
    horse: horseDetail,
    pastStarts,
    allStarts: pastStarts,
    qualifiers: [],
    positionStats: [
      { startMethod: 'auto', postPosition: 1, starts: 6, wins: 3, places: 5, winPercent: 50 },
      { startMethod: 'auto', postPosition: 3, starts: 8, wins: 4, places: 7, winPercent: 50 },
      { startMethod: 'auto', postPosition: 5, starts: 7, wins: 3, places: 5, winPercent: 42.8 },
      { startMethod: 'auto', postPosition: 8, starts: 4, wins: 1, places: 2, winPercent: 25 },
    ],
    trainingForm: {
      trainerName: h.trainerName,
      trainerWinPercent: 22.4,
      trainerStarts: 340,
      driverName: h.driverName,
      driverWinPercent: 19.8,
      driverStarts: 620,
    },
    status: 'ok',
    fetchedAt: new Date().toISOString(),
    message: 'Hästprofil hämtad',
  };
}

export function searchMockHorses(query: string): HorseDetail[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  const matches = ALL_FLAT_HORSES.filter(
    (h) => h.name.toLowerCase().includes(q) || h.driverName.toLowerCase().includes(q)
  );
  return matches.slice(0, 15).map((h) => getMockHorseProfile(h.id).horse);
}

export function getMockHorseRanking(category: HorseRankingCategory): HorseRankingsResponse {
  const items: HorseRankingItem[] = ALL_FLAT_HORSES.slice(0, 15).map((h, i) => {
    const p = getMockHorseProfile(h.id).horse;
    return {
      ...p,
      rankPosition: i + 1,
      todayStart: {
        trackName: 'Solvalla',
        raceNumber: (i % 8) + 1,
        startNumber: (i % 12) + 1,
        startTime: '16:20',
      },
    };
  });

  return {
    category,
    items,
    updatedAt: new Date().toISOString(),
  };
}

export function getMockStallAnmalda() {
  const todayStr = new Date().toISOString().slice(0, 10);
  return ALL_FLAT_HORSES.slice(0, 6).map((h, i) => ({
    id: `entry_${h.id}`,
    horseId: h.id,
    horseName: h.name,
    raceId: `race_${(i % 8) + 1}`,
    raceNumber: (i % 8) + 1,
    startNumber: (i % 12) + 1,
    trackId: '1',
    trackName: 'Solvalla',
    date: todayStr,
    startTime: '16:20',
    driverName: h.driverName,
    trainerName: h.trainerName,
    favoriteType: i % 2 === 0 ? 'hast' : 'kusk',
  }));
}
