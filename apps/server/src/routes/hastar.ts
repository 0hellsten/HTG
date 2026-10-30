import { FastifyInstance } from 'fastify';
import {
  ApiResponse,
  HorseProfileResponse,
  HorseDetail,
  HorseBatchResponse,
  SourceStatus,
  HorseRankingCategory,
  HorseRankingsResponse,
} from '@stallbacken/shared';
import { atgRacingInfoAdapter } from '../adapters/atg-racinginfo.js';
import { searchHorses, getHorseRankings } from '../db/queries/horses.js';
import { getDb } from '../db/connection.js';
import { logger } from '../lib/logger.js';

export const hastarRoutes = async (fastify: FastifyInstance): Promise<void> => {
  fastify.get<{
    Querystring: { kategori?: string; limit?: string };
  }>('/api/hastar/ranking', async (request, reply) => {
    const rawCat = request.query.kategori || 'elit';
    const category: HorseRankingCategory =
      rawCat === 'elit' ||
      rawCat === 'segerprocent' ||
      rawCat === 'segrar' ||
      rawCat === 'kallblod' ||
      rawCat === 'idag'
        ? rawCat
        : 'vinstrikast';
    const limit = request.query.limit ? parseInt(request.query.limit, 10) : 50;

    try {
      const db = getDb();
      const items = getHorseRankings(db, category, limit);

      const response: ApiResponse<HorseRankingsResponse> = {
        data: {
          category,
          items,
          updatedAt: new Date().toISOString(),
        },
        status: 'ok',
        fetchedAt: new Date().toISOString(),
        message: `${items.length} hästar rankade`,
      };

      return reply.status(200).send(response);
    } catch (err) {
      logger.error('Fel vid hämtning av hästranking', err);
      const response: ApiResponse<HorseRankingsResponse> = {
        data: {
          category,
          items: [],
          updatedAt: new Date().toISOString(),
        },
        status: 'degraded',
        fetchedAt: new Date().toISOString(),
        message: 'Kunde inte sammanställa rankingen just nu.',
      };
      return reply.status(200).send(response);
    }
  });

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
        message:
          results.length > 0
            ? `${results.length} hästar hittades`
            : 'Hittade ingen häst med det namnet. Prova med en del av namnet.',
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

  fastify.get<{
    Params: { horseId: string };
    Querystring: { refresh?: string; simulateDown?: string };
  }>('/api/hastar/:horseId', async (request, reply) => {
    const { horseId } = request.params;
    const forceRefresh = request.query.refresh === 'true';
    const simulateDown = request.query.simulateDown === 'true';

    try {
      if (simulateDown) {
        const response: ApiResponse<HorseProfileResponse | null> = {
          data: null,
          status: 'failed',
          fetchedAt: new Date().toISOString(),
          message:
            'Den här hästens tidigare lopp går inte att hämta för tillfället. Resten stämmer.',
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

  fastify.post<{
    Body: { horseIds?: string[]; simulateDown?: boolean };
    Querystring: { refresh?: string; simulateDown?: string };
  }>('/api/hastar/jamfor', async (request, reply) => {
    const rawIds = request.body?.horseIds || [];
    const horseIds = Array.isArray(rawIds) ? rawIds.slice(0, 6) : [];
    const forceRefresh = request.query.refresh === 'true';
    const simulateDown =
      request.query.simulateDown === 'true' || Boolean(request.body?.simulateDown);

    try {
      if (simulateDown) {
        const failedMap: HorseBatchResponse = {};
        for (const id of horseIds) {
          failedMap[id] = null;
        }
        const response: ApiResponse<HorseBatchResponse> = {
          data: failedMap,
          status: 'failed',
          fetchedAt: new Date().toISOString(),
          message: 'Tidigare lopp och historik går inte att hämta för tillfället. Resten stämmer.',
        };
        return reply.status(200).send(response);
      }

      const horsesMap: HorseBatchResponse = {};
      let failureCount = 0;
      let degradedCount = 0;

      for (const id of horseIds) {
        try {
          const result = await atgRacingInfoAdapter.fetchHorseProfile(id, forceRefresh);
          horsesMap[id] = result.data;
          if (result.status === 'failed') {
            failureCount++;
          } else if (result.status === 'degraded') {
            degradedCount++;
          }
        } catch (singleErr) {
          logger.warn(`Kunde inte hämta profil för häst ${id}`, { error: String(singleErr) });
          horsesMap[id] = null;
          failureCount++;
        }
      }

      let overallStatus: SourceStatus = 'ok';
      let message = 'Allt är färskt och uppdaterat.';

      if (horseIds.length > 0 && failureCount === horseIds.length) {
        overallStatus = 'failed';
        message = 'Tidigare lopp och historik går inte att hämta för tillfället. Resten stämmer.';
      } else if (failureCount > 0 || degradedCount > 0) {
        overallStatus = 'degraded';
        message = 'Viss hästhistorik saknas eller är delvis uppdaterad.';
      }

      const response: ApiResponse<HorseBatchResponse> = {
        data: horsesMap,
        status: overallStatus,
        fetchedAt: new Date().toISOString(),
        message,
      };

      return reply.status(200).send(response);
    } catch (err) {
      logger.error('Oväntat fel vid batch-hämtning av hästar för jämförelse', err);
      const response: ApiResponse<HorseBatchResponse> = {
        data: {},
        status: 'failed',
        fetchedAt: new Date().toISOString(),
        message: 'Tidigare lopp och historik går inte att hämta för tillfället. Resten stämmer.',
      };
      return reply.status(200).send(response);
    }
  });
};
