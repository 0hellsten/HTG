// Datamodell och typer för Bong-maskinen (V75 och V86)
// Högpresterande kalkylator, reduceringsmotor och kuponggenerator

export type BongGameType = 'V75' | 'V86';

export type HorseRank = 'A' | 'B' | 'C' | 'D' | 'Unranked';

export interface BongHorseInput {
  id: string;
  startNumber: number; // 1-16
  name?: string;
  scratched?: boolean;
  betDistribution: number; // Streckprocent (0.0001 - 1.00)
  winOdds?: number; // Vinnarodds för värdeberäkning
  driverName?: string;
  trainerName?: string;
  postPosition?: number;
  shoeFront?: boolean; // false = barfota fram, true = skor
  shoeBack?: boolean; // false = barfota bak, true = skor
  shoeChanged?: boolean; // barfotaändring/skoryck
  sulkyType?: 'american' | 'regular'; // vagn
  earningsTotal?: number;
  record?: string;
  driverWinPercentage?: number;
}

export interface BongRaceLeg {
  legIndex: number; // 0..N-1 eller 1..N
  raceNumber?: number;
  trackName?: string;
  raceName?: string;
  startTime?: string;
  distance?: number;
  startMethod?: 'volt' | 'auto';
  horses: BongHorseInput[];
}

export interface BongRaceDayData {
  gameType: BongGameType;
  turnover: number; // Aktuell omsättning i SEK
  jackpotPool?: number; // Extra jackpot adderad till högsta vinstgruppen i SEK
  trackName?: string;
  date?: string;
  startTime?: string;
  races: BongRaceLeg[];
}

export interface LegSelection {
  legIndex: number;
  selectedHorseIds: string[]; // Valda häst-id:n eller startnummer
  ranks?: Record<string, HorseRank>; // Häst-ID -> Rank
  reserves?: string[] | 'AUTO'; // Valda reserv-id:n eller 'AUTO'
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
  min: number; // Minst X av dessa hästar måste ingå
  max?: number; // Högst Y av dessa hästar får ingå
}

export interface StrecksummaFilter {
  minSum?: number; // T.ex. 150 (%)
  maxSum?: number; // T.ex. 350 (%)
}

export interface PayoutFilter {
  minPayout?: number; // Minsta estimerade utdelning i kr
  maxPayout?: number; // Högsta estimerade utdelning i kr
}

export interface ReductionConditions {
  abcd?: AbcdCondition[];
  kravgrupper?: KravGruppCondition[];
  strecksumma?: StrecksummaFilter;
  payout?: PayoutFilter;
}

export interface CouponSettings {
  onlyTopPool?: boolean; // V7 eller V8 (endast högsta vinstgruppen för 2.5x utdelning)
  flerbongMultiplier?: number; // Multiplikator (1, 2, 5, 10...)
  sharesCount?: number; // Antal andelar i bolagssystem (default 1)
}

export interface CouponSelection {
  legs: LegSelection[];
  conditions?: ReductionConditions;
  settings?: CouponSettings;
}

export interface PayoutHistogram {
  under1k: number; // < 1 000 kr
  from1kTo10k: number; // 1 000 - 10 000 kr
  from10kTo100k: number; // 10 000 - 100 000 kr
  over100k: number; // > 100 000 kr
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
  valueRatio: number; // implicitProbability / betDistribution
  assessment: 'overvalued' | 'fair' | 'undervalued'; // Överstreckad, neutral, understreckad
}

export interface ReducedSingleRow {
  horses: Array<{
    legIndex: number;
    horseId: string;
    startNumber: number;
    rank: HorseRank;
    betDistribution: number;
  }>;
  strecksumma: number; // Summa i procent (t.ex. 225.5)
  productDistribution: number; // Produkt av streckprocent (t.ex. 0.00012)
  estimatedPayout: number; // Estimerad utdelning i högsta vinstgruppen i SEK
}

export interface BongCalculationResult {
  gameType: BongGameType;
  legsCount: number;
  mathRows: number; // Antal matematiska rader före reducering
  reducedRows: number; // Antal rader efter reducering
  reductionPercentage: number; // Reduceringsgrad i % (0 - 100)
  totalCost: number; // Total kostnad i SEK
  costPerShare: number; // Kostnad per andel i SEK
  radpris: number; // Radpris i SEK (0.50 för V75, 0.25 för V86)
  flerbongMultiplier: number;
  sharesCount: number;
  onlyTopPool: boolean;
  payoutDistribution: PayoutDistribution;
  valueMetrics: HorseValueMetric[];
  rows: ReducedSingleRow[];
}
