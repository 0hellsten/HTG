import { BongGameType } from './bong.js';

export type JanneBoyStrategy = 'balanserad' | 'miljondrag' | 'sakerhet' | 'form';

export interface JanneBoyStrategyInfo {
  id: JanneBoyStrategy;
  label: string;
  description: string;
  tagline: string;
}

export interface JanneBoyConfig {
  gameType: BongGameType;
  strategy: JanneBoyStrategy;
  budget: number;
  lockedHorses?: Record<number, string[]>;
  excludedHorses?: Record<number, string[]>;
}

export interface JanneBoyHorsePick {
  id: string;
  startNumber: number;
  name?: string;
  driverName?: string;
  trainerName?: string;
  betDistribution: number;
  winOdds?: number;
  isSpikCandidate?: boolean;
  isValueCandidate?: boolean;
  score: number;
  postPosition?: number;
  shoeInfo?: string;
  sulkyInfo?: string;
  impliedProbability?: number;
  valueRatio?: number;
  spikQualityScore?: number;
  skrallPotentialScore?: number;
  careAnalysis?: string;
}

export interface JanneBoyLegSuggestion {
  legIndex: number;
  raceNumber: number;
  trackName?: string;
  startTime?: string;
  distance?: number;
  startMethod?: 'volt' | 'auto';
  raceName?: string;
  selectedHorses: JanneBoyHorsePick[];
  isSpik: boolean;
  reason: string;
}

export interface JanneBoySystemResult {
  gameType: BongGameType;
  strategy: JanneBoyStrategy;
  budgetSek: number;
  costSek: number;
  totalRows: number;
  rowPrice: number;
  legs: JanneBoyLegSuggestion[];
  explanation: string;
  spikarCount: number;
  skrallarCount: number;
  valueScore: number;
  funQuote: string;
  createdAt: string;
}
