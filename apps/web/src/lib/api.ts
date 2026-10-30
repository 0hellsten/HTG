import { getApiBaseUrl } from './api-config';
import { ApiResponse, SourceStatus } from '@stallbacken/shared';

const CACHE_PREFIX = 'stallbacken_api_cache_';

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<ApiResponse<T>> {
  const baseUrl = getApiBaseUrl();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const targetUrl = `${baseUrl}${cleanPath}`;

  const cacheKey = `${CACHE_PREFIX}${cleanPath}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);

    const response = await fetch(targetUrl, {
      ...init,
      signal: controller.signal,
      headers: {
        Accept: 'application/json, text/plain, */*',
        ...(init?.headers || {}),
      },
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const json = (await response.json()) as ApiResponse<T>;
      if (json && json.status && (json.status === 'ok' || json.status === 'stale')) {
        try {
          localStorage.setItem(cacheKey, JSON.stringify(json));
        } catch {}
      }
      return json;
    }

    return fallbackFromStorage<T>(cacheKey);
  } catch {
    return fallbackFromStorage<T>(cacheKey);
  }
}

function fallbackFromStorage<T>(cacheKey: string): ApiResponse<T> {
  try {
    const cachedStr = localStorage.getItem(cacheKey);
    if (cachedStr) {
      const cached = JSON.parse(cachedStr) as ApiResponse<T>;
      return {
        ...cached,
        status: 'stale' as SourceStatus,
        message: 'Sparad data visas — kunde inte nå servern just nu',
      };
    }
  } catch {}

  return {
    data: null as unknown as T,
    status: 'failed' as SourceStatus,
    fetchedAt: new Date().toISOString(),
    message: 'Uppdateras inte just nu',
  };
}
