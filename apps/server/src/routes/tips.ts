import { FastifyPluginAsync } from 'fastify';
import { ApiResponse, TipsOverviewData, RaceTipsData } from '@stallbacken/shared';
import { getDb } from '../db/connection.js';
import { getLatestTipArticles, getTipsForRace, getAllRaceTips } from '../db/queries/tips.js';
import { tipsExpressenAdapter } from '../adapters/tips-expressen.js';
import { tipsTravrondenAdapter } from '../adapters/tips-travronden.js';
import { tipsAftonbladetAdapter } from '../adapters/tips-aftonbladet.js';
import { tipsSulkysportAdapter } from '../adapters/tips-sulkysport.js';
import { logger } from '../lib/logger.js';

export const tipsRoutes: FastifyPluginAsync = async (app) => {
  const db = getDb();

  app.get<{
    Querystring: { refresh?: string; simulateDown?: string };
  }>('/api/tips', async (request, reply) => {
    const forceRefresh = request.query.refresh === 'true';
    const simulateDown = request.query.simulateDown;

    try {
      tipsExpressenAdapter.setSimulatedFailure(simulateDown === 'tips-expressen');
      tipsTravrondenAdapter.setSimulatedFailure(simulateDown === 'tips-travronden');
      tipsAftonbladetAdapter.setSimulatedFailure(simulateDown === 'tips-aftonbladet');
      tipsSulkysportAdapter.setSimulatedFailure(simulateDown === 'tips-sulkysport');

      const [resExpressen, resTravronden, resAftonbladet, resSulkysport] = await Promise.all([
        tipsExpressenAdapter.fetch({ forceRefresh }),
        tipsTravrondenAdapter.fetch({ forceRefresh }),
        tipsAftonbladetAdapter.fetch({ forceRefresh }),
        tipsSulkysportAdapter.fetch({ forceRefresh }),
      ]);

      const articles = getLatestTipArticles(db, 25);
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
        {
          id: tipsAftonbladetAdapter.id,
          name: tipsAftonbladetAdapter.label,
          status: resAftonbladet.status,
          message: resAftonbladet.message,
          fetchedAt: resAftonbladet.fetchedAt,
        },
        {
          id: tipsSulkysportAdapter.id,
          name: tipsSulkysportAdapter.label,
          status: resSulkysport.status,
          message: resSulkysport.message,
          fetchedAt: resSulkysport.fetchedAt,
        },
      ];

      const overviewData: TipsOverviewData = {
        articles,
        raceTips,
        providers,
      };

      const statuses = [
        resExpressen.status,
        resTravronden.status,
        resAftonbladet.status,
        resSulkysport.status,
      ];
      const allOk = statuses.every((s) => s === 'ok');
      const allFailed = statuses.every((s) => s === 'failed');
      const overallStatus = allOk ? 'ok' : allFailed ? 'failed' : 'degraded';

      const response: ApiResponse<TipsOverviewData> = {
        data: overviewData,
        status: overallStatus,
        fetchedAt: new Date().toISOString(),
        message: overallStatus === 'ok' ? 'Alla tips är färska.' : 'Delvis uppdaterat.',
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
      tipsAftonbladetAdapter.setSimulatedFailure(false);
      tipsSulkysportAdapter.setSimulatedFailure(false);
    }
  });

  app.get<{
    Params: { raceId: string };
    Querystring: { refresh?: string };
  }>('/api/lopp/:raceId/tips', async (request, reply) => {
    const { raceId } = request.params;
    const forceRefresh = request.query.refresh === 'true';

    try {
      const [resExpressen, resTravronden, resAftonbladet, resSulkysport] = await Promise.all([
        tipsExpressenAdapter.fetch({ forceRefresh }),
        tipsTravrondenAdapter.fetch({ forceRefresh }),
        tipsAftonbladetAdapter.fetch({ forceRefresh }),
        tipsSulkysportAdapter.fetch({ forceRefresh }),
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
        {
          id: tipsAftonbladetAdapter.id,
          name: tipsAftonbladetAdapter.label,
          status: resAftonbladet.status,
          message: resAftonbladet.message,
          fetchedAt: resAftonbladet.fetchedAt,
        },
        {
          id: tipsSulkysportAdapter.id,
          name: tipsSulkysportAdapter.label,
          status: resSulkysport.status,
          message: resSulkysport.message,
          fetchedAt: resSulkysport.fetchedAt,
        },
      ];

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
