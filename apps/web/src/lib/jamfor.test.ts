import { describe, it, expect } from 'vitest';
import {
  parseKmTimeToSeconds,
  getBestKmTime,
  calculateRestDays,
  formatRestDays,
  formatFormRecent,
  calculateFormScore,
  formatTrackPositionStat,
  getShoeDescription,
  getBestIndices,
} from './jamfor';
import { HorseProfileResponse } from '@stallbacken/shared';

describe('jamfor hjälplogik', () => {
  describe('parseKmTimeToSeconds', () => {
    it('parsar standard kilometertider korrekt', () => {
      expect(parseKmTimeToSeconds('1.12,3a')).toBeCloseTo(72.3);
      expect(parseKmTimeToSeconds('1.14,0')).toBeCloseTo(74.0);
      expect(parseKmTimeToSeconds('1.15,8g')).toBeCloseTo(75.8);
      expect(parseKmTimeToSeconds('12,3')).toBeCloseTo(72.3);
    });

    it('returnerar null vid saknade eller ogiltiga tider', () => {
      expect(parseKmTimeToSeconds(undefined)).toBeNull();
      expect(parseKmTimeToSeconds('–')).toBeNull();
      expect(parseKmTimeToSeconds('')).toBeNull();
      expect(parseKmTimeToSeconds('abc')).toBeNull();
    });
  });

  describe('getBestKmTime', () => {
    it('hittar den snabbaste tiden bland rekord och lopp', () => {
      const mockProfile: Partial<HorseProfileResponse> = {
        horse: {
          id: 'h1',
          name: 'Testare',
          pedigree: {},
          records: { auto: '1.13,2a', volt: '1.14,5' },
          earningsTotal: 100000,
          starts: 10,
          wins: 3,
          seconds: 2,
          thirds: 1,
          winPercentage: 30,
          placePercentage: 60,
          earningsPerStart: 10000,
        },
        pastStarts: [
          {
            id: 's1',
            horseId: 'h1',
            date: '2026-10-01',
            trackName: 'Solvalla',
            raceType: 'regular',
            startMethod: 'auto',
            distanceM: 2140,
            kmTime: '1.12,4a',
            place: '1',
          },
          {
            id: 's2',
            horseId: 'h1',
            date: '2026-09-15',
            trackName: 'Jägersro',
            raceType: 'regular',
            startMethod: 'auto',
            distanceM: 1640,
            kmTime: '1.14,0',
            place: '2',
          },
        ],
      };

      const best = getBestKmTime(mockProfile as HorseProfileResponse);
      expect(best).toBe('1.12,4a');
    });

    it('returnerar null om profilen saknas', () => {
      expect(getBestKmTime(null)).toBeNull();
    });
  });

  describe('calculateRestDays och formatRestDays', () => {
    it('beräknar antal dagar korrekt', () => {
      const days = calculateRestDays('2026-10-29', '2026-10-15');
      expect(days).toBe(14);
      expect(formatRestDays(days)).toBe('14 dagar');
    });

    it('formaterar månadsvis vila korrekt', () => {
      expect(formatRestDays(65)).toBe('2 månader');
    });

    it('hanterar 0 dagar och saknade datum', () => {
      expect(formatRestDays(0)).toBe('Startar idag');
      expect(formatRestDays(null)).toBe('–');
      expect(calculateRestDays(undefined, '2026-10-15')).toBeNull();
    });
  });

  describe('formatFormRecent och calculateFormScore', () => {
    it('formaterar 5 senaste starter', () => {
      const starts = [
        { place: '1' },
        { place: '3' },
        { place: 'd' },
        { place: '2' },
        { place: '1' },
        { place: '4' },
      ];
      expect(formatFormRecent(starts)).toBe('1 · 3 · d · 2 · 1');
    });

    it('räknar ut formpoäng där segrar väger tyngst', () => {
      const scoreHigh = calculateFormScore([{ place: '1' }, { place: '1' }]);
      const scoreLow = calculateFormScore([{ place: '5' }, { place: 'd' }]);

      expect(scoreHigh).toBeGreaterThan(scoreLow!);
    });
  });

  describe('formatTrackPositionStat', () => {
    it('formaterar spårstatistik på ren svenska', () => {
      expect(
        formatTrackPositionStat({
          startMethod: 'auto',
          postPosition: 3,
          starts: 6,
          wins: 2,
          places: 4,
          winPercent: 33,
        })
      ).toBe('33 % (2 av 6)');

      expect(formatTrackPositionStat(null)).toBe('–');
    });
  });

  describe('getShoeDescription', () => {
    it('beskriver skokombinationer korrekt', () => {
      expect(getShoeDescription(false, false, false)).toEqual({
        text: 'Barfota runt om',
        changed: false,
      });
      expect(getShoeDescription(false, true, true)).toEqual({
        text: 'Barfota fram',
        changed: true,
      });
      expect(getShoeDescription(true, false, false)).toEqual({
        text: 'Barfota bak',
        changed: false,
      });
      expect(getShoeDescription(true, true, false)).toEqual({
        text: 'Skor runt om',
        changed: false,
      });
    });
  });

  describe('getBestIndices', () => {
    it('hittar högsta värde för segerprocent', () => {
      const values = [15, 30, 22, null];
      const best = getBestIndices(values, 'high');
      expect(Array.from(best)).toEqual([1]);
    });

    it('hittar lägsta värde för tider (sekunder)', () => {
      const values = [74.5, 72.1, 73.0, null];
      const best = getBestIndices(values, 'low');
      expect(Array.from(best)).toEqual([1]);
    });

    it('stödjer delad förstaplats', () => {
      const values = [30, 15, 30];
      const best = getBestIndices(values, 'high');
      expect(Array.from(best)).toEqual([0, 2]);
    });

    it('markerar ingen om alla har samma värde', () => {
      const values = [20, 20, 20];
      const best = getBestIndices(values, 'high');
      expect(best.size).toBe(0);
    });

    it('markerar ingen om alla värden saknas', () => {
      const values = [null, undefined, null];
      const best = getBestIndices(values, 'high');
      expect(best.size).toBe(0);
    });
  });
});
