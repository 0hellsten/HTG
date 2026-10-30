export interface TrackProfile {
  id: string;
  name: string;
  country: string;
  lengthM: number;
  stretchM: number;
  surface: string;
  covered: boolean;
  openStretchLanes: number;
  angledWing?: boolean;
  lat: number;
  lon: number;
}

export interface PostPositionStat {
  postPosition: number;
  startMethod: 'volt' | 'auto';
  starts: number;
  wins: number;
  winPercent: number | null;
}

export interface CommonWinningTime {
  distanceM: number;
  startMethod: 'volt' | 'auto';
  typicalTime: string;
  raceCount: number;
}

export interface TrackStats {
  trackId: string;
  trackName: string;
  totalRaces: number;
  basedOnRaces: number;
  postStatsAuto: PostPositionStat[];
  postStatsVolt: PostPositionStat[];
  leaderWinPercent: number | null;
  commonWinningTimes: CommonWinningTime[];
  isLowSample: boolean;
}

export interface TrackWeather {
  trackId: string;
  trackName?: string;
  observedAt: string;
  tempC: number;
  windMs: number;
  precipMm: number;
  symbolCode: number;
  description: string;
  sourceId: string;
}
