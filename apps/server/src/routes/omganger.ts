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

export const omgangerRoutes: FastifyPluginAsync = async (app) => {
  const baseUrl = 'https://www.atg.se/services/racinginfo/v1/api';

  app.get('/api/omganger/kommande', async (_request, reply) => {
    try {
      const today = new Date();
      const upcoming: UpcomingGameSummary[] = [];

      for (let offset = 0; offset <= 3; offset++) {
        const d = new Date(today.getTime() + offset * 86400000);
        const dateStr = d.toISOString().split('T')[0];

        try {
          const res = await fetchWithPolicy(`${baseUrl}/calendar/day/${dateStr}`);
          if (!res.ok) continue;
          const calJson = (await res.json()) as {
            tracks?: Array<{ id: number | string; name: string }>;
            games?: Record<string, Array<{ id?: string; scheduledStartTime?: string; tracks?: number[]; jackpotAmount?: number; turnover?: number }>>;
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

                const bongType: BongGameType = gType === 'V86' ? 'V86' : 'V75';

                upcoming.push({
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
          logger.warn(`Kunde inte läsa kalender för ${dateStr}`, dayErr);
        }
      }

      return reply.status(200).send({
        data: upcoming,
        status: 'ok',
        fetchedAt: new Date().toISOString(),
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

    try {
      const res = await fetchWithPolicy(`${baseUrl}/games/${gameId}`);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const gJson = (await res.json()) as any;
      const gameType: BongGameType = gameId.startsWith('V86') ? 'V86' : 'V75';

      const races: BongRaceLeg[] = (gJson.races || []).map((r: any, legIdx: number) => {
        const horses: BongHorseInput[] = (r.starts || []).map((s: any) => {
          let betDistribution = 0.05;
          if (s.pools) {
            for (const [poolKey, poolVal] of Object.entries(s.pools)) {
              if (
                poolKey !== 'vinnare' &&
                poolKey !== 'plats' &&
                poolVal &&
                typeof (poolVal as any).betDistribution === 'number'
              ) {
                betDistribution = Number(((poolVal as any).betDistribution / 10000).toFixed(4));
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
          const earningsTotal = lifeStats?.earnings ? Math.round(lifeStats.earnings / 100) : s.horse?.money || 0;

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
            shoeFront: s.horse?.shoes?.front?.hasShoe,
            shoeBack: s.horse?.shoes?.back?.hasShoe,
            shoeChanged: Boolean(s.horse?.shoes?.front?.changed || s.horse?.shoes?.back?.changed),
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
          startTime: r.scheduledStartTime ? r.scheduledStartTime.slice(11, 16) : r.startTime?.slice(11, 16),
          distance: r.distance || 2140,
          startMethod: r.startMethod === 'volt' || r.startMethod === 'volte' ? 'volt' : 'auto',
          horses,
        };
      });

      const trackNames = Array.from(new Set(races.map((leg) => leg.trackName))).join(' / ');
      const turnoverPool = gJson.pools?.[gameId.split('_')[0]];
      const turnover = turnoverPool?.turnover ? Math.round(turnoverPool.turnover / 100) : 0;
      const jackpotPool = turnoverPool?.jackpotAmount ? Math.round(turnoverPool.jackpotAmount / 100) : 0;

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
