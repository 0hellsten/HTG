import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { FastifyInstance } from 'fastify';
import { createServer } from '../src/index.js';
import { fakeSource } from '../src/adapters/fake-source.js';
import { HealthManager } from '../src/health/health-manager.js';

describe('API-rutt /api/kallor och degradering (Fas 2)', () => {
  let server: FastifyInstance;

  beforeEach(async () => {
    server = await createServer();
    fakeSource.reset();
    const hm = new HealthManager();
    hm.resetCircuitBreaker('fake-source');
  });

  afterEach(async () => {
    if (server) {
      await server.close();
    }
  });

  it('listar källor på svenska på GET /api/kallor', async () => {
    const res = await server.inject({
      method: 'GET',
      url: '/api/kallor',
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.status).toBe('ok');
    expect(Array.isArray(body.data)).toBe(true);

    const fakeSourceHealth = body.data.find(
      (s: { sourceId: string }) => s.sourceId === 'fake-source'
    );
    expect(fakeSourceHealth).toBeDefined();
    expect(fakeSourceHealth.label).toBe('Testkälla');
  });

  it('rapporterar failed för fake-source när den slås av, medan övriga routes fungerar normalt', async () => {
    // 1. Slå av fake-source via test-routen
    const postRes = await server.inject({
      method: 'POST',
      url: '/api/test/fake-source',
      payload: {
        status: 'failed',
        message: 'Uppdateras inte just nu',
      },
    });
    expect(postRes.statusCode).toBe(200);

    // 2. Kontrollera GET /api/kallor
    const kallorRes = await server.inject({
      method: 'GET',
      url: '/api/kallor',
    });
    expect(kallorRes.statusCode).toBe(200);
    const kallorBody = JSON.parse(kallorRes.payload);

    const fakeSourceHealth = kallorBody.data.find(
      (s: { sourceId: string }) => s.sourceId === 'fake-source'
    );
    expect(fakeSourceHealth).toBeDefined();
    expect(fakeSourceHealth.status).toBe('failed');
    expect(fakeSourceHealth.message).toBe('Uppdateras inte just nu');

    // 3. Verifiera att övriga systemkomponenter och routes inte påverkas
    const halsaRes = await server.inject({
      method: 'GET',
      url: '/halsa',
    });
    expect(halsaRes.statusCode).toBe(200);
    expect(JSON.parse(halsaRes.payload)).toEqual({ ok: true });

    const statusRes = await server.inject({
      method: 'GET',
      url: '/api/status',
    });
    expect(statusRes.statusCode).toBe(200);
    expect(JSON.parse(statusRes.payload).ok).toBe(true);
  });

  it('återställer fake-source via POST /api/test/fake-source med reset=true', async () => {
    // Slå av först
    await server.inject({
      method: 'POST',
      url: '/api/test/fake-source',
      payload: { status: 'failed' },
    });

    // Återställ
    const resetRes = await server.inject({
      method: 'POST',
      url: '/api/test/fake-source',
      payload: { reset: true },
    });
    expect(resetRes.statusCode).toBe(200);

    // Sätt till ok
    await server.inject({
      method: 'POST',
      url: '/api/test/fake-source',
      payload: { status: 'ok' },
    });

    const kallorRes = await server.inject({
      method: 'GET',
      url: '/api/kallor',
    });
    const kallorBody = JSON.parse(kallorRes.payload);
    const fake = kallorBody.data.find((s: { sourceId: string }) => s.sourceId === 'fake-source');
    expect(fake.status).toBe('ok');
  });
});
