// Konfiguration för backend-serverns adress (lokalt vs Render)
// Privat, icke-kommersiell användning.

const DEFAULT_RENDER_URL = 'https://htg-server.onrender.com';
const STORAGE_KEY = 'stallbacken_backend_url';

export function getApiBaseUrl(): string {
  // 1. Byggtidsvariabel (om specificerad)
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/$/, '');
  }

  // 2. Utveckling lokalt (använder lokal proxy i Vite)
  if (
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ) {
    return '';
  }

  // 3. Manuellt inställd serveradress i webbläsaren
  if (typeof window !== 'undefined' && window.localStorage) {
    const custom = window.localStorage.getItem(STORAGE_KEY);
    if (custom) {
      return custom.replace(/\/$/, '');
    }
  }

  // 4. Standardadress på Render.com för produktion / GitHub Pages
  return DEFAULT_RENDER_URL;
}

export function setCustomBackendUrl(url: string | null): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  if (!url) {
    window.localStorage.removeItem(STORAGE_KEY);
  } else {
    window.localStorage.setItem(STORAGE_KEY, url.trim().replace(/\/$/, ''));
  }
}
