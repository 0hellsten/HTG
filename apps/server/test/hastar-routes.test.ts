import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createServer } from '../src/index.js';
import { FastifyInstance } from 'fastify';
import fs from 'fs';
import { HealthManager } from '../src/health/health-manager.js';
import { getDb } from '../src/db/connection.js';

describe('Hästar API-rutter', () => {
  let app: FastifyInstance;
  const testDbPath = `./data/test-hastar-${Date.now()}.db`;

  beforeEach(async () => {
    // Återställ kretsbrytaren för källan
    try {
      const hm = new HealthManager(getDb());
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
      // Ignorera
    }
  });

  it('GET /api/hastar/:horseId returnerar 200 med hästprofil, form i backspegeln och spårstatistik', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/hastar/783840',
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);

    expect(body.status).toBe('ok');
    expect(body.data).toBeDefined();

    // Grunduppgifter
    const horse = body.data.horse;
    expect(horse.id).toBe('783840');
    expect(horse.name).toBe('Global F.N.P.');
    expect(horse.pedigree).toBeDefined();
    expect(horse.pedigree.father).toBe("S.J.'s Caviar");
    expect(horse.pedigree.mother).toBe('Alberte Merci');
    expect(horse.pedigree.grandfather).toBe('Ready Cash');
    expect(horse.earningsTotal).toBeGreaterThan(0);

    // Form i backspegeln (10 senaste starterna)
    expect(Array.isArray(body.data.pastStarts)).toBe(true);
    expect(body.data.pastStarts.length).toBeLessThanOrEqual(10);
    expect(body.data.pastStarts.length).toBeGreaterThan(0);

    const firstStart = body.data.pastStarts[0];
    expect(firstStart.date).toBeDefined();
    expect(firstStart.trackName).toBeDefined();
    expect(firstStart.place).toBeDefined();
    expect(firstStart.kmTime).toBeDefined();

    // Ryggar och lägen (spårstatistik)
    expect(Array.isArray(body.data.positionStats)).toBe(true);

    // Träning och kusk
    expect(body.data.trainingForm).toBeDefined();
  });

  it('GET /api/hastar/:horseId med simulateDown=true returnerar 200 med status failed och svenskt meddelande', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/hastar/783840?simulateDown=true',
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);

    expect(body.status).toBe('failed');
    expect(body.message).toBe(
      'Den här hästens tidigare lopp går inte att hämta för tillfället. Resten stämmer.'
    );
  });

  it('GET /api/hastar/sok söker efter hästar på namn', async () => {
    // Säkerställ att minst en häst finns i databasen
    await app.inject({ method: 'GET', url: '/api/hastar/783840' });

    const res = await app.inject({
      method: 'GET',
      url: '/api/hastar/sok?q=Global',
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);

    expect(body.status).toBe('ok');
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.length).toBeGreaterThan(0);
    expect(body.data[0].name).toContain('Global');
  });

  it('GET /api/hastar/sok utan träff returnerar tom lista och lugn microcopy', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/hastar/sok?q=FinnsDefinitivtInteNagonstans',
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);

    expect(body.status).toBe('ok');
    expect(body.data).toEqual([]);
    expect(body.message).toBe('Hittade ingen häst med det namnet. Prova med en del av namnet.');
  });

  it('POST /api/hastar/jamfor returnerar profiler för valda hästar i batch', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/hastar/jamfor',
      payload: {
        horseIds: ['783840'],
      },
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);

    expect(body.status).toBe('ok');
    expect(body.data).toBeDefined();
    expect(body.data['783840']).toBeDefined();
    expect(body.data['783840'].horse.name).toBe('Global F.N.P.');
  });

  it('POST /api/hastar/jamfor med simulateDown=true returnerar status failed och svenskt meddelande', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/hastar/jamfor',
      payload: {
        horseIds: ['783840'],
        simulateDown: true,
      },
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);

    expect(body.status).toBe('failed');
    expect(body.message).toBe(
      'Tidigare lopp och historik går inte att hämta för tillfället. Resten stämmer.'
    );
    expect(body.data['783840']).toBeNull();
  });

  it('GET /api/hastar/ranking returnerar topprankade hästar', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/hastar/ranking?kategori=vinstrikast',
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);

    expect(body.status).toBe('ok');
    expect(body.data.category).toBe('vinstrikast');
    expect(Array.isArray(body.data.items)).toBe(true);
    expect(body.data.items.length).toBeGreaterThan(0);

    const firstHorse = body.data.items[0];
    expect(firstHorse.rankPosition).toBe(1);
    expect(firstHorse.name).toBeDefined();
    expect(firstHorse.earningsTotal).toBeGreaterThan(0);
  });

  it('GET /api/hastar/sok med sökterm hittar kända elithästar', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/hastar/sok?q=San',
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);

    expect(body.status).toBe('ok');
    expect(Array.isArray(body.data)).toBe(true);
    const sanMoteur = body.data.find((h: { name: string }) => h.name.includes('San Moteur'));
    expect(sanMoteur).toBeDefined();
    expect(sanMoteur.trainerName).toBe('Björn Goop');
    expect(sanMoteur.earningsTotal).toBeGreaterThan(10000000);
  });
});
