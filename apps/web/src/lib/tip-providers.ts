// Hantering av valda och avmarkerade tipskällor i Stallbacken
// Privat, icke-kommersiell användning. Ingen vidarespridning av data.

const STORAGE_KEY = 'stallbacken_disabled_tip_providers';

/**
 * Hämtar mängden av avmarkerade tipskällor från webbläsarens lokala lagring.
 * Alla källor är markerade som standard (tom mängd av avmarkerade).
 */
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
  } catch {
    // Vid fel i lagringen, återgå till standard (alla aktiva)
  }

  return new Set();
}

/**
 * Sparar avmarkerade tipskällor i webbläsaren så att valet består mellan sessioner.
 */
export function saveDisabledTipProviders(disabledIds: Set<string>): void {
  if (typeof window === 'undefined' || !window.localStorage) {
    return;
  }

  try {
    const arr = Array.from(disabledIds);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
  } catch {
    // Tyst felhantering vid begränsningar i webbläsarlagring
  }
}

/**
 * Kontrollerar om en specifik tipskälla är aktiv.
 */
export function isProviderEnabled(providerId: string, disabledIds: Set<string>): boolean {
  return !disabledIds.has(providerId);
}
