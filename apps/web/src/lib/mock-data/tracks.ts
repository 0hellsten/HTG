import { TrackProfile, TrackStats, TrackWeather } from '@stallbacken/shared';

export const MOCK_TRACKS: TrackProfile[] = [
  {
    id: '1',
    name: 'Solvalla',
    country: 'SE',
    lengthM: 1000,
    stretchM: 196,
    surface: 'Grus',
    covered: false,
    openStretchLanes: 0,
    angledWing: false,
    lat: 59.369,
    lon: 17.939,
  },
  {
    id: '2',
    name: 'Åby',
    country: 'SE',
    lengthM: 1000,
    stretchM: 180,
    surface: 'Grus',
    covered: false,
    openStretchLanes: 2,
    angledWing: false,
    lat: 57.653,
    lon: 12.001,
  },
  {
    id: '3',
    name: 'Jägersro',
    country: 'SE',
    lengthM: 1000,
    stretchM: 190,
    surface: 'Grus',
    covered: false,
    openStretchLanes: 0,
    angledWing: true,
    lat: 55.578,
    lon: 13.067,
  },
  {
    id: '4',
    name: 'Bergsåker',
    country: 'SE',
    lengthM: 1000,
    stretchM: 200,
    surface: 'Grus',
    covered: false,
    openStretchLanes: 0,
    angledWing: false,
    lat: 62.404,
    lon: 17.228,
  },
  {
    id: '5',
    name: 'Färjestad',
    country: 'SE',
    lengthM: 1000,
    stretchM: 177,
    surface: 'Grus',
    covered: false,
    openStretchLanes: 0,
    angledWing: false,
    lat: 59.408,
    lon: 13.518,
  },
  {
    id: '6',
    name: 'Halmstad',
    country: 'SE',
    lengthM: 1000,
    stretchM: 203,
    surface: 'Grus',
    covered: false,
    openStretchLanes: 0,
    angledWing: false,
    lat: 56.685,
    lon: 12.871,
  },
  {
    id: '7',
    name: 'Axevalla',
    country: 'SE',
    lengthM: 1000,
    stretchM: 227,
    surface: 'Grus',
    covered: false,
    openStretchLanes: 0,
    angledWing: false,
    lat: 58.385,
    lon: 13.578,
  },
  {
    id: '8',
    name: 'Eskilstuna',
    country: 'SE',
    lengthM: 1000,
    stretchM: 182,
    surface: 'Grus',
    covered: false,
    openStretchLanes: 0,
    angledWing: false,
    lat: 59.356,
    lon: 16.516,
  },
  {
    id: '9',
    name: 'Romme',
    country: 'SE',
    lengthM: 1000,
    stretchM: 205,
    surface: 'Grus',
    covered: false,
    openStretchLanes: 0,
    angledWing: false,
    lat: 60.435,
    lon: 15.512,
  },
  {
    id: '10',
    name: 'Bollnäs',
    country: 'SE',
    lengthM: 1000,
    stretchM: 207,
    surface: 'Grus',
    covered: false,
    openStretchLanes: 0,
    angledWing: false,
    lat: 61.353,
    lon: 16.376,
  },
];

export function getMockTrackProfile(trackId: string): TrackProfile {
  return (
    MOCK_TRACKS.find((t) => t.id === trackId || t.name.toLowerCase() === trackId.toLowerCase()) ||
    MOCK_TRACKS[0]
  );
}

export function getMockTrackStats(trackId: string): TrackStats {
  const profile = getMockTrackProfile(trackId);
  const postStatsAuto = Array.from({ length: 12 }, (_, i) => ({
    postPosition: i + 1,
    startMethod: 'auto' as const,
    starts: 120,
    wins: Math.max(2, 20 - i),
    winPercent: parseFloat(((Math.max(2, 20 - i) / 120) * 100).toFixed(1)),
  }));

  const postStatsVolt = Array.from({ length: 12 }, (_, i) => ({
    postPosition: i + 1,
    startMethod: 'volt' as const,
    starts: 80,
    wins: Math.max(2, 16 - i),
    winPercent: parseFloat(((Math.max(2, 16 - i) / 80) * 100).toFixed(1)),
  }));

  return {
    trackId: profile.id,
    trackName: profile.name,
    totalRaces: 200,
    basedOnRaces: 200,
    postStatsAuto,
    postStatsVolt,
    leaderWinPercent: 43.5,
    isLowSample: false,
    commonWinningTimes: [
      { distanceM: 1640, startMethod: 'auto', typicalTime: '1.11,8a', raceCount: 45 },
      { distanceM: 2140, startMethod: 'auto', typicalTime: '1.13,4a', raceCount: 90 },
      { distanceM: 2140, startMethod: 'volt', typicalTime: '1.14,6', raceCount: 40 },
      { distanceM: 2640, startMethod: 'auto', typicalTime: '1.14,2a', raceCount: 25 },
    ],
  };
}

export function getMockTrackWeather(trackId: string): TrackWeather {
  const profile = getMockTrackProfile(trackId);
  return {
    trackId: profile.id,
    trackName: profile.name,
    observedAt: new Date().toISOString(),
    tempC: 12,
    windMs: 3.4,
    precipMm: 0,
    symbolCode: 3,
    description: 'Halvklart och fin bana',
    sourceId: 'smhi-weather',
  };
}
