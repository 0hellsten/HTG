const STORAGE_KEY = 'stallbacken_disabled_tip_providers';

export function getDisabledTipProviders(): Set<string> {
  if (typeof window === 'undefined' || !window.localStorage) {
    return new Set();
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return new Set(parsed);
    }
  } catch {}

  return new Set();
}

export function saveDisabledTipProviders(disabledIds: Set<string>): void {
  if (typeof window === 'undefined' || !window.localStorage) {
    return;
  }

  try {
    const arr = Array.from(disabledIds);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
  } catch {}
}

export function isProviderEnabled(providerId: string, disabledIds: Set<string>): boolean {
  return !disabledIds.has(providerId);
}
