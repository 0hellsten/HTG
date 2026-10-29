import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { FastifyInstance } from 'fastify';
import { createServer } from '../src/index.js';

describe('Banor och Tips API-rutter (Fas 8)', () => {
  let server: FastifyInstance;

  beforeEach(async () => {
    server = await createServer();
  });

  afterEach(async () => {
    if (server) {
      await server.close();
    }
  });

  it('GET /api/banor returnerar 200 med samtliga svenska banor och banprofiler', async () => {
    const res = await server.inject({
      method: 'GET',
      url: '/api/banor',
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.status).toBe('ok');
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.length).toBeGreaterThanOrEqual(30);

    const solvalla = body.data.find((b: { id: string }) => b.id === '1');
    expect(solvalla).toBeDefined();
    expect(solvalla.name).toBe('Solvalla');
    expect(solvalla.stretchM).toBe(196);
  });

  it('GET /api/banor/:id/statistik returnerar härledd spår- och vinnarstatistik med underlag', async () => {
    const res = await server.inject({
      method: 'GET',
      url: '/api/banor/1/statistik',
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.status).toBe('ok');
    expect(body.data).toBeDefined();
    expect(body.data.postStatsAuto.length).toBe(12);
    expect(body.data.postStatsVolt.length).toBe(15);
    expect(typeof body.data.basedOnRaces).toBe('number');
  });

  it('GET /api/banor/:id/vader returnerar SMHI-väder och stödjer simulateDown', async () => {
    // 1. Normalt väder
    const normalRes = await server.inject({
      method: 'GET',
      url: '/api/banor/1/vader',
    });
    expect(normalRes.statusCode).toBe(200);
    const normalBody = JSON.parse(normalRes.payload);
    expect(normalBody.status).toBe('ok');
    expect(normalBody.data.tempC).toBeDefined();

    // 2. Simulerat fel
    const downRes = await server.inject({
      method: 'GET',
      url: '/api/banor/1/vader?simulateDown=true',
    });
    expect(downRes.statusCode).toBe(200);
    const downBody = JSON.parse(downRes.payload);
    expect(downBody.status).toBe('failed');
    expect(downBody.message).toBe('Vädret går inte att hämta just nu.');
  });

  it('GET /api/tips returnerar samlade tips med källstatus', async () => {
    const res = await server.inject({
      method: 'GET',
      url: '/api/tips',
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.data).toBeDefined();
    expect(Array.isArray(body.data.providers)).toBe(true);
    expect(body.data.providers.length).toBe(3);
    expect(body.data.providers.some((p: { id: string }) => p.id === 'tips-expressen')).toBe(true);
    expect(body.data.providers.some((p: { id: string }) => p.id === 'tips-travronden')).toBe(true);
    expect(body.data.providers.some((p: { id: string }) => p.id === 'tips-aftonbladet')).toBe(true);
  });

  it('GET /api/lopp/:raceId/tips returnerar loppspecifika tips med avsändare', async () => {
    const res = await server.inject({
      method: 'GET',
      url: '/api/lopp/2026-10-29_1_4/tips',
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.data).toBeDefined();
    expect(Array.isArray(body.data.tips)).toBe(true);
  });
});
