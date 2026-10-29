import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Database from 'better-sqlite3';
import { runMigrations } from '../src/db/migrations.js';
import { AtgOddsAdapter } from '../src/adapters/atg-odds.js';
import { HealthManager } from '../src/health/health-manager.js';
import { DomainRateLimiter } from '../src/collect/queue.js';
import { upsertTrack, upsertRaceDay } from '../src/db/queries/tracks.js';
import { upsertHorse } from '../src/db/queries/horses.js';
import { upsertStart } from '../src/db/queries/starts.js';
import { upsertRace } from '../src/db/queries/races.js';

describe('AtgOddsAdapter', () => {
  let db: Database.Database;
  let adapter: AtgOddsAdapter;
  let healthManager: HealthManager;

  beforeEach(() => {
    db = new Database(':memory:');
    runMigrations(db);

    // Skapa bana och tävlingsdag
    upsertTrack(db, {
      id: '1',
      name: 'Solvalla',
      sourceId: 'atg-racinginfo',
      fetchedAt: '2026-10-29T18:00:00',
    });

    upsertRaceDay(db, {
      id: '2026-10-29_1',
      date: '2026-10-29',
      trackId: '1',
      sourceId: 'atg-racinginfo',
      fetchedAt: '2026-10-29T18:00:00',
    });

    // Skapa lopp i databasen
    upsertRace(db, {
      id: '2026-10-29_1_4',
      raceDayId: '2026-10-29_1',
      number: 4,
      name: 'Jubileumslopp',
      distanceM: 2140,
      startMethod: 'auto',
      status: 'kommande',
      scheduledStart: '2026-10-29T19:30:00',
      sourceId: 'atg-racinginfo',
      fetchedAt: '2026-10-29T18:00:00',
    });

    for (let i = 1; i <= 4; i++) {
      upsertHorse(db, {
        id: `horse_${i}`,
        name: `Häst ${i}`,
        sourceId: 'atg-racinginfo',
        fetchedAt: '2026-10-29T18:00:00',
      });

      upsertStart(db, {
        id: `2026-10-29_1_4_${i}`,
        raceId: '2026-10-29_1_4',
        horseId: `horse_${i}`,
        startNumber: i,
        postPosition: i,
        distanceM: 2140,
        sourceId: 'atg-racinginfo',
        fetchedAt: '2026-10-29T18:00:00',
      });
    }

    adapter = new AtgOddsAdapter(db);
    healthManager = new HealthManager(db);
  });

  afterEach(() => {
    db.close();
  });

  it('hämtar odds och streck framgångsrikt via fixtur och sparar i SQLite', async () => {
    const result = await adapter.fetchOddsForRace('2026-10-29_1_4', true);

    expect(result.status).toBe('ok');
    expect(result.data).toBeDefined();
    expect(result.data?.raceId).toBe('2026-10-29_1_4');
    expect(result.data?.timeFormatted).toBe('18:42');
    expect(result.data?.odds.length).toBe(4);

    const horse1 = result.data?.odds.find((o) => o.startNumber === 1);
    expect(horse1?.winOdds).toBe(3.45);
    expect(horse1?.stakePercent).toBe(24);
    expect(horse1?.placeOdds).toBe(1.45);

    const horse3 = result.data?.odds.find((o) => o.startNumber === 3);
    expect(horse3?.winOdds).toBe(2.15);
    expect(horse3?.stakePercent).toBe(48);

    const horse4 = result.data?.odds.find((o) => o.startNumber === 4);
    expect(horse4?.winOdds).toBeUndefined(); // Struken häst utan odds
    expect(horse4?.stakePercent).toBe(0);

    // Kontrollera att källhälsa registrerats som ok
    const health = healthManager.getLatestRecord(adapter.id);
    expect(health).toBeDefined();
    expect(health?.status).toBe('ok');
  });

  it('hanterar simulerad avstängning korrekt med failed och lugnt meddelande', async () => {
    adapter.setSimulatedFailure(true);

    const result = await adapter.fetchOddsForRace('2026-10-29_1_4', true);

    expect(result.status).toBe('failed');
    expect(result.data).toBeNull();
    expect(result.message).toBe('Oddsen uppdateras inte just nu. Allt annat på sidan är färskt.');

    const health = healthManager.getLatestRecord(adapter.id);
    expect(health?.status).toBe('failed');
  });

  it('kastar aldrig vid nätverksfel utan returnerar failed med senast sparade data om sådan finns', async () => {
    // Spara först giltiga odds
    await adapter.fetchOddsForRace('2026-10-29_1_4', true);

    // Simulera sedan nätverksfel utan fixturfallback
    adapter.setBaseUrl('http://127.0.0.1:59999/ogiltig');
    adapter.setAllowFixtureFallback(false);
    adapter.setFetchOptions({
      maxRetries: 1,
      timeoutMs: 150,
      backoffDelays: [10],
      rateLimiter: new DomainRateLimiter(0),
    });

    const failedResult = await adapter.fetchOddsForRace('2026-10-29_1_4', true);

    expect(failedResult.status).toBe('failed');
    expect(failedResult.message).toBe(
      'Oddsen uppdateras inte just nu. Allt annat på sidan är färskt.'
    );
    // Senast sparade data finns kvar
    expect(failedResult.data).toBeDefined();
    expect(failedResult.data?.odds.length).toBe(4);
  });

  it('utlöser kretsbrytare efter 5 raka fel och pausar källan', async () => {
    adapter.setBaseUrl('http://127.0.0.1:59999/ogiltig');
    adapter.setAllowFixtureFallback(false);
    adapter.setFetchOptions({
      maxRetries: 1,
      timeoutMs: 50,
      backoffDelays: [5],
      rateLimiter: new DomainRateLimiter(0),
    });

    for (let i = 0; i < 5; i++) {
      await adapter.fetchOddsForRace('2026-10-29_1_4', true);
    }

    expect(healthManager.isCircuitBreakerActive(adapter.id)).toBe(true);
    const resultAfterBreak = await adapter.fetchOddsForRace('2026-10-29_1_4', false);
    expect(resultAfterBreak.status).toBe('failed');
    expect(resultAfterBreak.message).toBe(
      'Oddsen uppdateras inte just nu. Allt annat på sidan är färskt.'
    );
  });
});
