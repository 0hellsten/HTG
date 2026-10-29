// API-rutter för tips och "Vad tycker stallbacken?"
// Stallbacken — HTG

import { FastifyPluginAsync } from 'fastify';
import {
  ApiResponse,
  TipsOverviewData,
  RaceTipsData,
} from '@stallbacken/shared';
import { getDb } from '../db/connection.js';
import {
  getLatestTipArticles,
  getTipsForRace,
  getAllRaceTips,
} from '../db/queries/tips.js';
import { tipsExpressenAdapter } from '../adapters/tips-expressen.js';
import { tipsTravrondenAdapter } from '../adapters/tips-travronden.js';
import { logger } from '../lib/logger.js';

export const tipsRoutes: FastifyPluginAsync = async (app) => {
  const db = getDb();

  /**
   * Hämtar samlad tipssida ("Vad tycker stallbacken?") med artiklar och lopprankingar.
   * Stödjer simulateDown=tips-expressen eller simulateDown=tips-travronden för att testa degradering.
   */
  app.get<{
    Querystring: { refresh?: string; simulateDown?: string };
  }>('/api/tips', async (request, reply) => {
    const forceRefresh = request.query.refresh === 'true';
    const simulateDown = request.query.simulateDown;

    try {
      if (simulateDown === 'tips-expressen') {
        tipsExpressenAdapter.setSimulatedFailure(true);
      } else {
        tipsExpressenAdapter.setSimulatedFailure(false);
      }

      if (simulateDown === 'tips-travronden') {
        tipsTravrondenAdapter.setSimulatedFailure(true);
      } else {
        tipsTravrondenAdapter.setSimulatedFailure(false);
      }

      // Hämta färsk data från källorna
      const [resExpressen, resTravronden] = await Promise.all([
        tipsExpressenAdapter.fetch({ forceRefresh }),
        tipsTravrondenAdapter.fetch({ forceRefresh }),
      ]);

      const articles = getLatestTipArticles(db, 20);
      const raceTips = getAllRaceTips(db);

      const providers = [
        {
          id: tipsExpressenAdapter.id,
          name: tipsExpressenAdapter.label,
          status: resExpressen.status,
          message: resExpressen.message,
          fetchedAt: resExpressen.fetchedAt,
        },
        {
          id: tipsTravrondenAdapter.id,
          name: tipsTravrondenAdapter.label,
          status: resTravronden.status,
          message: resTravronden.message,
          fetchedAt: resTravronden.fetchedAt,
        },
      ];

      const overviewData: TipsOverviewData = {
        articles,
        raceTips,
        providers,
      };

      const overallStatus =
        resExpressen.status === 'ok' && resTravronden.status === 'ok'
          ? 'ok'
          : resExpressen.status === 'failed' && resTravronden.status === 'failed'
            ? 'failed'
            : 'degraded';

      const response: ApiResponse<TipsOverviewData> = {
        data: overviewData,
        status: overallStatus,
        fetchedAt: new Date().toISOString(),
        message:
          overallStatus === 'ok'
            ? 'Alla tips är färska.'
            : 'Delvis uppdaterat.',
      };

      return reply.status(200).send(response);
    } catch (err) {
      logger.error('Fel vid hämtning av tipsöversikt', err);
      const response: ApiResponse<TipsOverviewData> = {
        data: {
          articles: [],
          raceTips: [],
          providers: [],
        },
        status: 'failed',
        fetchedAt: new Date().toISOString(),
        message: 'Tipsen är från i morse. De brukar komma in på nytt vid lunch.',
      };
      return reply.status(200).send(response);
    } finally {
      tipsExpressenAdapter.setSimulatedFailure(false);
      tipsTravrondenAdapter.setSimulatedFailure(false);
    }
  });

  /**
   * Hämtar tips för ett specifikt lopp (till block 3 på loppkortet).
   */
  app.get<{
    Params: { raceId: string };
    Querystring: { refresh?: string };
  }>('/api/lopp/:raceId/tips', async (request, reply) => {
    const { raceId } = request.params;
    const forceRefresh = request.query.refresh === 'true';

    try {
      // Säkerställ att tipsen är hämtade
      const [resExpressen, resTravronden] = await Promise.all([
        tipsExpressenAdapter.fetch({ forceRefresh }),
        tipsTravrondenAdapter.fetch({ forceRefresh }),
      ]);

      const tips = getTipsForRace(db, raceId);

      const providers = [
        {
          id: tipsExpressenAdapter.id,
          name: tipsExpressenAdapter.label,
          status: resExpressen.status,
          message: resExpressen.message,
          fetchedAt: resExpressen.fetchedAt,
        },
        {
          id: tipsTravrondenAdapter.id,
          name: tipsTravrondenAdapter.label,
          status: resTravronden.status,
          message: resTravronden.message,
          fetchedAt: resTravronden.fetchedAt,
        },
      ];

      // Skapa egen hopslagning om flera källor har tipsat
      let aggregatedSummary: string | undefined;
      if (tips.length >= 2) {
        aggregatedSummary = 'Appens egen hopslagning av tipsen ovan.';
      }

      const raceTipsData: RaceTipsData = {
        raceId,
        tips,
        providers,
        aggregatedSummary,
      };

      const response: ApiResponse<RaceTipsData> = {
        data: raceTipsData,
        status: tips.length > 0 ? 'ok' : 'ok',
        fetchedAt: new Date().toISOString(),
        message:
          tips.length > 0
            ? 'Tips för loppet hämtade.'
            : 'Inga tips har kommit in för det här loppet än.',
      };

      return reply.status(200).send(response);
    } catch (err) {
      logger.error(`Fel vid hämtning av tips för lopp ${raceId}`, err);
      const response: ApiResponse<RaceTipsData> = {
        data: {
          raceId,
          tips: [],
          providers: [],
        },
        status: 'failed',
        fetchedAt: new Date().toISOString(),
        message: 'Tipsen är från i morse. De brukar komma in på nytt vid lunch.',
      };
      return reply.status(200).send(response);
    }
  });
};
