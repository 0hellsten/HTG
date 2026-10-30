import { describe, it, expect } from 'vitest';
import { getUpcomingBongCompetitions } from '../components/bong/competitions';
import { buildRaceDayFromCompetition } from '../components/bong/defaultRaceDay';
import { JanneBoyEngine, JanneBoyConfig } from '@stallbacken/shared';

describe('Janne Boy med tävlingsväljare', () => {
  it('genererar kommande tävlingar 14 dagar framåt med datum, bana och spelform', () => {
    const competitions = getUpcomingBongCompetitions();
    expect(competitions.length).toBe(14);

    const first = competitions[0];
    expect(first.isToday).toBe(true);
    expect(first.trackName).toBeTruthy();
    expect(['V75', 'V86']).toContain(first.gameType);
  });

  it('bygger komplett omgångsunderlag från vald tävling för Janne Boy', () => {
    const competitions = getUpcomingBongCompetitions();
    const lördagComp = competitions.find((c) => c.weekday === 'Lör') || competitions[0];
    const raceDay = buildRaceDayFromCompetition(lördagComp);

    expect(raceDay.gameType).toBe(lördagComp.gameType);
    expect(raceDay.trackName).toBe(lördagComp.trackName);
    expect(raceDay.races.length).toBe(lördagComp.gameType === 'V75' ? 7 : 8);
    expect(raceDay.races[0].horses.length).toBeGreaterThan(0);
  });

  it('skapar fungerande Janne Boy-systemförslag för vald tävling', () => {
    const competitions = getUpcomingBongCompetitions();
    const engine = new JanneBoyEngine();

    for (const comp of competitions.slice(0, 3)) {
      const raceDay = buildRaceDayFromCompetition(comp);
      const config: JanneBoyConfig = {
        gameType: comp.gameType,
        strategy: 'balanserad',
        budget: 100,
      };

      const result = engine.generate(raceDay, config);
      expect(result.gameType).toBe(comp.gameType);
      expect(result.legs.length).toBe(comp.gameType === 'V75' ? 7 : 8);
      expect(result.costSek).toBeGreaterThan(0);
      expect(result.costSek).toBeLessThanOrEqual(150);
      expect(result.totalRows).toBeGreaterThan(0);
    }
  });
});
