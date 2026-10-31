import { BongGameType } from '../types/bong.js';

export interface GameConfig {
  gameType: BongGameType;
  legsCount: number;
  radpris: number;
  pools: {
    levels: number[];
    distribution: number[];
  };
  vMultiplier: number;
  atgDeduction: number;
  netPrizePoolFactor: number;
  topPoolShare: number;
  underutdelningsgrans: number;
  maxHorsesPerLeg: number;
  vinnarPayback: number;
}

export const V75_CONFIG: GameConfig = {
  gameType: 'V75',
  legsCount: 7,
  radpris: 0.5,
  pools: {
    levels: [7, 6, 5],
    distribution: [0.4, 0.2, 0.4],
  },
  vMultiplier: 2.5,
  atgDeduction: 0.35,
  netPrizePoolFactor: 0.65,
  topPoolShare: 0.4,
  underutdelningsgrans: 15,
  maxHorsesPerLeg: 16,
  vinnarPayback: 0.85,
};

export const V86_CONFIG: GameConfig = {
  gameType: 'V86',
  legsCount: 8,
  radpris: 0.25,
  pools: {
    levels: [8, 7, 6],
    distribution: [0.4, 0.2, 0.4],
  },
  vMultiplier: 2.5,
  atgDeduction: 0.35,
  netPrizePoolFactor: 0.65,
  topPoolShare: 0.4,
  underutdelningsgrans: 15,
  maxHorsesPerLeg: 16,
  vinnarPayback: 0.85,
};

export const V85_CONFIG: GameConfig = {
  gameType: 'V85',
  legsCount: 8,
  radpris: 0.25,
  pools: {
    levels: [8, 7, 6],
    distribution: [0.4, 0.2, 0.4],
  },
  vMultiplier: 2.5,
  atgDeduction: 0.35,
  netPrizePoolFactor: 0.65,
  topPoolShare: 0.4,
  underutdelningsgrans: 15,
  maxHorsesPerLeg: 16,
  vinnarPayback: 0.85,
};

export const GS75_CONFIG: GameConfig = {
  gameType: 'GS75',
  legsCount: 7,
  radpris: 1.0,
  pools: {
    levels: [7, 6, 5],
    distribution: [0.4, 0.2, 0.4],
  },
  vMultiplier: 2.5,
  atgDeduction: 0.35,
  netPrizePoolFactor: 0.65,
  topPoolShare: 0.4,
  underutdelningsgrans: 15,
  maxHorsesPerLeg: 16,
  vinnarPayback: 0.85,
};

export const V64_CONFIG: GameConfig = {
  gameType: 'V64',
  legsCount: 6,
  radpris: 1.0,
  pools: {
    levels: [6, 5, 4],
    distribution: [0.4, 0.2, 0.4],
  },
  vMultiplier: 2.5,
  atgDeduction: 0.35,
  netPrizePoolFactor: 0.65,
  topPoolShare: 0.4,
  underutdelningsgrans: 15,
  maxHorsesPerLeg: 16,
  vinnarPayback: 0.85,
};

export const V65_CONFIG: GameConfig = {
  gameType: 'V65',
  legsCount: 6,
  radpris: 1.0,
  pools: {
    levels: [6, 5],
    distribution: [0.5, 0.5],
  },
  vMultiplier: 2.5,
  atgDeduction: 0.35,
  netPrizePoolFactor: 0.65,
  topPoolShare: 0.5,
  underutdelningsgrans: 15,
  maxHorsesPerLeg: 16,
  vinnarPayback: 0.85,
};

export function getGameConfig(gameType: BongGameType): GameConfig {
  const norm = String(gameType || '').toUpperCase();
  if (norm === 'V85') return V85_CONFIG;
  if (norm === 'V86') return V86_CONFIG;
  if (norm === 'GS75') return GS75_CONFIG;
  if (norm === 'V64') return V64_CONFIG;
  if (norm === 'V65') return V65_CONFIG;
  return V75_CONFIG;
}
