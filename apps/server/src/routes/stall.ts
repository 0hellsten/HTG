import { FastifyPluginAsync } from 'fastify';
import { ApiResponse, StallTodayResponse, TodaysEntry } from '@stallbacken/shared';
import { getDb } from '../db/connection.js';
import { atgRacingInfoAdapter } from '../adapters/atg-racinginfo.js';
import { logger } from '../lib/logger.js';

interface EntryRow {
  horse_id: string;
  horse_name: string;
  driver_name: string | null;
  trainer_name: string | null;
  track_id: string;
  track_name: string;
  race_id: string;
  race_number: number;
  scheduled_start: string | null;
}

export const stallRoutes: FastifyPluginAsync = async (app) => {
  const db = getDb();

  app.get<{
    Querystring: { refresh?: string; datum?: string };
  }>('/api/stall/anmalda-idag', async (request, reply) => {
    try {
      const forceRefresh = request.query.refresh === 'true';
      const todayDateStr =
        request.query.datum ||
        new Intl.DateTimeFormat('sv-SE', {
          timeZone: 'Europe/Stockholm',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        }).format(new Date());

      const calendarResult = await atgRacingInfoAdapter.fetchCalendar(todayDateStr, forceRefresh);

      const trackRows = db
        .prepare(
          `SELECT DISTINCT rd.track_id 
           FROM race_days rd 
           JOIN races r ON r.race_day_id = rd.id
           WHERE rd.date = ?`
        )
        .all(todayDateStr) as { track_id: string }[];

      const trackIdsWithRaces = trackRows.map((r) => r.track_id);

      const stmt = db.prepare(`
        SELECT 
          s.horse_id,
          h.name AS horse_name,
          pd.name AS driver_name,
          pt.name AS trainer_name,
          t.id AS track_id,
          t.name AS track_name,
          r.id AS race_id,
          r.number AS race_number,
          r.scheduled_start
        FROM starts s
        JOIN races r ON r.id = s.race_id
        JOIN race_days rd ON rd.id = r.race_day_id
        JOIN tracks t ON t.id = rd.track_id
        JOIN horses h ON h.id = s.horse_id
        LEFT JOIN people pd ON pd.id = s.driver_id
        LEFT JOIN people pt ON pt.id = s.trainer_id
        WHERE rd.date = ? AND s.scratched = 0
        ORDER BY r.scheduled_start ASC, r.number ASC
      `);

      const rows = stmt.all(todayDateStr) as EntryRow[];

      const entries: TodaysEntry[] = rows.map((row) => {
        let formattedTime: string | undefined;
        if (row.scheduled_start) {
          try {
            const d = new Date(row.scheduled_start);
            if (!isNaN(d.getTime())) {
              const hh = String(d.getHours()).padStart(2, '0');
              const mm = String(d.getMinutes()).padStart(2, '0');
              formattedTime = `${hh}:${mm}`;
            }
          } catch {}
        }

        return {
          horseId: row.horse_id,
          horseName: row.horse_name,
          driverName: row.driver_name || undefined,
          trainerName: row.trainer_name || undefined,
          trackId: row.track_id,
          trackName: row.track_name,
          raceId: row.race_id,
          raceNumber: row.race_number,
          scheduledStart: row.scheduled_start || undefined,
          formattedTime,
        };
      });

      const response: ApiResponse<StallTodayResponse> = {
        data: {
          entries,
          trackIdsWithRaces,
        },
        status: calendarResult.status,
        fetchedAt: calendarResult.fetchedAt,
        message: 'Dagens anmälningar hämtade',
      };

      return reply.status(200).send(response);
    } catch (err) {
      logger.error('Kunde inte läsa dagens anmälningar för Mitt stall', err);
      const fallback: ApiResponse<StallTodayResponse> = {
        data: {
          entries: [],
          trackIdsWithRaces: [],
        },
        status: 'failed',
        fetchedAt: new Date().toISOString(),
        message: 'Kunde inte läsa dagens anmälningar just nu',
      };
      return reply.status(200).send(fallback);
    }
  });
};
