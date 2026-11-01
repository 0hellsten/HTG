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

/**
 * Formaterar kupongen som en prydlig text sammanställning lämplig att kopiera eller skicka via SMS.
 */
export function formatBongCouponShareText(model: BongCouponViewModel): string {
  const lines: string[] = [
    `Tangitza · ${model.gameType} ${model.trackName}`.trim(),
    `${model.dateStr ? model.dateStr + ' · ' : ''}Kostnad: ${model.costSekStr}`,
    '',
  ];

  for (const row of model.rows) {
    lines.push(`Avd ${row.legNumber}: ${row.text || '–'}`);
  }

  return lines.join('\n');
}

/**
 * Returnerar den officiella direktlänken till ATG för spelformen.
 */
export function getAtgSpelUrl(gameType: BongGameType | string): string {
  return `https://www.atg.se/spel/${gameType.toUpperCase()}`;
}

/**
 * Bygger en XML-fil enligt ATG:s officiella filinlämningsformat (ATG File Betting XSD ver 1.8).
 */
export function buildAtgXmlFile(model: BongCouponViewModel, raceDate?: string): string {
  const tagName = `${model.gameType.toLowerCase()}Coupon`;
  const dateFormatted = raceDate ? raceDate.slice(0, 10) : new Date().toISOString().slice(0, 10);

  const legsXml = model.rows
    .map((row) => {
      const numbers = row.text
        ? row.text
            .split(',')
            .map((s) => parseInt(s.trim(), 10))
            .filter((n) => Number.isInteger(n) && n >= 1 && n <= 15)
        : [];
      let marks = '';
      for (let pos = 1; pos <= 15; pos++) {
        marks += numbers.includes(pos) ? '1' : '0';
      }
      return `      <leg marks="${marks}" legno="${row.legNumber}"/>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<issuer schemaversion="ATG File Betting XSD ver 1.8" version="1.0" product="Tangitza" company="Tangitza">
  <betcoupons>
    <${tagName} betmultiplier="1" date="${dateFormatted}" couponid="1">
${legsXml}
    </${tagName}>
  </betcoupons>
</issuer>
`;
}

