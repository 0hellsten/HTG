import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createServer } from '../src/index.js';
import { FastifyInstance } from 'fastify';
import fs from 'fs';

describe('Janne Boy API-rutter', () => {
  let app: FastifyInstance;
  const testDbPath = `./data/test-janne-boy-${Date.now()}.db`;

  beforeEach(async () => {
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

  it('GET /api/janne-boy/omgang?gameType=V75 returnerar 200 med berikat V75-underlag', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/janne-boy/omgang?gameType=V75',
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);

    expect(body.status).toBe('ok');
    expect(body.data).toBeDefined();
    expect(body.data.gameType).toBe('V75');
    expect(body.data.races).toHaveLength(7);

    const firstLeg = body.data.races[0];
    expect(firstLeg.horses.length).toBeGreaterThan(0);
    expect(firstLeg.horses[0].startNumber).toBeDefined();
    expect(firstLeg.horses[0].betDistribution).toBeGreaterThan(0);
    expect(firstLeg.horses[0].winOdds).toBeGreaterThan(0);
  });

  it('GET /api/janne-boy/omgang?gameType=V86 returnerar 200 med 8 avdelningar', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/janne-boy/omgang?gameType=V86',
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);

    expect(body.data.gameType).toBe('V86');
    expect(body.data.races).toHaveLength(8);
  });
});
