import { BongGameType, BongHorseInput, BongRaceDayData } from '@stallbacken/shared';
import { formatDateShort } from '../../lib/format';

export interface BongCouponRow {
  legIndex: number;
  legNumber: number;
  text: string;
}

export interface BongCouponViewModel {
  gameType: BongGameType;
  couponSrc: string;
  trackName: string;
  dateStr: string;
  startTime: string;
  costSekStr: string;
  rows: BongCouponRow[];
}

export function formatBongLegHorses(
  selectedIds: string[] = [],
  legHorses: Array<BongHorseInput | { id: string; startNumber?: number; number?: number }> = []
): string {
  if (!selectedIds.length || !legHorses.length) return '';
  const horseMap = new Map<string, number>();
  for (const h of legHorses) {
    const num = h.startNumber ?? ('number' in h ? (h.number as number) : undefined);
    if (typeof num === 'number') {
      horseMap.set(h.id, num);
    }
  }

  const numbers = selectedIds
    .map((id) => horseMap.get(id))
    .filter((n): n is number => typeof n === 'number')
    .sort((a, b) => a - b);

  return numbers.join(',');
}

export function buildBongCouponViewModel(
  raceDay: BongRaceDayData,
  selectedHorses: Record<number, string[]>,
  gameType: BongGameType,
  costSek: number
): BongCouponViewModel {
  const isV86 = gameType === 'V86';
  const totalLegs = isV86 ? 8 : 7;
  const couponSrc = isV86 ? './v86.jpg' : './v75.jpg';

  const rows: BongCouponRow[] = [];
  for (let i = 0; i < totalLegs; i++) {
    const leg = raceDay.races[i];
    const selectedIds = selectedHorses[i] || [];
    const text = formatBongLegHorses(selectedIds, leg?.horses || []);
    rows.push({
      legIndex: i,
      legNumber: i + 1,
      text,
    });
  }

  const dateStr = raceDay.date ? formatDateShort(raceDay.date) : '';
  const startTime = raceDay.races[0]?.startTime || '';
  const costSekStr = `${Math.round(costSek).toLocaleString('sv-SE')} kr`;

  return {
    gameType,
    couponSrc,
    trackName: raceDay.trackName || '',
    dateStr,
    startTime,
    costSekStr,
    rows,
  };
}
