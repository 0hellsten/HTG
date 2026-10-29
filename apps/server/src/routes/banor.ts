// API-rutter för banor, banfakta, banstatistik och SMHI-väder
// Stallbacken — HTG

import { FastifyPluginAsync } from 'fastify';
import { ApiResponse, TrackProfile, TrackStats, TrackWeather } from '@stallbacken/shared';
import { getDb } from '../db/connection.js';
import {
  getAllTrackProfiles,
  getTrackProfile,
  calculateTrackStats,
} from '../db/queries/track-stats.js';
import { smhiWeatherAdapter } from '../adapters/smhi-weather.js';
import { logger } from '../lib/logger.js';

export const banorRoutes: FastifyPluginAsync = async (app) => {
  const db = getDb();

  /**
   * Hämtar samtliga banor med grundfakta.
   */
  app.get('/api/banor', async (_request, reply) => {
    try {
      const tracks = getAllTrackProfiles(db);
      const response: ApiResponse<TrackProfile[]> = {
        data: tracks,
        status: 'ok',
        fetchedAt: new Date().toISOString(),
        message: 'Banor hämtade.',
      };
      return reply.status(200).send(response);
    } catch (err) {
      logger.error('Fel vid hämtning av banor', err);
      const response: ApiResponse<TrackProfile[]> = {
        data: [],
        status: 'failed',
        fetchedAt: new Date().toISOString(),
        message: 'Uppdateras inte just nu',
      };
      return reply.status(200).send(response);
    }
  });

  /**
   * Hämtar banprofil för en specifik bana.
   */
  app.get<{
    Params: { trackId: string };
  }>('/api/banor/:trackId', async (request, reply) => {
    const { trackId } = request.params;
    try {
      const track = getTrackProfile(db, trackId);
      if (!track) {
        const response: ApiResponse<null> = {
          data: null,
          status: 'failed',
          fetchedAt: new Date().toISOString(),
          message: 'Banan hittades inte.',
        };
        return reply.status(200).send(response);
      }

      const response: ApiResponse<TrackProfile> = {
        data: track,
        status: 'ok',
        fetchedAt: new Date().toISOString(),
        message: 'Banprofil hämtad.',
      };
      return reply.status(200).send(response);
    } catch (err) {
      logger.error(`Fel vid hämtning av banprofil ${trackId}`, err);
      const response: ApiResponse<null> = {
        data: null,
        status: 'failed',
        fetchedAt: new Date().toISOString(),
        message: 'Uppdateras inte just nu',
      };
      return reply.status(200).send(response);
    }
  });

  /**
   * Hämtar härledd statistik för Banvisaren ur sparad historik:
   * - "Så brukar spåren gå" (vinstprocent per startspår, volt och auto)
   * - "Leder man, vinner man?"
   * - Vanliga vinnartider
   * - Underlag (antal lopp)
   */
  app.get<{
    Params: { trackId: string };
  }>('/api/banor/:trackId/statistik', async (request, reply) => {
    const { trackId } = request.params;
    try {
      const stats = calculateTrackStats(db, trackId);
      const response: ApiResponse<TrackStats> = {
        data: stats,
        status: 'ok',
        fetchedAt: new Date().toISOString(),
        message: stats.isLowSample
          ? 'För få lopp för att säga något säkert.'
          : `Bygger på ${stats.basedOnRaces} lopp.`,
      };
      return reply.status(200).send(response);
    } catch (err) {
      logger.error(`Fel vid beräkning av statistik för bana ${trackId}`, err);
      const response: ApiResponse<null> = {
        data: null,
        status: 'failed',
        fetchedAt: new Date().toISOString(),
        message: 'Uppdateras inte just nu',
      };
      return reply.status(200).send(response);
    }
  });

  /**
   * Hämtar aktuellt väder för en bana via SMHI.
   * Stödjer simulateDown=true för verifiering av degradering i UI.
   */
  app.get<{
    Params: { trackId: string };
    Querystring: { refresh?: string; simulateDown?: string };
  }>('/api/banor/:trackId/vader', async (request, reply) => {
    const { trackId } = request.params;
    const forceRefresh = request.query.refresh === 'true';
    const simulateDown = request.query.simulateDown === 'true';

    try {
      if (simulateDown) {
        smhiWeatherAdapter.setSimulatedFailure(true);
      } else {
        smhiWeatherAdapter.setSimulatedFailure(false);
      }

      const res = await smhiWeatherAdapter.fetchWeatherForTrack(trackId, forceRefresh);
      const response: ApiResponse<TrackWeather | null> = {
        data: res.data,
        status: res.status,
        fetchedAt: res.fetchedAt,
        message: res.message,
      };

      return reply.status(200).send(response);
    } catch (err) {
      logger.error(`Oväntat fel vid hämtning av väder för bana ${trackId}`, err);
      const response: ApiResponse<null> = {
        data: null,
        status: 'failed',
        fetchedAt: new Date().toISOString(),
        message: 'Vädret går inte att hämta just nu.',
      };
      return reply.status(200).send(response);
    } finally {
      if (simulateDown) {
        smhiWeatherAdapter.setSimulatedFailure(false);
      }
    }
  });
};
