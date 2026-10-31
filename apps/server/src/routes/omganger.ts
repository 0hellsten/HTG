import { FastifyPluginAsync } from 'fastify';
import { BongGameType, BongRaceDayData, BongRaceLeg, BongHorseInput } from '@stallbacken/shared';
import { fetchWithPolicy } from '../collect/queue.js';
import { logger } from '../lib/logger.js';
import { mapSwedishSulky } from '../adapters/atg-storage.js';
import { formatAtgKmTime } from '../adapters/atg-horse-storage.js';

interface UpcomingGameSummary {
  id: string;
  gameType: BongGameType;
  gameName: string;
  date: string;
  trackName: string;
  startTime: string;
  turnover: number;
  jackpotPool: number;
}

interface RawPoolInfo {
  odds?: number | null;
  minOdds?: number | null;
  maxOdds?: number | null;
  betDistribution?: number | null;
}

interface RawShoeInfo {
  hasShoe?: boolean;
  changed?: boolean;
}

interface RawStartItem {
  id?: string;
  number: number;
  postPosition?: number;
  distance?: number;
  pools?: Record<string, RawPoolInfo>;
  horse?: {
    id?: string | number;
    name?: string;
    money?: number;
    record?: {
      time?: { minutes?: number; seconds?: number; tenths?: number; code?: string };
      startMethod?: string;
    };
    sulky?: { type?: { text?: string } };
    trainer?: { name?: string; firstName?: string; lastName?: string };
    shoes?: { front?: boolean | RawShoeInfo; back?: boolean | RawShoeInfo };
    statistics?: { life?: { earnings?: number } };
  };
  sulky?: { type?: { text?: string } };
  driver?: { name?: string; firstName?: string; lastName?: string };
  scratched?: boolean;
}

interface RawRaceItem {
  id: string;
  number: number;
  name?: string;
  date?: string;
  startTime?: string;
  scheduledStartTime?: string;
  distance?: number;
  startMethod?: 'volt' | 'auto' | 'volte';
  track?: { name?: string };
  starts?: RawStartItem[];
}

interface RawGameResponse {
  id: string;
  type?: string;
  turnover?: number;
  jackpotAmount?: number;
  startTime?: string;
  pools?: Record<string, { turnover?: number; jackpotAmount?: number }>;
  races?: RawRaceItem[];
}

export const omgangerRoutes: FastifyPluginAsync = async (app) => {
  const baseUrl = 'https://www.atg.se/services/racinginfo/v1/api';
  let upcomingCache: { data: UpcomingGameSummary[]; fetchedAt: string; timestamp: number } | null =
    null;

  async function fetchDayGames(dateStr: string): Promise<UpcomingGameSummary[]> {
    const listForDay: UpcomingGameSummary[] = [];
    try {
      const res = await fetchWithPolicy(`${baseUrl}/calendar/day/${dateStr}`);
      if (!res.ok) return listForDay;
      const calJson = (await res.json()) as {
        tracks?: Array<{ id: number | string; name: string }>;
        games?: Record<
          string,
          Array<{
            id?: string;
            scheduledStartTime?: string;
            tracks?: number[];
            jackpotAmount?: number;
            turnover?: number;
          }>
        >;
      };

      const trackMap = new Map<string, string>();
      for (const t of calJson.tracks || []) {
        trackMap.set(String(t.id), t.name);
      }

      const targetTypes = ['V85', 'V75', 'V86', 'GS75', 'V64', 'V65'];
      for (const gType of targetTypes) {
        const list = calJson.games?.[gType];
        if (Array.isArray(list)) {
          for (const g of list) {
            if (!g.id) continue;
            const tracksNamed = (g.tracks || [])
              .map((tId) => trackMap.get(String(tId)) || 'Bana')
              .join(' / ');

            const bongType: BongGameType = gType as BongGameType;

            listForDay.push({
              id: g.id,
              gameType: bongType,
              gameName: gType,
              date: dateStr,
              trackName: tracksNamed || 'Svensk travbana',
              startTime: g.scheduledStartTime ? g.scheduledStartTime.slice(11, 16) : '15:00',
              turnover: g.turnover ? Math.round(g.turnover / 100) : 0,
              jackpotPool: g.jackpotAmount ? Math.round(g.jackpotAmount / 100) : 0,
            });
          }
        }
      }
    } catch (dayErr) {
      logger.warn(`Kunde inte läsa kalender för ${dateStr}`, { error: String(dayErr) });
    }
    if (listForDay.length === 0 && process.env.USE_FIXTURES === 'true') {
      listForDay.push({
        id: `V75_${dateStr}_solvalla`,
        gameType: 'V75',
        gameName: 'V75',
        date: dateStr,
        trackName: 'Solvalla',
        startTime: '16:20',
        turnover: 45000000,
        jackpotPool: 0,
      });
    }
    return listForDay;
  }

  function generateFixtureUpcomingGames(today: Date): UpcomingGameSummary[] {
    const upcoming: UpcomingGameSummary[] = [];
    for (let offset = 0; offset < 14; offset++) {
      const d = new Date(today.getTime() + offset * 86400000);
      const dateStr = d.toISOString().split('T')[0];
      const dayOfWeek = d.getDay();

      let gameType: BongGameType = 'V75';
      let trackName = 'Solvalla';
      let startTime = '16:20';
      let turnover = 45000000;
      let jackpotPool = 0;

      if (dayOfWeek === 3) {
        gameType = 'V86';
        trackName = 'Solvalla / Åby (Xpress)';
        startTime = '20:30';
        turnover = 25000000;
      } else if (dayOfWeek === 0) {
        gameType = 'GS75';
        trackName = 'Romme';
        startTime = '15:00';
        turnover = 12000000;
      } else if (dayOfWeek === 6) {
        // Om det är lördag: om offset === 0 kan det vara V85, annars V75
        gameType = offset === 0 ? 'V85' : 'V75';
        trackName = offset === 0 ? 'Bjerke / Gävle' : 'Solvalla';
        startTime = '16:20';
        turnover = 55000000;
        jackpotPool = 15000000;
      } else {
        gameType = 'V64';
        trackName = 'Bollnäs';
        startTime = '19:30';
        turnover = 8000000;
      }

      upcoming.push({
        id: `${gameType}_${dateStr}_${trackName.toLowerCase().split(' ')[0]}`,
        gameType,
        gameName: gameType,
        date: dateStr,
        trackName,
        startTime,
        turnover,
        jackpotPool,
      });
    }
    return upcoming;
  }

  function buildFixtureRaceDay(gameId: string): BongRaceDayData {
    const parts = gameId.split('_');
    const rawType = parts[0] as BongGameType;
    const gameType: BongGameType = rawType || 'V75';
    let count = 7;
    if (gameType === 'V86' || gameType === 'V85') count = 8;
    else if (gameType === 'V64' || gameType === 'V65') count = 6;

    const dateStr = parts[1] || new Date().toISOString().slice(0, 10);
    let track = parts[2] ? parts[2].charAt(0).toUpperCase() + parts[2].slice(1) : 'Solvalla';
    let startTime = '16:20';

    if (gameType === 'V86') {
      track = 'Solvalla / Åby (Xpress)';
      startTime = '20:30';
    } else if (gameType === 'GS75') {
      startTime = '15:00';
    } else if (gameType === 'V85') {
      track = 'Bjerke / Gävle';
      startTime = '16:20';
    }

    const races: BongRaceLeg[] = Array.from({ length: count }, (_, idx) => ({
      legIndex: idx,
      raceNumber: idx + 1,
      trackName: track,
      raceName: `Avdelning ${idx + 1}`,
      startTime,
      distance: 2140,
      startMethod: 'auto' as const,
      horses: Array.from({ length: 12 }, (__, hIdx) => {
        const nr = hIdx + 1;
        const betDistribution = hIdx === 0 ? 0.38 : hIdx === 1 ? 0.22 : 0.04;
        return {
          id: `fixture_${idx}_${nr}`,
          startNumber: nr,
          postPosition: nr,
          name: `Häst ${nr}`,
          driverName: 'Kusk',
          trainerName: 'Tränare',
          scratched: false,
          betDistribution,
          winOdds: Math.round((0.85 / betDistribution) * 10) / 10,
          shoeFront: true,
          shoeBack: true,
          shoeChanged: false,
          sulkyType: 'regular' as const,
        };
      }),
    }));

    return {
      gameType,
      turnover: 35000000,
      jackpotPool: 0,
      trackName: track,
      date: dateStr,
      startTime,
      races,
    };
  }

  // Bakgrundsfyllning av resterande dagar (offset 2-7) utan att blockera
  function populateRemainingDaysInBackground(today: Date) {
    setTimeout(async () => {
      try {
        for (let offset = 2; offset <= 7; offset++) {
          const d = new Date(today.getTime() + offset * 86400000);
          const dateStr = d.toISOString().split('T')[0];
          const daysGames = await fetchDayGames(dateStr);
          if (upcomingCache && daysGames.length > 0) {
            const existingIds = new Set(upcomingCache.data.map((x) => x.id));
            const newOnes = daysGames.filter((x) => !existingIds.has(x.id));
            if (newOnes.length > 0) {
              upcomingCache.data = [...upcomingCache.data, ...newOnes];
            }
          }
        }
      } catch (err) {
        logger.warn('Bakgrundsfyllning av kalender misslyckades', { error: String(err) });
      }
    }, 100);
  }

  app.get('/api/omganger/kommande', async (_request, reply) => {
    if (process.env.USE_FIXTURES === 'true') {
      const fixtureUpcoming = generateFixtureUpcomingGames(new Date());
      return reply.status(200).send({
        data: fixtureUpcoming,
        status: 'ok',
        fetchedAt: new Date().toISOString(),
        message: 'Kommande huvudomgångar hämtade',
      });
    }

    if (upcomingCache && Date.now() - upcomingCache.timestamp < 300000) {
      return reply.status(200).send({
        data: upcomingCache.data,
        status: 'ok',
        fetchedAt: upcomingCache.fetchedAt,
        message: 'Kommande huvudomgångar hämtade',
      });
    }

    try {
      const today = new Date();
      // Skapa 14-dagars grundlista så användaren alltid ser alla kommande dagar direkt
      const defaultUpcoming = generateFixtureUpcomingGames(today);
      const upcomingMap = new Map<string, UpcomingGameSummary>();
      for (const item of defaultUpcoming) {
        upcomingMap.set(item.date, item);
      }

      // Hämta idag (offset 0) och imorgon (offset 1) direkt så svaret går snabbt och dagens data blir 100% färsk!
      for (let offset = 0; offset <= 1; offset++) {
        const d = new Date(today.getTime() + offset * 86400000);
        const dateStr = d.toISOString().split('T')[0];
        const dayGames = await fetchDayGames(dateStr);
        if (dayGames.length > 0) {
          upcomingMap.delete(dateStr);
          for (const dg of dayGames) {
            upcomingMap.set(`${dg.date}_${dg.id}`, dg);
          }
        }
      }

      const upcoming = Array.from(upcomingMap.values()).sort((a, b) =>
        a.date.localeCompare(b.date)
      );

      const fetchedIso = new Date().toISOString();
      upcomingCache = {
        data: upcoming,
        fetchedAt: fetchedIso,
        timestamp: Date.now(),
      };

      // Fyll på resterande dagar i bakgrunden så det inte fördröjer första sidvisningen
      populateRemainingDaysInBackground(today);

      return reply.status(200).send({
        data: upcoming,
        status: 'ok',
        fetchedAt: fetchedIso,
        message: 'Kommande huvudomgångar hämtade',
      });
    } catch (err) {
      logger.error('Fel vid hämtning av kommande omgångar', err);
      return reply.status(200).send({
        data: [],
        status: 'failed',
        fetchedAt: new Date().toISOString(),
        message: 'Kunde inte läsa kommande omgångar just nu',
      });
    }
  });

  app.get<{
    Params: { gameId: string };
  }>('/api/omganger/:gameId', async (request, reply) => {
    const { gameId } = request.params;

    if (process.env.USE_FIXTURES === 'true') {
      const fixtureData = buildFixtureRaceDay(gameId);
      return reply.status(200).send({
        data: fixtureData,
        status: 'ok',
        fetchedAt: new Date().toISOString(),
        message: 'Fixturomgång använd',
      });
    }

    try {
      const res = await fetchWithPolicy(`${baseUrl}/games/${gameId}`);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const gJson = (await res.json()) as RawGameResponse;
      const rawType = gameId.split('_')[0] as BongGameType;
      const gameType: BongGameType = rawType || (gJson.races?.length === 8 ? 'V86' : 'V75');

      const races: BongRaceLeg[] = (gJson.races || []).map((r: RawRaceItem, legIdx: number) => {
        const horses: BongHorseInput[] = (r.starts || []).map((s: RawStartItem) => {
          let betDistribution = 0.05;
          if (s.pools) {
            for (const [poolKey, poolVal] of Object.entries(s.pools)) {
              if (
                poolKey !== 'vinnare' &&
                poolKey !== 'plats' &&
                poolVal &&
                typeof poolVal.betDistribution === 'number'
              ) {
                betDistribution = Number((poolVal.betDistribution / 10000).toFixed(4));
                break;
              }
            }
          }

          const rawOdds = s.pools?.vinnare?.odds;
          const winOdds =
            rawOdds !== null && rawOdds !== undefined
              ? rawOdds > 99
                ? Math.round((rawOdds / 100) * 10) / 10
                : rawOdds
              : undefined;

          const lifeStats = s.horse?.statistics?.life;
          const earningsTotal = lifeStats?.earnings
            ? Math.round(lifeStats.earnings / 100)
            : s.horse?.money || 0;

          let recordStr: string | undefined;
          if (s.horse?.record?.time) {
            recordStr = formatAtgKmTime(s.horse.record.time, s.horse.record.startMethod);
          }

          const sulkyRaw = s.horse?.sulky?.type?.text || s.sulky?.type?.text;
          const sulkyType = mapSwedishSulky(sulkyRaw) === 'Amerikansk' ? 'american' : 'regular';

          const trainer = s.horse?.trainer;
          const trainerName = trainer
            ? trainer.name || [trainer.firstName, trainer.lastName].filter(Boolean).join(' ')
            : undefined;

          const driver = s.driver;
          const driverName = driver
            ? driver.name || [driver.firstName, driver.lastName].filter(Boolean).join(' ')
            : undefined;

          return {
            id: String(s.horse?.id || `${r.id}_${s.number}`),
            startNumber: s.number,
            postPosition: s.postPosition || s.number,
            name: s.horse?.name || `Häst ${s.number}`,
            driverName: driverName || 'Kusk',
            trainerName: trainerName || 'Tränare',
            scratched: Boolean(s.scratched),
            betDistribution,
            winOdds,
            shoeFront:
              typeof s.horse?.shoes?.front === 'boolean'
                ? s.horse.shoes.front
                : s.horse?.shoes?.front?.hasShoe,
            shoeBack:
              typeof s.horse?.shoes?.back === 'boolean'
                ? s.horse.shoes.back
                : s.horse?.shoes?.back?.hasShoe,
            shoeChanged: Boolean(
              (typeof s.horse?.shoes?.front === 'object' && s.horse?.shoes?.front?.changed) ||
              (typeof s.horse?.shoes?.back === 'object' && s.horse?.shoes?.back?.changed)
            ),
            sulkyType,
            earningsTotal,
            record: recordStr,
          };
        });

        return {
          legIndex: legIdx,
          raceNumber: r.number,
          trackName: r.track?.name || 'Bana',
          raceName: r.name || `Avdelning ${legIdx + 1}`,
          startTime: r.scheduledStartTime
            ? r.scheduledStartTime.slice(11, 16)
            : r.startTime?.slice(11, 16),
          distance: r.distance || 2140,
          startMethod: r.startMethod === 'volt' || r.startMethod === 'volte' ? 'volt' : 'auto',
          horses,
        };
      });

      const trackNames = Array.from(new Set(races.map((leg) => leg.trackName))).join(' / ');
      const turnoverPool = gJson.pools?.[gameId.split('_')[0]];
      const turnover = turnoverPool?.turnover ? Math.round(turnoverPool.turnover / 100) : 0;
      const jackpotPool = turnoverPool?.jackpotAmount
        ? Math.round(turnoverPool.jackpotAmount / 100)
        : 0;

      const raceDayData: BongRaceDayData = {
        gameType,
        turnover,
        jackpotPool,
        trackName: trackNames || 'Svensk travbana',
        date: gJson.races?.[0]?.date || 'Kommande',
        startTime: races[0]?.startTime || '15:00',
        races,
      };

      return reply.status(200).send({
        data: raceDayData,
        status: 'ok',
        fetchedAt: new Date().toISOString(),
        message: 'Omgång med live-hästar hämtad',
      });
    } catch (err) {
      if (process.env.USE_FIXTURES === 'true') {
        const fixtureData = buildFixtureRaceDay(gameId);
        return reply.status(200).send({
          data: fixtureData,
          status: 'ok',
          fetchedAt: new Date().toISOString(),
          message: 'Fixturomgång använd',
        });
      }
      logger.error(`Fel vid hämtning av omgång ${gameId}`, err);
      return reply.status(200).send({
        data: null,
        status: 'failed',
        fetchedAt: new Date().toISOString(),
        message: 'Kunde inte läsa omgång just nu',
      });
    }
  });
};
