export interface HorseOdds {
  startNumber: number;
  startId?: string;
  horseId?: string;
  winOdds?: number;
  placeOdds?: number;
  stakePercent?: number;
}

export interface RaceOddsData {
  raceId: string;
  recordedAt: string;
  timeFormatted: string;
  gameType?: string;
  odds: HorseOdds[];
}
