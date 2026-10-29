// API-rutter för tävlingsdagar, lopp och startlistor
// Privat, icke-kommersiell användning. Ingen vidarespridning av data.

import { FastifyPluginAsync } from 'fastify';
import { ApiResponse, RaceDay, Race, Start } from '@stallbacken/shared';
import { atgRacingInfoAdapter } from '../adapters/atg-racinginfo.js';
import { getDb } from '../db/connection.js';
import { getRacesByRaceDayId } from '../db/queries/races.js';
import { logger } from '../lib/logger.js';

export const loppRoutes: FastifyPluginAsync = async (app) => {
  const db = getDb();

  /**
   * Hämtar dagens tävlingsdagar och banor med tillhörande lopp.
   */
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

  /**
   * Hämtar detaljerad information om ett specifikt lopp samt dess startlista.
   */
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
};
