import { SourceStatus } from './adapter.js';

export interface HorsePedigree {
  father?: string;
  mother?: string;
  grandfather?: string;
}

export interface HorseRecords {
  auto?: string;
  volt?: string;
}

export interface HorseDetail {
  id: string;
  name: string;
  nationality?: string;
  birthYear?: number;
  age?: number;
  sex?: string;
  color?: string;
  breed?: string;
  trainerId?: string;
  trainerName?: string;
  owner?: string;
  breeder?: string;
  homeTrack?: string;
  pedigree: HorsePedigree;
  records: HorseRecords;
  earningsTotal: number;
  starts: number;
  wins: number;
  seconds: number;
  thirds: number;
  winPercentage: number;
  placePercentage: number;
  earningsPerStart: number;
}

export interface HorsePastStart {
  id: string;
  horseId: string;
  date: string;
  trackName: string;
  raceNumber?: number;
  raceType: 'regular' | 'qualifier';
  startMethod: 'auto' | 'volt';
  distanceM: number;
  postPosition?: number;
  driverName?: string;
  place?: string;
  kmTime?: string;
  odds?: number;
  shoesFront?: boolean;
  shoesBack?: boolean;
  sulkyType?: string;
  firstPrize?: number;
}

export interface TrackPositionStat {
  startMethod: 'auto' | 'volt';
  postPosition: number;
  starts: number;
  wins: number;
  places: number;
  winPercent: number;
}

export interface TrainingAndDriverForm {
  trainerName?: string;
  trainerWinPercent?: number | null;
  trainerStarts?: number;
  driverName?: string;
  driverWinPercent?: number | null;
  driverStarts?: number;
  qualifierNotes?: string;
}

export interface HorseProfileResponse {
  horse: HorseDetail;
  pastStarts: HorsePastStart[];
  allStarts: HorsePastStart[];
  qualifiers: HorsePastStart[];
  positionStats: TrackPositionStat[];
  trainingForm: TrainingAndDriverForm;
  status: SourceStatus;
  fetchedAt: string;
  message: string;
}

export type HorseBatchResponse = Record<string, HorseProfileResponse | null>;

export type HorseRankingCategory =
  'elit' | 'vinstrikast' | 'segerprocent' | 'segrar' | 'kallblod' | 'idag';

export interface HorseRankingItem extends HorseDetail {
  rankPosition: number;
  todayStart?: {
    trackName: string;
    raceNumber: number;
    startNumber: number;
    startTime?: string;
  };
}

export interface HorseRankingsResponse {
  category: HorseRankingCategory;
  items: HorseRankingItem[];
  updatedAt: string;
}
