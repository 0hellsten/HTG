import { describe, it, expect } from 'vitest';
import { createServer } from '../src/index.js';

describe('Server grundstruktur (Fas 1)', () => {
  it('svarar på /halsa med { ok: true }', async () => {
    const server = await createServer();
    const response = await server.inject({
      method: 'GET',
      url: '/halsa',
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.payload);
    expect(body).toEqual({ ok: true });
  });

  it('svarar på /api/status med versionsinformation', async () => {
    const server = await createServer();
    const response = await server.inject({
      method: 'GET',
      url: '/api/status',
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.payload);
    expect(body.ok).toBe(true);
    expect(body.service).toBe('Tangitza Backend');
  });
});
