import { describe, it, expect } from 'vitest';
import { FakeSourceAdapter } from '../src/adapters/fake-source.js';

describe('Testadapter fake-source (Fas 2)', () => {
  it('returnerar ok med data i standardläget', async () => {
    const adapter = new FakeSourceAdapter();
    const result = await adapter.fetch();

    expect(result.sourceId).toBe('fake-source');
    expect(result.status).toBe('ok');
    expect(result.data).toBeDefined();
    expect(result.message).toBe('');
  });

  it('kan tvingas till läget failed', async () => {
    const adapter = new FakeSourceAdapter({ forcedStatus: 'failed' });
    const result = await adapter.fetch();

    expect(result.status).toBe('failed');
    expect(result.data).toBeNull();
    expect(result.message).toBe('Uppdateras inte just nu');
  });

  it('kan tvingas till läget degraded', async () => {
    const adapter = new FakeSourceAdapter({ forcedStatus: 'degraded' });
    const result = await adapter.fetch();

    expect(result.status).toBe('degraded');
    expect(result.data).toBeDefined();
    expect(result.message).toBe('Delvis uppdaterat');
  });

  it('kastar aldrig uppåt även när internt fel uppstår', async () => {
    const adapter = new FakeSourceAdapter({ simulateThrow: true });
    // Ska inte kasta
    const result = await adapter.fetch();

    expect(result.status).toBe('failed');
    expect(result.data).toBeNull();
    expect(result.message).toBe('Uppdateras inte just nu');
    expect(result.detail).toContain('Simulerat internt adapterfel');
  });
});
