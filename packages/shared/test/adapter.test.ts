import { describe, it, expect } from 'vitest';
import type { SourceResult, SourceStatus } from '../src/index.js';

describe('Shared typer och kontrakt (Fas 1)', () => {
  it('kan skapa ett giltigt SourceResult-objekt', () => {
    const result: SourceResult<{ test: boolean }> = {
      sourceId: 'fake-source',
      status: 'ok' as SourceStatus,
      data: { test: true },
      fetchedAt: new Date().toISOString(),
      ageSeconds: 0,
      message: 'Allt är färskt.',
    };

    expect(result.status).toBe('ok');
    expect(result.data?.test).toBe(true);
    expect(result.sourceId).toBe('fake-source');
  });
});
