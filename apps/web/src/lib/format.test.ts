import { describe, it, expect } from 'vitest';
import {
  formatCurrency,
  formatKmTime,
  formatDistance,
  formatStartMethod,
  formatShoeInfo,
  formatSulky,
  formatOdds,
  formatPercent,
} from './format';

describe('Svensk travformatering', () => {
  it('formaterar pengar med tusentalsavgränsare och kr', () => {
    expect(formatCurrency(1245300)).toBe('1 245 300 kr');
    expect(formatCurrency(100000)).toBe('100 000 kr');
    expect(formatCurrency(0)).toBe('0 kr');
    expect(formatCurrency(null)).toBe('–');
    expect(formatCurrency(undefined)).toBe('–');
  });

  it('formaterar kilometertid med decimalkomma', () => {
    expect(formatKmTime('1.12.3a')).toBe('1.12,3a');
    expect(formatKmTime('1.14.0')).toBe('1.14,0');
    expect(formatKmTime('1.10,7a')).toBe('1.10,7a');
    expect(formatKmTime('')).toBe('–');
    expect(formatKmTime(null)).toBe('–');
  });

  it('formaterar distans med mellanslag och m', () => {
    expect(formatDistance(2140)).toBe('2 140 m');
    expect(formatDistance(1640)).toBe('1 640 m');
    expect(formatDistance(3140)).toBe('3 140 m');
    expect(formatDistance(null)).toBe('–');
  });

  it('formaterar startsätt volt och auto', () => {
    expect(formatStartMethod('auto')).toBe('auto');
    expect(formatStartMethod('volt')).toBe('volt');
    expect(formatStartMethod('autostart')).toBe('auto');
    expect(formatStartMethod(null)).toBe('–');
  });

  it('formaterar skoinformation korrekt', () => {
    // false = barfota (C), true = skor (F)
    expect(formatShoeInfo(false, false)).toEqual({
      code: 'C/C',
      label: 'Barfota runt om',
      changed: false,
    });
    expect(formatShoeInfo(true, true)).toEqual({
      code: 'F/F',
      label: 'Skor runt om',
      changed: false,
    });
    expect(formatShoeInfo(false, true, true)).toEqual({
      code: 'C/F',
      label: 'Barfota fram',
      changed: true,
    });
    expect(formatShoeInfo(true, false)).toEqual({
      code: 'F/C',
      label: 'Barfota bak',
      changed: false,
    });
    expect(formatShoeInfo(undefined, undefined)).toEqual({
      code: '–',
      label: 'Skoinformation saknas',
      changed: false,
    });
  });

  it('formaterar sulkytyp', () => {
    expect(formatSulky('Amerikansk sulky')).toBe('Amerikansk sulky');
    expect(formatSulky('Vanlig vagn')).toBe('Vanlig vagn');
    expect(formatSulky('')).toBe('–');
    expect(formatSulky(null)).toBe('–');
  });

  it('formaterar vinnarodds med en decimal och decimalkomma', () => {
    expect(formatOdds(4.8)).toBe('4,8');
    expect(formatOdds(3.45)).toBe('3,5');
    expect(formatOdds(12)).toBe('12,0');
    expect(formatOdds(undefined)).toBe('–');
    expect(formatOdds(null)).toBe('–');
    expect(formatOdds(0)).toBe('–');
  });

  it('formaterar streckprocent som heltal med mellanslag och procent', () => {
    expect(formatPercent(23)).toBe('23 %');
    expect(formatPercent(23.4)).toBe('23 %');
    expect(formatPercent(23.8)).toBe('24 %');
    expect(formatPercent(0)).toBe('0 %');
    expect(formatPercent(undefined)).toBe('–');
    expect(formatPercent(null)).toBe('–');
  });
});

