import { FastifyPluginAsync } from 'fastify';
import { ApiResponse, RaceDay, Race, Start, RaceOddsData } from '@stallbacken/shared';
import { atgRacingInfoAdapter } from '../adapters/atg-racinginfo.js';
import { atgOddsAdapter } from '../adapters/atg-odds.js';
import { getDb } from '../db/connection.js';
import { getRacesByRaceDayId } from '../db/queries/races.js';
import { logger } from '../lib/logger.js';

export const loppRoutes: FastifyPluginAsync = async (app) => {
  const db = getDb();

  app.get<{
    Querystring: { refresh?: string; datum?: string };
  }>('/api/dagar', async (request, reply) => {
    try {
      const forceRefresh = request.query.refresh === 'true';
      const requestedDate = request.query.datum;
      const result = await atgRacingInfoAdapter.fetchCalendar(requestedDate, forceRefresh);

      const daysWithRaces: RaceDay[] = (result.data?.raceDays || []).map((day) => {
        const races = getRacesByRaceDayId(db, day.id);
        return {
          ...day,
          races,
          racesCount: races.length > 0 ? races.length : day.racesCount,
        };
      });

      const response: ApiResponse<RaceDay[]> = {
        data: daysWithRaces,
        status: result.status,
        fetchedAt: result.fetchedAt,
        message: result.message,
      };

      return reply.status(200).send(response);
    } catch (err) {
      logger.error('Oväntat fel vid hämtning av omgångar för datum', err);
      const response: ApiResponse<RaceDay[]> = {
        data: [],
        status: 'failed',
        fetchedAt: new Date().toISOString(),
        message: 'Uppdateras inte just nu',
      };
      return reply.status(200).send(response);
    }
  });

  app.get<{
    Querystring: { refresh?: string };
  }>('/api/dagar/idag', async (request, reply) => {
    try {
      const forceRefresh = request.query.refresh === 'true';
      const result = await atgRacingInfoAdapter.fetchCalendar(undefined, forceRefresh);

      const daysWithRaces: RaceDay[] = (result.data?.raceDays || []).map((day) => {
        const races = getRacesByRaceDayId(db, day.id);
        return {
          ...day,
          races,
          racesCount: races.length > 0 ? races.length : day.racesCount,
        };
      });

      const response: ApiResponse<RaceDay[]> = {
        data: daysWithRaces,
        status: result.status,
        fetchedAt: result.fetchedAt,
        message: result.message,
      };

      return reply.status(200).send(response);
    } catch (err) {
      logger.error('Oväntat fel vid hämtning av dagens omgångar', err);
      const response: ApiResponse<RaceDay[]> = {
        data: [],
        status: 'failed',
        fetchedAt: new Date().toISOString(),
        message: 'Uppdateras inte just nu',
      };
      return reply.status(200).send(response);
    }
  });

  app.get<{
    Querystring: { refresh?: string };
  }>('/api/dagar/kommande', async (request, reply) => {
    try {
      const forceRefresh = request.query.refresh === 'true';
      const today = new Date();
      const allDays: RaceDay[] = [];

      for (let offset = 0; offset <= 3; offset++) {
        const d = new Date(today.getTime() + offset * 86400000);
        const dateStr = d.toISOString().split('T')[0];
        const res = await atgRacingInfoAdapter.fetchCalendar(dateStr, forceRefresh);
        if (res.data?.raceDays) {
          for (const day of res.data.raceDays) {
            const races = getRacesByRaceDayId(db, day.id);
            allDays.push({
              ...day,
              races,
              racesCount: races.length > 0 ? races.length : day.racesCount,
            });
          }
        }
      }

      return reply.status(200).send({
        data: allDays,
        status: 'ok',
        fetchedAt: new Date().toISOString(),
        message: 'Kommande tävlingsdagar hämtade',
      });
    } catch (err) {
      logger.error('Oväntat fel vid hämtning av kommande dagar', err);
      return reply.status(200).send({
        data: [],
        status: 'failed',
        fetchedAt: new Date().toISOString(),
        message: 'Uppdateras inte just nu',
      });
    }
  });

  app.get<{
    Params: { raceId: string };
    Querystring: { refresh?: string };
  }>('/api/lopp/:raceId', async (request, reply) => {
    const { raceId } = request.params;
    const forceRefresh = request.query.refresh === 'true';

    try {
      const result = await atgRacingInfoAdapter.fetchRace(raceId, forceRefresh);

      const response: ApiResponse<{ race: Race; starts: Start[] }> = {
        data: result.data,
        status: result.status,
        fetchedAt: result.fetchedAt,
        message: result.message,
      };

      return reply.status(200).send(response);
    } catch (err) {
      logger.error(`Oväntat fel vid hämtning av lopp ${raceId}`, err);
      const response: ApiResponse<{ race: Race; starts: Start[] }> = {
        data: null,
        status: 'failed',
        fetchedAt: new Date().toISOString(),
        message: 'Uppdateras inte just nu',
      };
      return reply.status(200).send(response);
    }
  });

  app.get<{
    Params: { raceId: string };
    Querystring: { refresh?: string; simulateDown?: string };
  }>('/api/lopp/:raceId/odds', async (request, reply) => {
    const { raceId } = request.params;
    const forceRefresh = request.query.refresh === 'true';
    const simulateDown = request.query.simulateDown === 'true';

    try {
      if (simulateDown) {
        atgOddsAdapter.setSimulatedFailure(true);
      } else if (atgOddsAdapter.isSimulatedFailure()) {
        atgOddsAdapter.setSimulatedFailure(false);
      }

      const result = await atgOddsAdapter.fetchOddsForRace(raceId, forceRefresh);

      const response: ApiResponse<RaceOddsData | null> = {
        data: result.data,
        status: result.status,
        fetchedAt: result.fetchedAt,
        message: result.message,
      };

      return reply.status(200).send(response);
    } catch (err) {
      logger.error(`Oväntat fel vid hämtning av odds för lopp ${raceId}`, err);
      const response: ApiResponse<RaceOddsData | null> = {
        data: null,
        status: 'failed',
        fetchedAt: new Date().toISOString(),
        message: 'Oddsen uppdateras inte just nu. Allt annat på sidan är färskt.',
      };
      return reply.status(200).send(response);
    }
  });
};
