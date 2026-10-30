import { BongGameType, BongRaceDayData, HorseRank, JanneBoyEngine } from '@stallbacken/shared';
import { QuickCouponPreset } from './BongSummaryCard';

export function buildPresetSelection(
  preset: QuickCouponPreset,
  raceDay: BongRaceDayData,
  gameType: BongGameType
): { sel: Record<number, string[]>; ranks: Record<string, HorseRank> } {
  const sel: Record<number, string[]> = {};
  const ranks: Record<string, HorseRank> = {};

  if (preset === 'spikar') {
    raceDay.races.forEach((race, idx) => {
      const top = [...race.horses]
        .filter((h) => !h.scratched)
        .sort((a, b) => b.betDistribution - a.betDistribution)[0];
      sel[idx] = top ? [top.id] : [];
      if (top) ranks[top.id] = 'A';
    });
    return { sel, ranks };
  }

  const budget = preset === 'small' ? 50 : preset === 'medium' ? 100 : 200;
  const generated = new JanneBoyEngine().generate(raceDay, {
    gameType,
    strategy: 'balanserad',
    budget,
    lockedHorses: {},
  });

  for (const leg of generated.legs) {
    sel[leg.legIndex] = leg.selectedHorses.map((h) => h.id);
    leg.selectedHorses.forEach((h, i) => {
      ranks[h.id] = i === 0 ? 'A' : i === 1 ? 'B' : 'C';
    });
  }
  return { sel, ranks };
}
