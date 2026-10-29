// Fastify API-rutter för hästar och historik
// Privat, icke-kommersiell användning. Ingen vidarespridning av data.

import { FastifyInstance } from 'fastify';
import { ApiResponse, HorseProfileResponse, HorseDetail } from '@stallbacken/shared';
import { atgRacingInfoAdapter } from '../adapters/atg-racinginfo.js';
import { searchHorses } from '../db/queries/horses.js';
import { getDb } from '../db/connection.js';
import { logger } from '../lib/logger.js';

export const hastarRoutes = async (fastify: FastifyInstance): Promise<void> => {
  // Sök hästar i databasen
  fastify.get<{
    Querystring: { q?: string; limit?: string };
  }>('/api/hastar/sok', async (request, reply) => {
    const q = request.query.q || '';
    const limit = request.query.limit ? parseInt(request.query.limit, 10) : 20;

    try {
      const db = getDb();
      const results = searchHorses(db, q, limit);

      const response: ApiResponse<HorseDetail[]> = {
        data: results,
        status: 'ok',
        fetchedAt: new Date().toISOString(),
        message: results.length > 0 ? `${results.length} hästar hittades` : 'Hittade ingen häst med det namnet. Prova med en del av namnet.',
      };

      return reply.status(200).send(response);
    } catch (err) {
      logger.error('Fel vid sökning av hästar', err);
      const response: ApiResponse<HorseDetail[]> = {
        data: [],
        status: 'ok',
        fetchedAt: new Date().toISOString(),
        message: 'Hittade ingen häst med det namnet. Prova med en del av namnet.',
      };
      return reply.status(200).send(response);
    }
  });

  // Hämta fullständig profil och historik för en häst
  fastify.get<{
    Params: { horseId: string };
    Querystring: { refresh?: string; simulateDown?: string };
  }>('/api/hastar/:horseId', async (request, reply) => {
    const { horseId } = request.params;
    const forceRefresh = request.query.refresh === 'true';
    const simulateDown = request.query.simulateDown === 'true';

    try {
      if (simulateDown) {
        // Simulerat fel för hästkällan / historiken vid test av degradering
        const response: ApiResponse<HorseProfileResponse | null> = {
          data: null,
          status: 'failed',
          fetchedAt: new Date().toISOString(),
          message: 'Den här hästens tidigare lopp går inte att hämta för tillfället. Resten stämmer.',
        };
        return reply.status(200).send(response);
      }

      const result = await atgRacingInfoAdapter.fetchHorseProfile(horseId, forceRefresh);

      const response: ApiResponse<HorseProfileResponse | null> = {
        data: result.data,
        status: result.status,
        fetchedAt: result.fetchedAt,
        message: result.message,
      };

      return reply.status(200).send(response);
    } catch (err) {
      logger.error(`Oväntat fel vid hämtning av häst ${horseId}`, err);
      const response: ApiResponse<HorseProfileResponse | null> = {
        data: null,
        status: 'failed',
        fetchedAt: new Date().toISOString(),
        message: 'Den här hästens tidigare lopp går inte att hämta för tillfället. Resten stämmer.',
      };
      return reply.status(200).send(response);
    }
  });
};
