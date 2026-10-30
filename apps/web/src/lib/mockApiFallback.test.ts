import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { initMockApiFallback } from './mockApiFallback';

describe('mockApiFallback', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    // Simulera 404 / nätverksfel som på GitHub Pages
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('Failed to fetch'));
    initMockApiFallback();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('levererar dagens lopp på /api/dagar/idag vid nätverksbortfall', async () => {
    const res = await fetch('/api/dagar/idag');
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.status).toBe('ok');
    expect(json.data.length).toBeGreaterThan(0);
    expect(json.data[0].trackName).toBe('Solvalla');
    expect(json.data[0].races.length).toBe(8);
  });

  it('levererar loppdetaljer och startlista på /api/lopp/race_1', async () => {
    const res = await fetch('/api/lopp/race_1');
    const json = await res.json();
    expect(json.status).toBe('ok');
    expect(json.data.race.id).toBe('race_1');
    expect(json.data.starts.length).toBeGreaterThan(0);
    expect(json.data.starts[0].horseName).toBeDefined();
  });

  it('levererar tips från 4 källor på /api/tips', async () => {
    const res = await fetch('/api/tips');
    const json = await res.json();
    expect(json.status).toBe('ok');
    expect(json.data.sources.length).toBe(4);
    expect(json.data.articles.length).toBe(4);
    expect(json.data.raceTips.length).toBe(8);
  });

  it('levererar svenska banor på /api/banor', async () => {
    const res = await fetch('/api/banor');
    const json = await res.json();
    expect(json.status).toBe('ok');
    expect(json.data.length).toBeGreaterThan(5);
    expect(json.data.some((b: any) => b.name === 'Solvalla')).toBe(true);
  });
});
