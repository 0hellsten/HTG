import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Database from 'better-sqlite3';
import { runMigrations } from '../src/db/migrations.js';
import { HealthManager } from '../src/health/health-manager.js';
import { resolveSourceStatus, formatAgeSwedish } from '../src/health/status.js';
import { FakeSourceAdapter } from '../src/adapters/fake-source.js';

describe('Hälsologik och Circuit Breaker (Fas 2)', () => {
  let db: Database.Database;
  let healthManager: HealthManager;
  let adapter: FakeSourceAdapter;

  beforeEach(() => {
    db = new Database(':memory:');
    runMigrations(db);
    healthManager = new HealthManager(db);
    adapter = new FakeSourceAdapter();
  });

  afterEach(() => {
    db.close();
  });

  describe('formatAgeSwedish', () => {
    it('formaterar sekunder och minuter korrekt på svenska', () => {
      expect(formatAgeSwedish(30)).toBe('mindre än en minut');
      expect(formatAgeSwedish(65)).toBe('1 minut');
      expect(formatAgeSwedish(180)).toBe('3 minuter');
      expect(formatAgeSwedish(3600)).toBe('1 timme');
      expect(formatAgeSwedish(7200)).toBe('2 timmar');
    });
  });

  describe('resolveSourceStatus', () => {
    it('returnerar ok när data är färskt inom ttlSeconds', () => {
      const res = resolveSourceStatus({
        ageSeconds: 30,
        ttlSeconds: 60,
        staleAfterSeconds: 300,
        isPaused: false,
      });

      expect(res.status).toBe('ok');
      expect(res.message).toBe('');
    });

    it('returnerar stale med svensk text när data passerat ttlSeconds men inte staleAfterSeconds', () => {
      const res = resolveSourceStatus({
        ageSeconds: 120,
        ttlSeconds: 60,
        staleAfterSeconds: 300,
        isPaused: false,
      });

      expect(res.status).toBe('stale');
      expect(res.message).toBe('Uppdaterat för 2 minuter sedan');
    });

    it('returnerar degraded vid partiellt svar eller reservkälla', () => {
      const res = resolveSourceStatus({
        reportedStatus: 'degraded',
        ageSeconds: 20,
        ttlSeconds: 60,
        staleAfterSeconds: 300,
        isPaused: false,
        customMessage: 'Hämtat från en reservkälla — kan skilja något',
      });

      expect(res.status).toBe('degraded');
      expect(res.message).toBe('Hämtat från en reservkälla — kan skilja något');
    });

    it('returnerar failed när data är äldre än staleAfterSeconds', () => {
      const res = resolveSourceStatus({
        ageSeconds: 400,
        ttlSeconds: 60,
        staleAfterSeconds: 300,
        isPaused: false,
      });

      expect(res.status).toBe('failed');
      expect(res.message).toBe('Uppdateras inte just nu');
    });

    it('returnerar failed när kretsbrytaren är aktiv oavsett datans ålder', () => {
      const res = resolveSourceStatus({
        reportedStatus: 'ok',
        ageSeconds: 10,
        ttlSeconds: 60,
        staleAfterSeconds: 300,
        isPaused: true,
      });

      expect(res.status).toBe('failed');
      expect(res.message).toBe('Uppdateras inte just nu');
    });
  });

  describe('Circuit Breaker i HealthManager', () => {
    it('ökar felräknaren vid enstaka fel utan att utlösa kretsbrytaren (1–4 fel)', () => {
      for (let i = 1; i <= 4; i++) {
        healthManager.recordAttempt({
          sourceId: 'fake-source',
          status: 'failed',
          message: `Fel ${i}`,
        });

        expect(healthManager.isCircuitBreakerActive('fake-source')).toBe(false);
        const record = healthManager.getLatestRecord('fake-source');
        expect(record?.consecutive_failures).toBe(i);
        expect(record?.paused_until).toBeNull();
      }
    });

    it('aktiverar kretsbrytaren vid 5 raka fel och pausar källan i 30 minuter', () => {
      for (let i = 1; i <= 5; i++) {
        healthManager.recordAttempt({
          sourceId: 'fake-source',
          status: 'failed',
          message: `Fel ${i}`,
        });
      }

      expect(healthManager.isCircuitBreakerActive('fake-source')).toBe(true);

      const latest = healthManager.getLatestRecord('fake-source');
      expect(latest?.consecutive_failures).toBe(5);
      expect(latest?.paused_until).toBeDefined();

      const pauseTime = new Date(latest!.paused_until!).getTime();
      const diffMinutes = (pauseTime - Date.now()) / (60 * 1000);
      expect(diffMinutes).toBeGreaterThan(28);
      expect(diffMinutes).toBeLessThanOrEqual(30.1);

      // Hälsostatus ska nu rapportera failed med lugn svensk text
      const health = healthManager.getSourceHealth(adapter);
      expect(health.status).toBe('failed');
      expect(health.message).toBe('Uppdateras inte just nu');
    });

    it('återställer räknaren och kretsbrytaren när ett anrop lyckas', () => {
      // Skapa 5 fel så att kretsbrytaren slår till
      for (let i = 1; i <= 5; i++) {
        healthManager.recordAttempt({
          sourceId: 'fake-source',
          status: 'failed',
          message: 'Fel',
        });
      }
      expect(healthManager.isCircuitBreakerActive('fake-source')).toBe(true);

      // Ett lyckat anrop sker
      healthManager.recordAttempt({
        sourceId: 'fake-source',
        status: 'ok',
        message: 'Allt bra igen',
      });

      expect(healthManager.isCircuitBreakerActive('fake-source')).toBe(false);
      const latest = healthManager.getLatestRecord('fake-source');
      expect(latest?.consecutive_failures).toBe(0);
      expect(latest?.paused_until).toBeNull();
    });

    it('återställer kretsbrytaren via resetCircuitBreaker()', () => {
      for (let i = 1; i <= 5; i++) {
        healthManager.recordAttempt({
          sourceId: 'fake-source',
          status: 'failed',
          message: 'Fel',
        });
      }
      expect(healthManager.isCircuitBreakerActive('fake-source')).toBe(true);

      healthManager.resetCircuitBreaker('fake-source');
      expect(healthManager.isCircuitBreakerActive('fake-source')).toBe(false);
    });
  });
});
