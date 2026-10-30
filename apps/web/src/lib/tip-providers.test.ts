import { describe, it, expect, beforeEach } from 'vitest';
import {
  getDisabledTipProviders,
  saveDisabledTipProviders,
  isProviderEnabled,
} from './tip-providers';

class LocalStorageMock {
  private store: Record<string, string> = {};

  clear() {
    this.store = {};
  }

  getItem(key: string) {
    return this.store[key] || null;
  }

  setItem(key: string, value: string) {
    this.store[key] = String(value);
  }

  removeItem(key: string) {
    delete this.store[key];
  }
}

describe('Tipskällor och filtrering', () => {
  beforeEach(() => {
    const mock = new LocalStorageMock();
    (globalThis as unknown as { localStorage: LocalStorageMock }).localStorage = mock;
    (globalThis as unknown as { window: { localStorage: LocalStorageMock } }).window = {
      localStorage: mock,
    };
  });

  it('alla tipskällor är aktiva som standard', () => {
    const disabled = getDisabledTipProviders();
    expect(disabled.size).toBe(0);

    expect(isProviderEnabled('tips-expressen', disabled)).toBe(true);
    expect(isProviderEnabled('tips-travronden', disabled)).toBe(true);
    expect(isProviderEnabled('tips-aftonbladet', disabled)).toBe(true);
    expect(isProviderEnabled('tips-sulkysport', disabled)).toBe(true);
  });

  it('sparar och läser in avmarkerade källor från localStorage', () => {
    const toDisable = new Set(['tips-expressen', 'tips-sulkysport']);
    saveDisabledTipProviders(toDisable);

    const loaded = getDisabledTipProviders();
    expect(loaded.has('tips-expressen')).toBe(true);
    expect(loaded.has('tips-sulkysport')).toBe(true);
    expect(loaded.has('tips-travronden')).toBe(false);

    expect(isProviderEnabled('tips-expressen', loaded)).toBe(false);
    expect(isProviderEnabled('tips-travronden', loaded)).toBe(true);
  });
});
