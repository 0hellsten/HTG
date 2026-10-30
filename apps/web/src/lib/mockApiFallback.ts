import { MOCK_TRACKS, getMockTrackProfile, getMockTrackStats, getMockTrackWeather } from './mock-data/tracks';
import { getMockTodayRaceDays, getMockRaceDetails, getMockRaceOdds } from './mock-data/races';
import {
  getMockHorseProfile,
  searchMockHorses,
  getMockHorseRanking,
  getMockStallAnmalda,
} from './mock-data/horses';
import { getMockAllTips, getMockRaceTips, getMockKallorStatus } from './mock-data/tips';
import { getApiBaseUrl } from './api-config';

function createJsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function routeMockApi(pathname: string, searchParams: URLSearchParams): Response {
  const now = new Date().toISOString();

  // /api/dagar/idag
  if (pathname.endsWith('/api/dagar/idag')) {
    return createJsonResponse({
      data: getMockTodayRaceDays(),
      status: 'ok',
      fetchedAt: now,
      message: 'Dagens omgång hämtad',
    });
  }

  // /api/lopp/:raceId/odds
  const oddsMatch = pathname.match(/\/api\/lopp\/([^/]+)\/odds/);
  if (oddsMatch) {
    return createJsonResponse({
      data: getMockRaceOdds(oddsMatch[1]),
      status: 'ok',
      fetchedAt: now,
      message: 'Odds hämtade',
    });
  }

  // /api/lopp/:raceId/tips
  const loppTipsMatch = pathname.match(/\/api\/lopp\/([^/]+)\/tips/);
  if (loppTipsMatch) {
    return createJsonResponse({
      data: getMockRaceTips(loppTipsMatch[1]),
      status: 'ok',
      fetchedAt: now,
      message: 'Tips hämtade',
    });
  }

  // /api/lopp/:raceId
  const raceMatch = pathname.match(/\/api\/lopp\/([^/]+)$/);
  if (raceMatch) {
    return createJsonResponse({
      data: getMockRaceDetails(raceMatch[1]),
      status: 'ok',
      fetchedAt: now,
      message: 'Lopp hämtat',
    });
  }

  // /api/tips
  if (pathname.endsWith('/api/tips')) {
    return createJsonResponse({
      data: getMockAllTips(),
      status: 'ok',
      fetchedAt: now,
      message: 'Tips från alla källor hämtade',
    });
  }

  // /api/banor/:trackId/statistik
  const trackStatsMatch = pathname.match(/\/api\/banor\/([^/]+)\/statistik/);
  if (trackStatsMatch) {
    return createJsonResponse({
      data: getMockTrackStats(trackStatsMatch[1]),
      status: 'ok',
      fetchedAt: now,
      message: 'Spårstatistik hämtad',
    });
  }

  // /api/banor/:trackId/vader
  const trackWeatherMatch = pathname.match(/\/api\/banor\/([^/]+)\/vader/);
  if (trackWeatherMatch) {
    return createJsonResponse({
      data: getMockTrackWeather(trackWeatherMatch[1]),
      status: 'ok',
      fetchedAt: now,
      message: 'Väder hämtat',
    });
  }

  // /api/banor/:trackId
  const trackProfileMatch = pathname.match(/\/api\/banor\/([^/]+)$/);
  if (trackProfileMatch) {
    return createJsonResponse({
      data: getMockTrackProfile(trackProfileMatch[1]),
      status: 'ok',
      fetchedAt: now,
      message: 'Banprofil hämtad',
    });
  }

  // /api/banor
  if (pathname.endsWith('/api/banor')) {
    return createJsonResponse({
      data: MOCK_TRACKS,
      status: 'ok',
      fetchedAt: now,
      message: 'Banor hämtade',
    });
  }

  // /api/hastar/ranking
  if (pathname.includes('/api/hastar/ranking')) {
    const kat = (searchParams.get('kategori') as any) || 'elit';
    return createJsonResponse({
      data: getMockHorseRanking(kat),
      status: 'ok',
      fetchedAt: now,
      message: 'Ranking hämtad',
    });
  }

  // /api/hastar/sok
  if (pathname.includes('/api/hastar/sok')) {
    const q = searchParams.get('q') || '';
    return createJsonResponse({
      data: searchMockHorses(q),
      status: 'ok',
      fetchedAt: now,
      message: 'Sökresultat hämtade',
    });
  }

  // /api/hastar/:horseId
  const horseMatch = pathname.match(/\/api\/hastar\/([^/]+)$/);
  if (horseMatch) {
    return createJsonResponse({
      data: getMockHorseProfile(horseMatch[1]),
      status: 'ok',
      fetchedAt: now,
      message: 'Hästprofil hämtad',
    });
  }

  // /api/stall/anmalda-idag
  if (pathname.endsWith('/api/stall/anmalda-idag')) {
    return createJsonResponse({
      data: getMockStallAnmalda(),
      status: 'ok',
      fetchedAt: now,
      message: 'Aktiva hästar hämtade',
    });
  }

  // /api/kallor/uppdatera-allt
  if (pathname.endsWith('/api/kallor/uppdatera-allt')) {
    return createJsonResponse({
      data: { success: true },
      status: 'ok',
      fetchedAt: now,
      message: 'Uppdaterat',
    });
  }

  // /api/kallor
  if (pathname.endsWith('/api/kallor')) {
    return createJsonResponse({
      data: getMockKallorStatus(),
      status: 'ok',
      fetchedAt: now,
      message: 'Källor hämtade',
    });
  }

  return createJsonResponse({
    data: null,
    status: 'failed',
    fetchedAt: now,
    message: 'Uppgifterna saknas',
  });
}

export function initMockApiFallback(): void {
  const globalTarget = typeof window !== 'undefined' ? window : globalThis;
  if (!globalTarget || typeof globalTarget.fetch !== 'function') return;

  const originalFetch = globalTarget.fetch.bind(globalTarget);

  globalTarget.fetch = async function (input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    const urlStr =
      typeof input === 'string'
        ? input
        : input instanceof URL
          ? input.toString()
          : (input as Request).url;

    if (!urlStr.includes('/api/')) {
      return originalFetch(input, init);
    }

    const baseUrl = getApiBaseUrl();
    const targetUrl = baseUrl && urlStr.startsWith('/api/') ? `${baseUrl}${urlStr}` : urlStr;

    try {
      const res = await originalFetch(targetUrl, init);
      const ct = res.headers.get('content-type') || '';
      if (res.ok && ct.includes('application/json')) {
        return res;
      }
    } catch {
      // Ignorera nätverksfel och gå direkt till fallback
    }

    const dummyBase = 'http://localhost';
    const parsed = new URL(urlStr, dummyBase);
    return routeMockApi(parsed.pathname, parsed.searchParams);
  };
}
