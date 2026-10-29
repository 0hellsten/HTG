export interface Track {
  id: string;
  name: string;
  country: string;
  lengthM?: number;
  surface?: string;
  covered?: boolean;
}

export interface RaceDay {
  id: string;
  date: string;
  trackId: string;
  trackName: string;
  biggestGame?: string;
  firstStart?: string;
  racesCount: number;
  isFavorite?: boolean;
  races?: Race[];
}

export interface Race {
  id: string;
  raceDayId: string;
  number: number;
  name?: string;
  distanceM: number;
  startMethod: 'volt' | 'auto';
  purse?: string;
  terms?: string;
  status: 'kommande' | 'spelbart' | 'avgjort';
  scheduledStart: string;
  actualStart?: string;
  trackCondition?: string;
  trackName?: string;
}

export interface Start {
  id: string;
  raceId: string;
  horseId: string;
  horseName: string;
  startNumber: number;
  postPosition: number;
  distanceM: number;
  driverName?: string;
  trainerName?: string;
  shoesFront?: boolean;
  shoesBack?: boolean;
  shoesChanged?: boolean;
  sulkyType?: string;
  scratched?: boolean;
  scratchReason?: string;
  record?: string;
  earnings?: number;
  winOdds?: number;
  stakePercent?: number;
}
