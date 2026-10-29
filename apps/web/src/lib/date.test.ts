import { describe, it, expect } from 'vitest';
import { formatSwedishDate, formatSwedishTime, isEvening } from './date';

describe('Svensk datumformatering (Fas 1)', () => {
  it('formaterar datum enligt svensk modell (vd d mån)', () => {
    // 2026-10-29 är en torsdag
    const testDate = new Date(2026, 9, 29, 14, 30);
    const formatted = formatSwedishDate(testDate);
    expect(formatted).toBe('tor 29 okt');
  });

  it('formaterar tid som HH:mm', () => {
    const testDate = new Date(2026, 9, 29, 9, 5);
    const formatted = formatSwedishTime(testDate);
    expect(formatted).toBe('09:05');
  });

  it('identifierar kväll efter kl 16:00', () => {
    const afternoon = new Date(2026, 9, 29, 14, 0);
    const evening = new Date(2026, 9, 29, 18, 20);
    expect(isEvening(afternoon)).toBe(false);
    expect(isEvening(evening)).toBe(true);
  });
});
