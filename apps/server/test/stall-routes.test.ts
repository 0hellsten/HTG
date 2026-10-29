import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createServer } from '../src/index.js';
import { FastifyInstance } from 'fastify';
import fs from 'fs';
import { HealthManager } from '../src/health/health-manager.js';
import { getDb } from '../src/db/connection.js';

describe('Stall API-rutter (Fas 9)', () => {
  let app: FastifyInstance;
  const testDbPath = `./data/test-stall-${Date.now()}.db`;

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

  it('GET /api/stall/anmalda-idag returnerar 200 med aktiva anmälningar', async () => {
    // Först hämtar vi idag så att lopp och starter sparas i databasen
    await app.inject({ method: 'GET', url: '/api/dagar/idag' });

    const res = await app.inject({
      method: 'GET',
      url: '/api/stall/anmalda-idag',
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);

    expect(body.status).toBeDefined();
    expect(body.fetchedAt).toBeDefined();
    expect(body.data).toBeDefined();
    expect(Array.isArray(body.data.entries)).toBe(true);
    expect(Array.isArray(body.data.trackIdsWithRaces)).toBe(true);
  });

  it('POST /api/kallor/uppdatera-allt returnerar 200 och triggar uppdatering', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/kallor/uppdatera-allt',
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);

    expect(body.status).toBeDefined();
    expect(body.fetchedAt).toBeDefined();
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.message).toContain('källor');
  });
});
