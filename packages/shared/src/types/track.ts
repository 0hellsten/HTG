// Delade typer för banprofiler, banstatistik och väder
// Stallbacken — HTG

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
  winPercent: number | null; // null om 0 starter
}

export interface CommonWinningTime {
  distanceM: number;
  startMethod: 'volt' | 'auto';
  typicalTime: string; // T.ex. "1.12,8a"
  raceCount: number;
}

export interface TrackStats {
  trackId: string;
  trackName: string;
  totalRaces: number;
  basedOnRaces: number;
  postStatsAuto: PostPositionStat[];
  postStatsVolt: PostPositionStat[];
  leaderWinPercent: number | null; // Hur ofta ledaren vinner
  commonWinningTimes: CommonWinningTime[];
  isLowSample: boolean; // true om basedOnRaces < 20
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
