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

export function getGameConfig(gameType: BongGameType): GameConfig {
  return gameType === 'V75' ? V75_CONFIG : V86_CONFIG;
}
