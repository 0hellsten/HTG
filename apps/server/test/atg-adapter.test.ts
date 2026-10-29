import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Database from 'better-sqlite3';
import { runMigrations } from '../src/db/migrations.js';
import { AtgRacingInfoAdapter } from '../src/adapters/atg-racinginfo.js';
import { HealthManager } from '../src/health/health-manager.js';
import { DomainRateLimiter } from '../src/collect/queue.js';

describe('AtgRacingInfoAdapter', () => {
  let db: Database.Database;
  let adapter: AtgRacingInfoAdapter;
  let healthManager: HealthManager;

  beforeEach(() => {
    // In-memory testdatabas med samma schema
    db = new Database(':memory:');
    runMigrations(db);
    adapter = new AtgRacingInfoAdapter(db);
    healthManager = new HealthManager(db);
  });

  afterEach(() => {
    db.close();
  });

  it('hämtar kalender framgångsrikt via fixtur och sparar i SQLite', async () => {
    const result = await adapter.fetchCalendar('2026-10-29', true);

    expect(result.status).toBe('ok');
    expect(result.data).toBeDefined();
    expect(result.data?.raceDays.length).toBeGreaterThan(0);

    const firstDay = result.data?.raceDays[0];
    expect(firstDay?.trackName).toBeDefined();
    expect(firstDay?.date).toBe('2026-10-29');

    // Kontrollera att källhälsa registrerats
    const health = healthManager.getLatestRecord(adapter.id);
    expect(health).toBeDefined();
    expect(health?.status).toBe('ok');
  });

  it('hämtar loppkort och startlista med ekipage, skor och sulky', async () => {
    // Hämta först kalendern så loppet och tävlingsdagen finns
    await adapter.fetchCalendar('2026-10-29', true);

    const result = await adapter.fetchRace('2026-10-29_1_4', true);

    expect(result.status).toBe('ok');
    expect(result.data?.race).toBeDefined();
    expect(result.data?.race.name).toContain('Solvalla');
    expect(result.data?.starts.length).toBe(4);

    const start1 = result.data?.starts[0];
    expect(start1?.horseName).toBe('Global Badman');
    expect(start1?.driverName).toBe('Daniel Wäjersten');
    expect(start1?.trainerName).toBe('Daniel Wäjersten');
    expect(start1?.shoesFront).toBe(false); // Barfota fram
    expect(start1?.shoesBack).toBe(false); // Barfota bak
    expect(start1?.sulkyType).toBe('Amerikansk sulky');
    expect(start1?.scratched).toBe(false);

    // Kontrollera struken häst
    const start4 = result.data?.starts[3];
    expect(start4?.horseName).toBe('Missle Hill');
    expect(start4?.scratched).toBe(true);
    expect(start4?.scratchReason).toBe('Feber');
  });

  it('hanterar nätverksfel lugnt och returnerar failed utan att krascha', async () => {
    // Sätt en ogiltig URL och inaktivera fixturreserv för att testa rent nätverksfel
    adapter.setBaseUrl('http://127.0.0.1:59999/ogiltig');
    adapter.setAllowFixtureFallback(false);
    adapter.setFetchOptions({
      maxRetries: 1,
      timeoutMs: 200,
      backoffDelays: [10],
      rateLimiter: new DomainRateLimiter(0),
    });

    const result = await adapter.fetchCalendar('2099-01-01', true);

    expect(result.status).toBe('failed');
    expect(result.message).toBe('Uppdateras inte just nu');

    const health = healthManager.getLatestRecord(adapter.id);
    expect(health?.status).toBe('failed');
  });

  it('aktiverar kretsbrytare efter 5 raka fel', async () => {
    adapter.setBaseUrl('http://127.0.0.1:59999/ogiltig');
    adapter.setAllowFixtureFallback(false);
    adapter.setFetchOptions({
      maxRetries: 1,
      timeoutMs: 200,
      backoffDelays: [10],
      rateLimiter: new DomainRateLimiter(0),
    });

    for (let i = 0; i < 5; i++) {
      await adapter.fetchCalendar('2099-01-01', true);
    }

    expect(healthManager.isCircuitBreakerActive(adapter.id)).toBe(true);

    // Ett sjätte anrop ska direkt ge failed utan anropsförsök
    const result = await adapter.fetchCalendar('2099-01-01', true);
    expect(result.status).toBe('failed');
    expect(result.message).toBe('Uppdateras inte just nu');
  });
});
