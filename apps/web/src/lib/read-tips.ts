const STORAGE_KEY = 'stallbacken_read_tips';

export function getReadTipIds(): Set<string> {
  if (typeof window === 'undefined' || !window.localStorage) {
    return new Set<string>();
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set<string>();
    const parsed = JSON.parse(raw);
    return new Set<string>(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set<string>();
  }
}

export function saveReadTipId(id: string): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    const current = getReadTipIds();
    current.add(id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(current)));
  } catch {}
}
