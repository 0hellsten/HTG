import { describe, it, expect } from 'vitest';
import { JanneBoyEngine, JanneBoyConfig, BongRaceDayData, BongHorseInput } from '../src/index.js';

function createMockRaceDay(legsCount: number): BongRaceDayData {
  const gameType = legsCount === 7 ? 'V75' : 'V86';
  return {
    gameType,
    turnover: 50000000,
    races: Array.from({ length: legsCount }, (_, legIdx) => {
      const horses: BongHorseInput[] = Array.from({ length: 12 }, (_, hIdx) => {
        const nr = hIdx + 1;
        const betDistribution =
          hIdx === 0 ? 0.45 : hIdx === 1 ? 0.22 : hIdx === 2 ? 0.12 : Math.max(0.01, 0.21 / 9);
        return {
          id: `h_${legIdx}_${nr}`,
          startNumber: nr,
          name: `Häst ${legIdx + 1}-${nr}`,
          driverName: `Kusk ${nr}`,
          scratched: false,
          betDistribution,
          winOdds: Number((0.85 / betDistribution).toFixed(1)),
        };
      });

      return {
        legIndex: legIdx,
        raceNumber: legIdx + 1,
        horses,
      };
    }),
  };
}

describe('JanneBoyEngine', () => {
  const engine = new JanneBoyEngine();
  const raceDayV75 = createMockRaceDay(7);
  const raceDayV86 = createMockRaceDay(8);

  it('genererar ett giltigt V75-system inom budget (100 kr)', () => {
    const config: JanneBoyConfig = {
      gameType: 'V75',
      strategy: 'balanserad',
      budget: 100,
    };

    const result = engine.generate(raceDayV75, config);

    expect(result.gameType).toBe('V75');
    expect(result.legs).toHaveLength(7);
    expect(result.rowPrice).toBe(0.5);
    expect(result.costSek).toBeLessThanOrEqual(100);
    expect(result.totalRows).toBeGreaterThan(0);
    expect(result.totalRows).toBe(result.costSek / 0.5);
    expect(result.explanation).toContain('Balanserat systemförslag');
  });

  it('genererar ett giltigt V86-system inom budget (200 kr)', () => {
    const config: JanneBoyConfig = {
      gameType: 'V86',
      strategy: 'sakerhet',
      budget: 200,
    };

    const result = engine.generate(raceDayV86, config);

    expect(result.gameType).toBe('V86');
    expect(result.legs).toHaveLength(8);
    expect(result.rowPrice).toBe(0.25);
    expect(result.costSek).toBeLessThanOrEqual(200);
    expect(result.spikarCount).toBeGreaterThanOrEqual(1);
  });

  it('respekterar manuellt låsta hästar som spik', () => {
    const lockedHorseId = 'h_0_5'; // Tvinga häst 5 i avdelning 1
    const config: JanneBoyConfig = {
      gameType: 'V75',
      strategy: 'balanserad',
      budget: 150,
      lockedHorses: {
        0: [lockedHorseId],
      },
    };

    const result = engine.generate(raceDayV75, config);

    expect(result.legs[0].isSpik).toBe(true);
    expect(result.legs[0].selectedHorses[0].id).toBe(lockedHorseId);
  });

  it('miljondrag prioriterar spelvärde och genererar rensardrag', () => {
    const config: JanneBoyConfig = {
      gameType: 'V75',
      strategy: 'miljondrag',
      budget: 300,
    };

    const result = engine.generate(raceDayV75, config);

    expect(result.strategy).toBe('miljondrag');
    expect(result.costSek).toBeLessThanOrEqual(300);
    expect(result.explanation).toContain('Jannes Miljondrag');
    expect(result.valueScore).toBeGreaterThanOrEqual(45);
  });

  it('form-strategin skapar personligt citat och motivering', () => {
    const config: JanneBoyConfig = {
      gameType: 'V75',
      strategy: 'form',
      budget: 50,
    };

    const result = engine.generate(raceDayV75, config);

    expect(result.strategy).toBe('form');
    expect(result.funQuote).toBeTruthy();
    expect(result.costSek).toBeLessThanOrEqual(50);
  });

  it('genererar ett giltigt V85-system med 8 avdelningar och 0.25 kr radpris', () => {
    const raceDayV85: BongRaceDayData = {
      ...createMockRaceDay(8),
      gameType: 'V85',
    };
    const config: JanneBoyConfig = {
      gameType: 'V85',
      strategy: 'balanserad',
      budget: 150,
    };

    const result = engine.generate(raceDayV85, config);

    expect(result.gameType).toBe('V85');
    expect(result.legs).toHaveLength(8);
    expect(result.rowPrice).toBe(0.25);
    expect(result.costSek).toBeLessThanOrEqual(150);
  });
});
