export type BongGameType = 'V75' | 'V86' | 'V85' | 'GS75' | 'V64' | 'V65' | string;

export type HorseRank = 'A' | 'B' | 'C' | 'D' | 'Unranked';

export interface BongHorseInput {
  id: string;
  startNumber: number;
  name?: string;
  scratched?: boolean;
  betDistribution: number;
  winOdds?: number;
  driverName?: string;
  trainerName?: string;
  postPosition?: number;
  shoeFront?: boolean;
  shoeBack?: boolean;
  shoeChanged?: boolean;
  sulkyType?: 'american' | 'regular';
  earningsTotal?: number;
  record?: string;
  driverWinPercentage?: number;
}

export interface BongRaceLeg {
  legIndex: number;
  raceNumber?: number;
  trackName?: string;
  raceName?: string;
  startTime?: string;
  distance?: number;
  startMethod?: 'volt' | 'auto';
  horses: BongHorseInput[];
}

export interface BongRaceDayData {
  gameId?: string;
  gameType: BongGameType;
  turnover: number;
  jackpotPool?: number;
  trackName?: string;
  date?: string;
  startTime?: string;
  races: BongRaceLeg[];
}

export interface LegSelection {
  legIndex: number;
  selectedHorseIds: string[];
  ranks?: Record<string, HorseRank>;
  reserves?: string[] | 'AUTO';
}

export interface AbcdCondition {
  rank: 'A' | 'B' | 'C' | 'D';
  min?: number;
  max?: number;
}

export interface KravGruppHorseRef {
  legIndex: number;
  horseId: string;
}

export interface KravGruppCondition {
  id: string;
  name?: string;
  horses: KravGruppHorseRef[];
  min: number;
  max?: number;
}

export interface StrecksummaFilter {
  minSum?: number;
  maxSum?: number;
}

export interface PayoutFilter {
  minPayout?: number;
  maxPayout?: number;
}

export interface ReductionConditions {
  abcd?: AbcdCondition[];
  kravgrupper?: KravGruppCondition[];
  strecksumma?: StrecksummaFilter;
  payout?: PayoutFilter;
}

export interface CouponSettings {
  onlyTopPool?: boolean;
  flerbongMultiplier?: number;
  sharesCount?: number;
}

export interface CouponSelection {
  legs: LegSelection[];
  conditions?: ReductionConditions;
  settings?: CouponSettings;
}

export interface PayoutHistogram {
  under1k: number;
  from1kTo10k: number;
  from10kTo100k: number;
  over100k: number;
}

export interface PayoutDistribution {
  minPayout: number;
  medianPayout: number;
  maxPayout: number;
  histogram: PayoutHistogram;
}

export interface HorseValueMetric {
  horseId: string;
  startNumber: number;
  name?: string;
  betDistribution: number;
  winOdds: number;
  implicitProbability: number;
  valueRatio: number;
  assessment: 'overvalued' | 'fair' | 'undervalued';
}

export interface ReducedSingleRow {
  horses: Array<{
    legIndex: number;
    horseId: string;
    startNumber: number;
    rank: HorseRank;
    betDistribution: number;
  }>;
  strecksumma: number;
  productDistribution: number;
  estimatedPayout: number;
}

export interface BongCalculationResult {
  gameType: BongGameType;
  legsCount: number;
  mathRows: number;
  reducedRows: number;
  reductionPercentage: number;
  totalCost: number;
  costPerShare: number;
  radpris: number;
  flerbongMultiplier: number;
  sharesCount: number;
  onlyTopPool: boolean;
  payoutDistribution: PayoutDistribution;
  valueMetrics: HorseValueMetric[];
  rows: ReducedSingleRow[];
}
