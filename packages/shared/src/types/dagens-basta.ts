export type DagensBastaHorseRole = 'basta_chansen' | 'motbud' | 'skrall';

export type ReasonCategory = 'lage' | 'balans' | 'form_klass' | 'spelvarde' | 'kusk';

export interface DagensBastaReasonItem {
  category: ReasonCategory;
  title: string;
  text: string;
  isPositive: boolean;
}

export interface DagensBastaHorse {
  id: string;
  startNumber: number;
  name: string;
  driverName?: string;
  trainerName?: string;
  role: DagensBastaHorseRole;
  roleLabel: string;
  reasons: DagensBastaReasonItem[];
  summary: string;
  winOdds?: number;
  betDistribution: number; // Procent, t.ex. 28 för 28%
  postPosition: number;
  distance?: number;
  shoes: string;
  shoeChanged?: boolean;
  sulky?: string;
  record?: string;
  earnings?: number;
  driverWinPercentage?: number;
  scratched?: boolean;
}

export type RaceOpenness = 'tydlig_favorit' | 'tvaspanslopp' | 'oppet';

export interface DagensBastaRace {
  legIndex: number;
  raceNumber: number;
  raceName?: string;
  trackName: string;
  startTime: string;
  distance: number;
  startMethod: 'volt' | 'auto';
  openness: RaceOpenness;
  opennessLabel: string;
  shortAnalysis: string;
  horses: DagensBastaHorse[];
  totalHorsesCount: number;
}

export interface DagensBastaOmgang {
  id: string;
  gameType: string;
  gameName: string;
  trackName: string;
  date: string;
  startTime: string;
  races: DagensBastaRace[];
  topSpik?: {
    raceNumber: number;
    horseName: string;
    startNumber: number;
    reason: string;
  };
  topSkrall?: {
    raceNumber: number;
    horseName: string;
    startNumber: number;
    reason: string;
  };
  fetchedAt: string;
}
