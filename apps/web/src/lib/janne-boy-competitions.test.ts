import { describe, it, expect } from 'vitest';
import {
  formatCompetitionFromApi,
  buildFallbackBongRaceDay,
} from '../components/bong/competitions';
import { JanneBoyEngine, JanneBoyConfig } from '@stallbacken/shared';

describe('Janne Boy och omgångar', () => {
  it('formaterar tävling från API-struktur med datum och bana', () => {
    const raw = {
      id: 'V75_2026-10-31_solvalla',
      gameType: 'V75' as const,
      gameName: 'V75 Solvalla',
      date: '2026-10-31',
      trackName: 'Solvalla',
      startTime: '16:20',
      turnover: 45000000,
      jackpotPool: 15000000,
    };

    const formatted = formatCompetitionFromApi(raw);
    expect(formatted.id).toBe(raw.id);
    expect(formatted.gameType).toBe('V75');
    expect(formatted.trackName).toBe('Solvalla');
    expect(formatted.turnover).toBe(45000000);
    expect(formatted.jackpotPool).toBe(15000000);
    expect(formatted.dateFormatted).toBeTruthy();
  });

  it('bygger omgångsstruktur med rätt antal avdelningar för V75 och V86', () => {
    const v75Day = buildFallbackBongRaceDay('V75');
    expect(v75Day.gameType).toBe('V75');
    expect(v75Day.races.length).toBe(7);
    expect(v75Day.races[0].horses.length).toBe(12);

    const v86Day = buildFallbackBongRaceDay('V86');
    expect(v86Day.gameType).toBe('V86');
    expect(v86Day.races.length).toBe(8);
  });

  it('skapar fungerande Janne Boy-systemförslag för omgång', () => {
    const engine = new JanneBoyEngine();
    const raceDay = buildFallbackBongRaceDay('V75');
    const config: JanneBoyConfig = {
      gameType: 'V75',
      strategy: 'balanserad',
      budget: 100,
    };

    const result = engine.generate(raceDay, config);
    expect(result.gameType).toBe('V75');
    expect(result.legs.length).toBe(7);
    expect(result.costSek).toBeGreaterThan(0);
    expect(result.costSek).toBeLessThanOrEqual(150);
    expect(result.totalRows).toBeGreaterThan(0);
  });
});
