import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createServer } from '../src/index.js';
import { FastifyInstance } from 'fastify';
import fs from 'fs';
import { HealthManager } from '../src/health/health-manager.js';
import { getDb } from '../src/db/connection.js';

describe('Lopp API-rutter', () => {
  let app: FastifyInstance;
  const testDbPath = `./data/test-lopp-${Date.now()}.db`;

  beforeEach(async () => {
    try {
      const hm = new HealthManager(getDb());
      hm.resetCircuitBreaker('atg-odds');
      hm.resetCircuitBreaker('atg-racinginfo');
    } catch {
      // Ignorera
    }
    app = await createServer(testDbPath);
  });

  afterEach(async () => {
    await app.close();
    try {
      if (fs.existsSync(testDbPath)) fs.unlinkSync(testDbPath);
      if (fs.existsSync(`${testDbPath}-wal`)) fs.unlinkSync(`${testDbPath}-wal`);
      if (fs.existsSync(`${testDbPath}-shm`)) fs.unlinkSync(`${testDbPath}-shm`);
    } catch {
      // Ignorera borttagning vid låst fil
    }
  });

  it('GET /api/dagar/idag returnerar 200 med tävlingsdagar och lopp', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/dagar/idag',
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);

    expect(body.status).toBeDefined();
    expect(body.fetchedAt).toBeDefined();
    expect(body.message).toBeDefined();
    expect(Array.isArray(body.data)).toBe(true);

    if (body.data.length > 0) {
      const first = body.data[0];
      expect(first.trackName).toBeDefined();
      expect(Array.isArray(first.races)).toBe(true);
    }
  });

  it('GET /api/lopp/:raceId returnerar 200 med loppdetaljer och startlista', async () => {
    // Anropa först idag så att loppet finns
    await app.inject({ method: 'GET', url: '/api/dagar/idag' });

    const res = await app.inject({
      method: 'GET',
      url: '/api/lopp/2026-10-29_1_4',
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);

    expect(body.status).toBe('ok');
    expect(body.data).toBeDefined();
    expect(body.data.race).toBeDefined();
    expect(body.data.race.name).toContain('Solvalla');
    expect(Array.isArray(body.data.starts)).toBe(true);
    expect(body.data.starts.length).toBe(4);
  });

  it('GET /api/lopp/okant-lopp returnerar 200 med null och felmeddelande på svenska', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/lopp/finns-inte',
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.status).toBe('failed');
    expect(body.data).toBeNull();
    expect(body.message).toBe('Uppdateras inte just nu');
  });

  it('GET /api/lopp/:raceId/odds returnerar 200 med odds och streckprocent', async () => {
    // Hämta loppet först så att lopp och starter skapas
    await app.inject({ method: 'GET', url: '/api/dagar/idag' });
    await app.inject({ method: 'GET', url: '/api/lopp/2026-10-29_1_4' });

    const res = await app.inject({
      method: 'GET',
      url: '/api/lopp/2026-10-29_1_4/odds',
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);

    expect(body.status).toBe('ok');
    expect(body.data).toBeDefined();
    expect(body.data.raceId).toBe('2026-10-29_1_4');
    expect(body.data.timeFormatted).toBe('18:42');
    expect(Array.isArray(body.data.odds)).toBe(true);
    expect(body.data.odds.length).toBeGreaterThan(0);

    const horse1 = body.data.odds.find((o: { startNumber: number }) => o.startNumber === 1);
    expect(horse1.winOdds).toBe(3.45);
    expect(horse1.stakePercent).toBe(24);
  });

  it('GET /api/lopp/:raceId/odds med simulateDown=true returnerar 200 med status failed', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/lopp/2026-10-29_1_4/odds?simulateDown=true',
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);

    expect(body.status).toBe('failed');
    expect(body.data).toBeNull();
    expect(body.message).toBe('Oddsen uppdateras inte just nu. Allt annat på sidan är färskt.');
  });
});
