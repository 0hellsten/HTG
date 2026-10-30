import { FastifyPluginAsync } from 'fastify';
import { BongGameType, BongRaceDayData, BongRaceLeg, BongHorseInput } from '@stallbacken/shared';
import { fetchWithPolicy } from '../collect/queue.js';
import { logger } from '../lib/logger.js';
import { mapSwedishSulky } from '../adapters/atg-storage.js';
import { formatAtgKmTime } from '../adapters/atg-horse-storage.js';

export const janneBoyRoutes: FastifyPluginAsync = async (app) => {
  const baseUrl = 'https://www.atg.se/services/racinginfo/v1/api';

  app.get<{
    Querystring: { gameType?: string; gameId?: string };
  }>('/api/janne-boy/omgang', async (request, reply) => {
    let gameType: BongGameType = request.query.gameType === 'V86' ? 'V86' : 'V75';
    let targetGameId = request.query.gameId;

    try {
      if (!targetGameId) {
        const today = new Date();
        for (let offset = 0; offset <= 7; offset++) {
          const d = new Date(today.getTime() + offset * 86400000);
          const dateStr = d.toISOString().split('T')[0];
          const calRes = await fetchWithPolicy(`${baseUrl}/calendar/day/${dateStr}`);
          if (!calRes.ok) continue;
          const calJson = (await calRes.json()) as any;
          const targetKey = gameType === 'V86' ? 'V86' : 'V75';
          const found =
            calJson.games?.[targetKey]?.[0] ||
            (gameType === 'V75'
              ? calJson.games?.['V85']?.[0] || calJson.games?.['GS75']?.[0] || calJson.games?.['V64']?.[0]
              : undefined);
          if (found?.id) {
            targetGameId = found.id;
            break;
          }
        }
      }

      if (targetGameId) {
        const gameRes = await fetchWithPolicy(`${baseUrl}/games/${targetGameId}`);
        if (gameRes.ok) {
          const gJson = (await gameRes.json()) as any;
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
              const sulkyType = mapSwedishSulky(sulkyRaw) === 'Amerikansk sulky' ? 'american' : 'regular';

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

          const requiredLegs = gameType === 'V86' ? 8 : 7;
          if (races.length >= requiredLegs) {
            const trackNames = Array.from(new Set(races.map((leg) => leg.trackName))).join(' / ');
            const turnoverPool = gJson.pools?.[targetGameId.split('_')[0]];
            const turnover = turnoverPool?.turnover ? Math.round(turnoverPool.turnover / 100) : 0;
            const jackpotPool = turnoverPool?.jackpotAmount ? Math.round(turnoverPool.jackpotAmount / 100) : 0;

            const liveRaceDay: BongRaceDayData = {
              gameType,
              turnover,
              jackpotPool,
              trackName: trackNames || 'Svensk travbana',
              date: gJson.races?.[0]?.date || 'Kommande',
              startTime: races[0]?.startTime || '15:00',
              races: races.slice(0, requiredLegs),
            };

            return reply.status(200).send({
              data: liveRaceDay,
              isLive: true,
              status: 'ok',
              fetchedAt: new Date().toISOString(),
              message: 'Färska live-odds och startlistor från ATG',
            });
          }
        }
      }

      return reply.status(200).send({
        data: null,
        isLive: false,
        status: 'failed',
        fetchedAt: new Date().toISOString(),
        message: 'Kunde inte hitta aktiv omgång just nu',
      });
    } catch (err) {
      logger.error('Fel vid hämtning av Janne Boy omgång', err);
      return reply.status(200).send({
        data: null,
        isLive: false,
        status: 'failed',
        fetchedAt: new Date().toISOString(),
        message: 'Kunde inte läsa live-data för Janne Boy just nu',
      });
    }
  });
};
