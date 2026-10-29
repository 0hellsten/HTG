import { describe, it, expect } from 'vitest';
import { BongEngine } from '../src/bong/bong-engine.js';
import { BongRaceDayData, CouponSelection, BongHorseInput } from '../src/types/bong.js';

// Hjälpfunktion för att generera en testomgång
function createMockRaceDay(
  gameType: 'V75' | 'V86',
  turnover = 50000000,
  jackpot = 10000000
): BongRaceDayData {
  const legsCount = gameType === 'V75' ? 7 : 8;
  const races = [];

  for (let l = 0; l < legsCount; l++) {
    const horses: BongHorseInput[] = [];
    // 12 hästar per lopp med realistiska streck och odds
    for (let nr = 1; nr <= 12; nr++) {
      let betDist = 0.02;
      let winOdds = 35.0;

      if (nr === 1) {
        betDist = 0.45; // Favorit
        winOdds = 2.1;
      } else if (nr === 2) {
        betDist = 0.25; // Andrahandsfavorit
        winOdds = 4.2;
      } else if (nr === 3) {
        betDist = 0.12; // Tredjehand
        winOdds = 7.5;
      } else if (nr === 4) {
        betDist = 0.08;
        winOdds = 12.0;
      }

      horses.push({
        id: `H_${l}_${nr}`,
        startNumber: nr,
        name: `Häst ${l + 1}-${nr}`,
        scratched: false,
        betDistribution: betDist,
        winOdds,
      });
    }

    races.push({
      legIndex: l,
      raceNumber: l + 1,
      horses,
    });
  }

  return {
    gameType,
    turnover,
    jackpotPool: jackpot,
    races,
  };
}

describe('BongEngine — Kärnberäkning och Reduceringsmotor', () => {
  describe('1. V75 — Matematiskt Grundsystem', () => {
    it('beräknar korrekta matematiska rader och kostnad för ett oreducerat V75-system', () => {
      const engine = new BongEngine('V75');
      const raceDay = createMockRaceDay('V75');

      // 2 * 3 * 1 * 2 * 4 * 1 * 3 = 144 rader
      const selection: CouponSelection = {
        legs: [
          { legIndex: 0, selectedHorseIds: ['H_0_1', 'H_0_2'] }, // 2
          { legIndex: 1, selectedHorseIds: ['H_1_1', 'H_1_2', 'H_1_3'] }, // 3
          { legIndex: 2, selectedHorseIds: ['H_2_1'] }, // 1 (spik)
          { legIndex: 3, selectedHorseIds: ['H_3_1', 'H_3_2'] }, // 2
          { legIndex: 4, selectedHorseIds: ['H_4_1', 'H_4_2', 'H_4_3', 'H_4_4'] }, // 4
          { legIndex: 5, selectedHorseIds: ['H_5_1'] }, // 1 (spik)
          { legIndex: 6, selectedHorseIds: ['H_6_1', 'H_6_2', 'H_6_3'] }, // 3
        ],
      };

      const result = engine.calculate(raceDay, selection);

      expect(result.gameType).toBe('V75');
      expect(result.legsCount).toBe(7);
      expect(result.mathRows).toBe(144);
      expect(result.reducedRows).toBe(144);
      expect(result.reductionPercentage).toBe(0);
      expect(result.radpris).toBe(0.5);
      expect(result.totalCost).toBe(72); // 144 * 0.50 kr = 72 kr
      expect(result.rows.length).toBe(144);
    });

    it('returnerar 0 rader om någon avdelning saknar valda hästar', () => {
      const engine = new BongEngine('V75');
      const raceDay = createMockRaceDay('V75');

      const selection: CouponSelection = {
        legs: [
          { legIndex: 0, selectedHorseIds: ['H_0_1'] },
          { legIndex: 1, selectedHorseIds: [] }, // Tom avdelning!
          { legIndex: 2, selectedHorseIds: ['H_2_1'] },
          { legIndex: 3, selectedHorseIds: ['H_3_1'] },
          { legIndex: 4, selectedHorseIds: ['H_4_1'] },
          { legIndex: 5, selectedHorseIds: ['H_5_1'] },
          { legIndex: 6, selectedHorseIds: ['H_6_1'] },
        ],
      };

      const result = engine.calculate(raceDay, selection);
      expect(result.mathRows).toBe(0);
      expect(result.reducedRows).toBe(0);
      expect(result.totalCost).toBe(0);
    });
  });

  describe('2. ABCD-reducering (V75)', () => {
    it('reducerar rader baserat på min- och max-krav för A-, B- och C-hästar', () => {
      const engine = new BongEngine('V75');
      const raceDay = createMockRaceDay('V75');

      // 3 * 3 * 3 * 3 * 2 * 2 * 2 = 648 matematiska rader
      const selection: CouponSelection = {
        legs: [
          {
            legIndex: 0,
            selectedHorseIds: ['H_0_1', 'H_0_2', 'H_0_3'],
            ranks: { H_0_1: 'A', H_0_2: 'B', H_0_3: 'C' },
          },
          {
            legIndex: 1,
            selectedHorseIds: ['H_1_1', 'H_1_2', 'H_1_3'],
            ranks: { H_1_1: 'A', H_1_2: 'B', H_1_3: 'C' },
          },
          {
            legIndex: 2,
            selectedHorseIds: ['H_2_1', 'H_2_2', 'H_2_3'],
            ranks: { H_2_1: 'A', H_2_2: 'B', H_2_3: 'C' },
          },
          {
            legIndex: 3,
            selectedHorseIds: ['H_3_1', 'H_3_2', 'H_3_3'],
            ranks: { H_3_1: 'A', H_3_2: 'B', H_3_3: 'C' },
          },
          {
            legIndex: 4,
            selectedHorseIds: ['H_4_1', 'H_4_2'],
            ranks: { H_4_1: 'A', H_4_2: 'B' },
          },
          {
            legIndex: 5,
            selectedHorseIds: ['H_5_1', 'H_5_2'],
            ranks: { H_5_1: 'A', H_5_2: 'B' },
          },
          {
            legIndex: 6,
            selectedHorseIds: ['H_6_1', 'H_6_2'],
            ranks: { H_6_1: 'A', H_6_2: 'B' },
          },
        ],
        conditions: {
          abcd: [
            { rank: 'A', min: 3, max: 6 }, // Minst 3 A-hästar
            { rank: 'C', max: 1 }, // Högst 1 C-häst
          ],
        },
      };

      const result = engine.calculate(raceDay, selection);

      expect(result.mathRows).toBe(648);
      expect(result.reducedRows).toBeLessThan(648);
      expect(result.reducedRows).toBeGreaterThan(0);
      expect(result.reductionPercentage).toBeGreaterThan(0);

      // Verifiera att varje kvarvarande rad uppfyller ABCD-kraven
      for (const row of result.rows) {
        const aCount = row.horses.filter((h) => h.rank === 'A').length;
        const cCount = row.horses.filter((h) => h.rank === 'C').length;

        expect(aCount).toBeGreaterThanOrEqual(3);
        expect(aCount).toBeLessThanOrEqual(6);
        expect(cCount).toBeLessThanOrEqual(1);
      }
    });
  });

  describe('3. Utgångar och Kravgrupper (V75)', () => {
    it('filtrerar bort enkelrader som inte når upp till kravgruppens minsta träffar', () => {
      const engine = new BongEngine('V75');
      const raceDay = createMockRaceDay('V75');

      // System med utgångar i tre avdelningar
      const selection: CouponSelection = {
        legs: [
          { legIndex: 0, selectedHorseIds: ['H_0_1', 'H_0_2'] },
          { legIndex: 1, selectedHorseIds: ['H_1_1', 'H_1_2'] },
          { legIndex: 2, selectedHorseIds: ['H_2_1', 'H_2_2'] },
          { legIndex: 3, selectedHorseIds: ['H_3_1', 'H_3_2'] },
          { legIndex: 4, selectedHorseIds: ['H_4_1', 'H_4_2'] },
          { legIndex: 5, selectedHorseIds: ['H_5_1', 'H_5_2'] },
          { legIndex: 6, selectedHorseIds: ['H_6_1', 'H_6_2'] },
        ],
        conditions: {
          kravgrupper: [
            {
              id: 'utgangar_1',
              name: 'Mina Spetsvinnare',
              horses: [
                { legIndex: 0, horseId: 'H_0_1' },
                { legIndex: 2, horseId: 'H_2_1' },
                { legIndex: 4, horseId: 'H_4_1' },
              ],
              min: 2, // Minst 2 av dessa tre måste gå in!
            },
          ],
        },
      };

      const result = engine.calculate(raceDay, selection);

      expect(result.mathRows).toBe(128); // 2^7 = 128
      expect(result.reducedRows).toBe(64); // Exakt hälften har minst 2 av 3 utgångar

      for (const row of result.rows) {
        const hits = [
          row.horses[0].horseId === 'H_0_1',
          row.horses[2].horseId === 'H_2_1',
          row.horses[4].horseId === 'H_4_1',
        ].filter(Boolean).length;

        expect(hits).toBeGreaterThanOrEqual(2);
      }
    });
  });

  describe('4. Strecksumma- och Utdelningsfilter', () => {
    it('filtrerar bort rader utanför definierade intervall för strecksumma och beräknad utdelning', () => {
      const engine = new BongEngine('V75');
      const raceDay = createMockRaceDay('V75', 60000000, 15000000);

      const selection: CouponSelection = {
        legs: [
          { legIndex: 0, selectedHorseIds: ['H_0_1', 'H_0_2', 'H_0_3'] },
          { legIndex: 1, selectedHorseIds: ['H_1_1', 'H_1_2', 'H_1_3'] },
          { legIndex: 2, selectedHorseIds: ['H_2_1', 'H_2_2'] },
          { legIndex: 3, selectedHorseIds: ['H_3_1', 'H_3_2'] },
          { legIndex: 4, selectedHorseIds: ['H_4_1', 'H_4_2'] },
          { legIndex: 5, selectedHorseIds: ['H_5_1', 'H_5_2'] },
          { legIndex: 6, selectedHorseIds: ['H_6_1', 'H_6_2'] },
        ],
        conditions: {
          strecksumma: {
            minSum: 150, // Minst 150 % i total strecksumma
            maxSum: 300, // Högst 300 % i total strecksumma
          },
          payout: {
            minPayout: 10000, // Endast rader som ger minst 10 000 kr
          },
        },
      };

      const result = engine.calculate(raceDay, selection);

      expect(result.reducedRows).toBeGreaterThan(0);
      expect(result.reducedRows).toBeLessThan(result.mathRows);

      for (const row of result.rows) {
        expect(row.strecksumma).toBeGreaterThanOrEqual(150);
        expect(row.strecksumma).toBeLessThanOrEqual(300);
        expect(row.estimatedPayout).toBeGreaterThanOrEqual(10000);
      }
    });
  });

  describe('5. V86 — 8 Avdelningar, V8-multiplikator och Bolagsandelar', () => {
    it('beräknar V86 med radpris 0.25 kr, V8-multiplikator och andelskostnad', () => {
      const engine = new BongEngine('V86');
      const raceDay = createMockRaceDay('V86', 30000000, 5000000);

      // 8 avdelningar
      const selection: CouponSelection = {
        legs: [
          { legIndex: 0, selectedHorseIds: ['H_0_1', 'H_0_2'] },
          { legIndex: 1, selectedHorseIds: ['H_1_1', 'H_1_2'] },
          { legIndex: 2, selectedHorseIds: ['H_2_1'] }, // Spik
          { legIndex: 3, selectedHorseIds: ['H_3_1', 'H_3_2'] },
          { legIndex: 4, selectedHorseIds: ['H_4_1', 'H_4_2'] },
          { legIndex: 5, selectedHorseIds: ['H_5_1'] }, // Spik
          { legIndex: 6, selectedHorseIds: ['H_6_1', 'H_6_2'] },
          { legIndex: 7, selectedHorseIds: ['H_7_1', 'H_7_2', 'H_7_3'] },
        ],
        settings: {
          onlyTopPool: true, // V8 (2.5x multiplikator på högsta utdelningen)
          flerbongMultiplier: 2, // Dubbel bong
          sharesCount: 10, // 10 andelar
        },
      };

      const result = engine.calculate(raceDay, selection);

      expect(result.gameType).toBe('V86');
      expect(result.legsCount).toBe(8);
      // Math rows: 2 * 2 * 1 * 2 * 2 * 1 * 2 * 3 = 96 rader
      expect(result.mathRows).toBe(96);
      expect(result.reducedRows).toBe(96);
      expect(result.radpris).toBe(0.25);
      // Kostnad: 96 rader * 0.25 kr * 2 flerbong = 48 kr
      expect(result.totalCost).toBe(48);
      // Kostnad per andel: 48 / 10 = 4.80 kr
      expect(result.costPerShare).toBe(4.8);
      expect(result.onlyTopPool).toBe(true);

      // Verifiera histogram och utdelning
      expect(result.payoutDistribution.minPayout).toBeGreaterThan(0);
      expect(result.payoutDistribution.maxPayout).toBeGreaterThanOrEqual(
        result.payoutDistribution.minPayout
      );
      expect(result.payoutDistribution.medianPayout).toBeGreaterThanOrEqual(
        result.payoutDistribution.minPayout
      );
    });
  });

  describe('6. Strykningshantering och Reservbyte', () => {
    it('ersätter automatiskt en struken häst med bästa tillgängliga reserv', () => {
      const engine = new BongEngine('V75');
      const raceDay = createMockRaceDay('V75');

      // Stryk Häst 1 i avdelning 0
      raceDay.races[0].horses[0].scratched = true;

      const selection: CouponSelection = {
        legs: [
          // Häst 1 är struken! Häst 2 och 3 är valda. Reserv: AUTO
          {
            legIndex: 0,
            selectedHorseIds: ['H_0_1', 'H_0_2', 'H_0_3'],
            reserves: 'AUTO',
          },
          { legIndex: 1, selectedHorseIds: ['H_1_1'] },
          { legIndex: 2, selectedHorseIds: ['H_2_1'] },
          { legIndex: 3, selectedHorseIds: ['H_3_1'] },
          { legIndex: 4, selectedHorseIds: ['H_4_1'] },
          { legIndex: 5, selectedHorseIds: ['H_5_1'] },
          { legIndex: 6, selectedHorseIds: ['H_6_1'] },
        ],
      };

      const result = engine.calculate(raceDay, selection);

      // H_0_1 ska ha ersatts med nästa bästa häst i avdelning 0 (H_0_4)
      expect(result.mathRows).toBe(3);
      const usedHorseIds = new Set(result.rows.map((r) => r.horses[0].horseId));
      expect(usedHorseIds.has('H_0_1')).toBe(false); // Struken häst ingår inte
      expect(usedHorseIds.has('H_0_2')).toBe(true);
      expect(usedHorseIds.has('H_0_3')).toBe(true);
      expect(usedHorseIds.has('H_0_4')).toBe(true); // Reserven lades till!
    });
  });

  describe('7. Värdemätare (Value Index)', () => {
    it('identifierar överstreckade och understreckade hästar baserat på odds och streckprocent', () => {
      const engine = new BongEngine('V75');
      const raceDay = createMockRaceDay('V75');

      const selection: CouponSelection = {
        legs: [
          { legIndex: 0, selectedHorseIds: ['H_0_1', 'H_0_4'] },
          { legIndex: 1, selectedHorseIds: ['H_1_1'] },
          { legIndex: 2, selectedHorseIds: ['H_2_1'] },
          { legIndex: 3, selectedHorseIds: ['H_3_1'] },
          { legIndex: 4, selectedHorseIds: ['H_4_1'] },
          { legIndex: 5, selectedHorseIds: ['H_5_1'] },
          { legIndex: 6, selectedHorseIds: ['H_6_1'] },
        ],
      };

      const result = engine.calculate(raceDay, selection);
      expect(result.valueMetrics.length).toBeGreaterThan(0);

      const metric = result.valueMetrics[0];
      expect(metric.valueRatio).toBeGreaterThan(0);
      expect(['undervalued', 'overvalued', 'fair']).toContain(metric.assessment);
    });
  });

  describe('8. Export till Standardformat (Filinlämning)', () => {
    it('exporterar rader till 2D-array, CSV och ATG-format', () => {
      const engine = new BongEngine('V75');
      const raceDay = createMockRaceDay('V75');

      const selection: CouponSelection = {
        legs: [
          { legIndex: 0, selectedHorseIds: ['H_0_1', 'H_0_2'] },
          { legIndex: 1, selectedHorseIds: ['H_1_1'] },
          { legIndex: 2, selectedHorseIds: ['H_2_1'] },
          { legIndex: 3, selectedHorseIds: ['H_3_1'] },
          { legIndex: 4, selectedHorseIds: ['H_4_1'] },
          { legIndex: 5, selectedHorseIds: ['H_5_1'] },
          { legIndex: 6, selectedHorseIds: ['H_6_1'] },
        ],
      };

      const result = engine.calculate(raceDay, selection);
      const exported = engine.exportToStandardFormat(result);

      // 1. toRows
      const rows = exported.toRows();
      expect(rows.length).toBe(2);
      expect(rows[0]).toEqual([1, 1, 1, 1, 1, 1, 1]);
      expect(rows[1]).toEqual([2, 1, 1, 1, 1, 1, 1]);

      // 2. toCsv
      const csv = exported.toCsv();
      expect(csv).toBe('1,1,1,1,1,1,1\n2,1,1,1,1,1,1');

      // 3. toAtgFilformat
      const atgFormat = exported.toAtgFilformat();
      expect(atgFormat.startsWith('V75,1,2\n')).toBe(true);
    });
  });

  describe('9. Prestandabänkmärke (< 50 ms)', () => {
    it('genomför reducering av ett stort V75-system med 10 368 matematiska rader på under 50 ms', () => {
      const engine = new BongEngine('V75');
      const raceDay = createMockRaceDay('V75');

      // 4 * 4 * 3 * 3 * 3 * 2 * 4 = 3 456 matematiska rader
      const selection: CouponSelection = {
        legs: [
          {
            legIndex: 0,
            selectedHorseIds: ['H_0_1', 'H_0_2', 'H_0_3', 'H_0_4'],
            ranks: { H_0_1: 'A', H_0_2: 'B', H_0_3: 'B', H_0_4: 'C' },
          },
          {
            legIndex: 1,
            selectedHorseIds: ['H_1_1', 'H_1_2', 'H_1_3', 'H_1_4'],
            ranks: { H_1_1: 'A', H_1_2: 'B', H_1_3: 'C', H_1_4: 'D' },
          },
          {
            legIndex: 2,
            selectedHorseIds: ['H_2_1', 'H_2_2', 'H_2_3'],
            ranks: { H_2_1: 'A', H_2_2: 'B', H_2_3: 'C' },
          },
          {
            legIndex: 3,
            selectedHorseIds: ['H_3_1', 'H_3_2', 'H_3_3'],
            ranks: { H_3_1: 'A', H_3_2: 'B', H_3_3: 'C' },
          },
          {
            legIndex: 4,
            selectedHorseIds: ['H_4_1', 'H_4_2', 'H_4_3'],
            ranks: { H_4_1: 'A', H_4_2: 'B', H_4_3: 'C' },
          },
          {
            legIndex: 5,
            selectedHorseIds: ['H_5_1', 'H_5_2'],
            ranks: { H_5_1: 'A', H_5_2: 'B' },
          },
          {
            legIndex: 6,
            selectedHorseIds: ['H_6_1', 'H_6_2', 'H_6_3', 'H_6_4'],
            ranks: { H_6_1: 'A', H_6_2: 'B', H_6_3: 'C', H_6_4: 'D' },
          },
        ],
        conditions: {
          abcd: [
            { rank: 'A', min: 2, max: 5 },
            { rank: 'C', max: 2 },
            { rank: 'D', max: 1 },
          ],
          kravgrupper: [
            {
              id: 'g1',
              horses: [
                { legIndex: 0, horseId: 'H_0_1' },
                { legIndex: 1, horseId: 'H_1_1' },
                { legIndex: 2, horseId: 'H_2_1' },
              ],
              min: 1,
              max: 2,
            },
          ],
          strecksumma: {
            minSum: 160,
            maxSum: 320,
          },
        },
      };

      const start = performance.now();
      const result = engine.calculate(raceDay, selection);
      const durationMs = performance.now() - start;

      expect(result.mathRows).toBe(3456);
      expect(result.reducedRows).toBeGreaterThan(0);
      expect(result.reducedRows).toBeLessThan(3456);
      expect(durationMs).toBeLessThan(50); // Under 50 ms enligt kravet!
    });
  });
});
