// Datatyper och interface för Janne Boy — Superintelligent kupongmotor
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
  budget: number; // Önskad budget i SEK (t.ex. 50, 100, 200, 300, 500)
  lockedHorses?: Record<number, string[]>; // Avd (0..N-1) -> Häst-ID:n som ska spikas/låsas manuellt
  excludedHorses?: Record<number, string[]>; // Avd (0..N-1) -> Häst-ID:n som ska uteslutas
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
  shoeInfo?: string; // T.ex. "Barfota runt om", "Barfota bak", "Skor"
  sulkyInfo?: string; // T.ex. "Amerikansk sulky"
  impliedProbability?: number; // Vinstchans 0-100% från odds
  valueRatio?: number; // Spelvärdeskvot (P_win / P_streck)
  spikQualityScore?: number; // 0-100 hur omsorgsfullt verifierad spiken är
  skrallPotentialScore?: number; // 0-100 hur hög potential skrällen har
  careAnalysis?: string; // Förklarande travomdöme för hästen
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
  reason: string; // T.ex. "Spikas! Dominerar på strecken och möter passande motstånd."
}

export interface JanneBoySystemResult {
  gameType: BongGameType;
  strategy: JanneBoyStrategy;
  budgetSek: number;
  costSek: number;
  totalRows: number;
  rowPrice: number;
  legs: JanneBoyLegSuggestion[];
  explanation: string; // Övergripande förklaring i god travton
  spikarCount: number;
  skrallarCount: number;
  valueScore: number; // 0-100 spelvärde
  funQuote: string; // Citat i Janne-stil
  createdAt: string;
}
