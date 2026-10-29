// Konfigurationslager och fasta parametrar för V75 och V86
import { BongGameType } from '../types/bong.js';

export interface GameConfig {
  gameType: BongGameType;
  legsCount: number;
  radpris: number; // SEK
  pools: {
    levels: number[]; // [7, 6, 5] eller [8, 7, 6]
    distribution: number[]; // [0.40, 0.20, 0.40]
  };
  vMultiplier: number; // 2.5x vid endast högsta vinstgruppen
  atgDeduction: number; // 0.35 (35%)
  netPrizePoolFactor: number; // 0.65 (65% till vinstpott)
  topPoolShare: number; // 0.40 (40% av vinstpotten går till 7/8 rätt)
  underutdelningsgrans: number; // 15 SEK
  maxHorsesPerLeg: number; // 16
  vinnarPayback: number; // 0.85 (85% återbetalning i Vinnar-poolen)
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
