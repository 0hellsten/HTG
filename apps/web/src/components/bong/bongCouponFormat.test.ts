import { describe, it, expect } from 'vitest';
import {
  formatBongLegHorses,
  buildBongCouponViewModel,
  formatBongCouponShareText,
  getAtgSpelUrl,
  buildAtgXmlFile,
} from './bongCouponFormat';
import { BongHorseInput, BongRaceDayData } from '@stallbacken/shared';

describe('bongCouponFormat', () => {
  const mockHorses: BongHorseInput[] = [
    { id: 'h1', startNumber: 1, name: 'Häst 1', betDistribution: 0.2 },
    { id: 'h5', startNumber: 5, name: 'Häst 5', betDistribution: 0.15 },
    { id: 'h2', startNumber: 2, name: 'Häst 2', betDistribution: 0.1 },
    { id: 'h10', startNumber: 10, name: 'Häst 10', betDistribution: 0.05 },
  ];

  it('formaterar hästnummer sorterade med komma utan mellanslag', () => {
    const formatted = formatBongLegHorses(['h5', 'h1', 'h10', 'h2'], mockHorses);
    expect(formatted).toBe('1,2,5,10');
  });

  it('returnerar tom sträng om inga hästar valts', () => {
    expect(formatBongLegHorses([], mockHorses)).toBe('');
    expect(formatBongLegHorses(['h99'], mockHorses)).toBe('');
  });

  it('bygger korrekt kupongmodell för V75 med 7 avdelningar', () => {
    const raceDay: BongRaceDayData = {
      gameType: 'V75',
      turnover: 10000000,
      trackName: 'Solvalla',
      date: '2026-10-31',
      races: [
        { legIndex: 0, startTime: '16:20', horses: mockHorses },
        { legIndex: 1, startTime: '16:42', horses: mockHorses },
        { legIndex: 2, startTime: '17:05', horses: mockHorses },
        { legIndex: 3, startTime: '17:27', horses: mockHorses },
        { legIndex: 4, startTime: '17:50', horses: mockHorses },
        { legIndex: 5, startTime: '18:15', horses: mockHorses },
        { legIndex: 6, startTime: '18:40', horses: mockHorses },
      ],
    };

    const selected = {
      0: ['h1', 'h2'],
      1: ['h5'],
    };

    const model = buildBongCouponViewModel(raceDay, selected, 'V75', 144);
    expect(model.gameType).toBe('V75');
    expect(model.couponSrc).toBe('./v75.jpg');
    expect(model.trackName).toBe('Solvalla');
    expect(model.costSekStr).toBe('144 kr');
    expect(model.startTime).toBe('16:20');
    expect(model.rows.length).toBe(7);
    expect(model.rows[0].text).toBe('1,2');
    expect(model.rows[1].text).toBe('5');
    expect(model.rows[2].text).toBe('');
  });

  it('bygger korrekt kupongmodell för V86 med 8 avdelningar och v86.jpg', () => {
    const raceDay: BongRaceDayData = {
      gameType: 'V86',
      turnover: 8000000,
      trackName: 'Solvalla/Åby',
      date: '2026-11-04',
      races: Array.from({ length: 8 }, (_, i) => ({
        legIndex: i,
        startTime: '20:30',
        horses: mockHorses,
      })),
    };

    const selected = {
      7: ['h10', 'h1'],
    };

    const model = buildBongCouponViewModel(raceDay, selected, 'V86', 256.5);
    expect(model.gameType).toBe('V86');
    expect(model.couponSrc).toBe('./v86.jpg');
    expect(model.rows.length).toBe(8);
    expect(model.rows[7].text).toBe('1,10');
  });

  it('formaterar delbar kupongtext på ren svenska', () => {
    const raceDay: BongRaceDayData = {
      gameType: 'V75',
      turnover: 10000000,
      trackName: 'Solvalla',
      date: '2026-10-31',
      races: Array.from({ length: 7 }, (_, i) => ({
        legIndex: i,
        startTime: '16:20',
        horses: mockHorses,
      })),
    };
    const model = buildBongCouponViewModel(raceDay, { 0: ['h1', 'h2'], 1: ['h5'] }, 'V75', 100);
    const text = formatBongCouponShareText(model);

    expect(text).toContain('Tangitza · V75 Solvalla');
    expect(text).toContain('Kostnad: 100 kr');
    expect(text).toContain('Avd 1: 1,2');
    expect(text).toContain('Avd 2: 5');
    expect(text).toContain('Avd 3: –');
  });

  it('genererar korrekt direktlänk till ATG för respektive spelform', () => {
    expect(getAtgSpelUrl('V75')).toBe('https://www.atg.se/spel/reducerat/V75');
    expect(getAtgSpelUrl('v86')).toBe('https://www.atg.se/spel/reducerat/V86');
  });

  it('skapar ATG XML-fil med marks-sträng för filinlämning', () => {
    const raceDay: BongRaceDayData = {
      gameType: 'V75',
      turnover: 10000000,
      trackName: 'Solvalla',
      date: '2026-10-31',
      races: Array.from({ length: 7 }, (_, i) => ({
        legIndex: i,
        startTime: '16:20',
        horses: mockHorses,
      })),
    };
    const model = buildBongCouponViewModel(raceDay, { 0: ['h1', 'h5'] }, 'V75', 50);
    const xml = buildAtgXmlFile(model, '2026-10-31');

    expect(xml).toContain('<v75Coupon');
    expect(xml).toContain('date="2026-10-31"');
    // Avd 1 har häst 1 och 5 -> 100010000000000
    expect(xml).toContain('<leg marks="100010000000000" legno="1"/>');
    // Avd 2 har inga valda -> 15 nollor
    expect(xml).toContain('<leg marks="000000000000000" legno="2"/>');
  });
});
