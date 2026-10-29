import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { ApiResponse, SourceHealthRecord, SourceStatus } from '@stallbacken/shared';
import { HealthManager } from '../health/health-manager.js';
import {
  registeredAdapters,
  fakeSource,
  atgRacingInfoAdapter,
  tipsExpressenAdapter,
  tipsTravrondenAdapter,
} from '../adapters/index.js';
import { logger } from '../lib/logger.js';

interface FakeSourceBody {
  status?: SourceStatus;
  message?: string;
  failures?: number;
  reset?: boolean;
}

export const kallorRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  const healthManager = new HealthManager();

  /**
   * GET /api/kallor
   * Listar alla registrerade datakällors aktuella hälsa och färskhet på svenska.
   */
  app.get<{ Reply: ApiResponse<SourceHealthRecord[]> }>('/api/kallor', async (_req, reply) => {
    try {
      const records = healthManager.getAllSourcesHealth(registeredAdapters);

      return reply.status(200).send({
        data: records,
        status: 'ok',
        fetchedAt: new Date().toISOString(),
        message: 'Källstatus hämtad',
      });
    } catch (err) {
      logger.error('Kunde inte läsa källhälsa', err);
      return reply.status(200).send({
        data: [],
        status: 'failed',
        fetchedAt: new Date().toISOString(),
        message: 'Kunde inte läsa källornas hälsa just nu',
      });
    }
  });

  /**
   * POST /api/kallor/uppdatera-allt
   * Forcerar en ny hämtning för alla aktiva datakällor och returnerar uppdaterad status.
   */
  app.post<{ Reply: ApiResponse<SourceHealthRecord[]> }>(
    '/api/kallor/uppdatera-allt',
    async (_req, reply) => {
      try {
        logger.info('Manuell uppdatering av alla datakällor startad');

        await Promise.allSettled([
          atgRacingInfoAdapter.fetchCalendar(undefined, true),
          tipsExpressenAdapter.fetch({ forceRefresh: true }),
          tipsTravrondenAdapter.fetch({ forceRefresh: true }),
        ]);

        const records = healthManager.getAllSourcesHealth(registeredAdapters);

        return reply.status(200).send({
          data: records,
          status: 'ok',
          fetchedAt: new Date().toISOString(),
          message: 'Alla källor uppdaterades',
        });
      } catch (err) {
        logger.error('Kunde inte uppdatera alla källor', err);
        const records = healthManager.getAllSourcesHealth(registeredAdapters);
        return reply.status(200).send({
          data: records,
          status: 'degraded',
          fetchedAt: new Date().toISOString(),
          message: 'Kunde inte uppdatera samtliga källor just nu',
        });
      }
    }
  );

  /**
   * POST /api/test/fake-source
   * Styr tillståndet för den permanenta testkällan (för verifiering och tester).
   */
  app.post<{ Body: FakeSourceBody }>('/api/test/fake-source', async (req, reply) => {
    const { status, message, failures, reset } = req.body || {};

    if (reset) {
      fakeSource.reset();
      healthManager.resetCircuitBreaker('fake-source');
      return reply.status(200).send({ ok: true, message: 'fake-source återställd' });
    }

    if (failures !== undefined) {
      for (let i = 0; i < failures; i++) {
        healthManager.recordAttempt({
          sourceId: 'fake-source',
          status: 'failed',
          message: message || 'Simulerat fel',
          detail: 'Skapat via test-endpoint',
        });
      }
    } else if (status) {
      fakeSource.setStatus(status);
      if (message) {
        fakeSource.setMessage(message);
      }
      healthManager.recordAttempt({
        sourceId: 'fake-source',
        status,
        message,
        detail: `Status ändrad manuellt till ${status}`,
      });
    }

    const currentHealth = healthManager.getSourceHealth(fakeSource);
    return reply.status(200).send({ ok: true, health: currentHealth });
  });
};
