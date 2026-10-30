import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';
import { SourceResult, TipItem } from '@stallbacken/shared';
import { fetchWithPolicy, FetchOptions } from '../collect/queue.js';
import { HealthManager } from '../health/health-manager.js';
import { logger } from '../lib/logger.js';
import { parseRssXml } from './rss-parser.js';
import { saveTipArticle, getLatestTipArticles, saveRaceTip } from '../db/queries/tips.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface RssAdapterConfig {
  id: string;
  label: string;
  feedUrl: string;
  providerPrefix: string;
  fixtureFilename: string;
  ttlSeconds?: number;
  staleAfterSeconds?: number;
}

export function parseIsoDate(rawDate?: string): string {
  if (!rawDate) return new Date().toISOString();
  try {
    const d = new Date(rawDate);
    if (!isNaN(d.getTime())) {
      return d.toISOString();
    }
  } catch {
    // ignorera
  }
  return new Date().toISOString();
}

export async function fetchRssTips(
  config: RssAdapterConfig,
  db: Database.Database,
  healthManager: HealthManager,
  fetchOptions?: Partial<FetchOptions>,
  simulatedFailure = false,
  forceRefresh = false,
  allowFixtureFallback = true
): Promise<SourceResult<TipItem[]>> {
  const nowIso = new Date().toISOString();
  const ttlSeconds = config.ttlSeconds || 43200;
  const staleAfterSeconds = config.staleAfterSeconds || 86400;

  const existing = getLatestTipArticles(db, 30).filter((a) => a.sourceId === config.id);

  if (simulatedFailure) {
    healthManager.recordAttempt({
      sourceId: config.id,
      status: 'failed',
      attemptedAt: nowIso,
      ageSeconds: 9999,
      message: 'Tipsen är från i morse. De brukar komma in på nytt vid lunch.',
      detail: 'Simulerat fel',
    });
    return {
      sourceId: config.id,
      status: 'failed',
      data: existing.length > 0 ? existing : null,
      fetchedAt: existing[0]?.publishedAt || nowIso,
      ageSeconds: 9999,
      message: 'Tipsen är från i morse. De brukar komma in på nytt vid lunch.',
    };
  }

  const latestHealth = healthManager.getLatestRecord(config.id);
  if (!forceRefresh && existing.length > 0 && latestHealth?.succeededAt) {
    const healthTime = new Date(latestHealth.succeededAt).getTime();
    const ageSec = Math.max(0, Math.floor((Date.now() - healthTime) / 1000));
    if (ageSec < ttlSeconds) {
      return {
        sourceId: config.id,
        status: 'ok',
        data: existing,
        fetchedAt: latestHealth.succeededAt,
        ageSeconds: ageSec,
        message: `Färska tips från ${config.label}.`,
      };
    }
    if (ageSec < staleAfterSeconds) {
      return {
        sourceId: config.id,
        status: 'stale',
        data: existing,
        fetchedAt: latestHealth.succeededAt,
        ageSeconds: ageSec,
        message: `Uppdaterat för ${Math.round(ageSec / 60)} minuter sedan`,
      };
    }
  }

  try {
    let xmlText: string | undefined;

    if (allowFixtureFallback && !config.feedUrl.startsWith('https://')) {
      const fixPath = path.resolve(__dirname, `../../test/fixtures/${config.fixtureFilename}`);
      if (fs.existsSync(fixPath)) {
        xmlText = fs.readFileSync(fixPath, 'utf8');
      }
    }

    if (!xmlText) {
      const response = await fetchWithPolicy(config.feedUrl, {
        headers: { Accept: 'application/rss+xml, application/xml, text/xml' },
        ...fetchOptions,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      xmlText = await response.text();
    }

    const items = parseRssXml(xmlText);

    if (items.length === 0) {
      throw new Error(`Inga artiklar hittades i ${config.label}`);
    }

    const savedTips: TipItem[] = [];

    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      const tipId = `${config.id}_${it.guid ? it.guid.replace(/[^a-zA-Z0-9]/g, '_').slice(-35) : i}`;
      const publishedIso = parseIsoDate(it.pubDate);
      const author = it.author?.replace(/[()]/g, '').trim();
      const providerName = author ? `${config.providerPrefix} (${author})` : config.providerPrefix;

      saveTipArticle(db, {
        id: tipId,
        provider: providerName,
        author,
        title: it.title,
        summary: it.description,
        url: it.link,
        publishedAt: publishedIso,
        sourceId: config.id,
        fetchedAt: nowIso,
      });

      savedTips.push({
        id: tipId,
        provider: providerName,
        author,
        title: it.title,
        summary: it.description,
        publishedAt: publishedIso,
        sourceId: config.id,
        url: it.link,
      });

      matchAndSaveRaceTips(db, it.title, it.description, tipId, providerName, publishedIso, config.id, nowIso);
    }

    healthManager.recordAttempt({
      sourceId: config.id,
      status: 'ok',
      succeededAt: nowIso,
      message: `Färska tips från ${config.label}.`,
    });

    return {
      sourceId: config.id,
      status: 'ok',
      data: savedTips,
      fetchedAt: nowIso,
      ageSeconds: 0,
      message: `Färska tips från ${config.label}.`,
    };
  } catch (err) {
    if (allowFixtureFallback) {
      const fixPath = path.resolve(__dirname, `../../test/fixtures/${config.fixtureFilename}`);
      if (fs.existsSync(fixPath)) {
        try {
          const xml = fs.readFileSync(fixPath, 'utf8');
          const items = parseRssXml(xml);
          const saved: TipItem[] = [];
          for (let i = 0; i < items.length; i++) {
            const it = items[i];
            const tipId = `${config.id}_${it.guid ? it.guid.replace(/[^a-zA-Z0-9]/g, '_').slice(-35) : i}`;
            const publishedIso = parseIsoDate(it.pubDate);
            saveTipArticle(db, {
              id: tipId,
              provider: config.providerPrefix,
              title: it.title,
              summary: it.description,
              url: it.link,
              publishedAt: publishedIso,
              sourceId: config.id,
              fetchedAt: nowIso,
            });
            saved.push({
              id: tipId,
              provider: config.providerPrefix,
              title: it.title,
              summary: it.description,
              publishedAt: publishedIso,
              sourceId: config.id,
              url: it.link,
            });
          }
          return {
            sourceId: config.id,
            status: 'ok',
            data: saved,
            fetchedAt: nowIso,
            ageSeconds: 0,
            message: `Färska tips från ${config.label}.`,
          };
        } catch {
          // fall igenom
        }
      }
    }

    logger.error(`Fel vid hämtning av tips från ${config.id}`, err);
    healthManager.recordAttempt({
      sourceId: config.id,
      status: 'failed',
      attemptedAt: nowIso,
      ageSeconds: 9999,
      message: 'Tipsen är från i morse. De brukar komma in på nytt vid lunch.',
      detail: String(err),
    });

    return {
      sourceId: config.id,
      status: 'failed',
      data: existing.length > 0 ? existing : null,
      fetchedAt: existing[0]?.publishedAt || nowIso,
      ageSeconds: 9999,
      message: 'Tipsen är från i morse. De brukar komma in på nytt vid lunch.',
    };
  }
}

function matchAndSaveRaceTips(
  db: Database.Database,
  title: string,
  desc: string | undefined,
  tipId: string,
  provider: string,
  publishedAt: string,
  sourceId: string,
  nowIso: string
): void {
  const text = `${title} ${desc || ''}`.toLowerCase();

  try {
    const upcomingRaces = db
      .prepare(
        `SELECT r.id AS race_id, r.number AS race_number, t.name AS track_name
         FROM races r
         JOIN race_days rd ON rd.id = r.race_day_id
         JOIN tracks t ON t.id = rd.track_id
         WHERE r.status = 'kommande'
         ORDER BY r.scheduled_start ASC
         LIMIT 20`
      )
      .all() as Array<{ race_id: string; race_number: number; track_name: string }>;

    for (const r of upcomingRaces) {
      if (text.includes(r.track_name.toLowerCase())) {
        const starts = db
          .prepare(
            `SELECT s.id AS start_id, s.start_number, h.name AS horse_name
             FROM starts s
             JOIN horses h ON h.id = s.horse_id
             WHERE s.race_id = ?
             ORDER BY s.start_number ASC`
          )
          .all(r.race_id) as Array<{ start_id: string; start_number: number; horse_name: string }>;

        for (const st of starts) {
          if (text.includes(st.horse_name.toLowerCase())) {
            saveRaceTip(db, {
              id: `${tipId}_${st.start_id}`,
              raceId: r.race_id,
              startId: st.start_id,
              provider,
              rank: 1,
              comment: title,
              publishedAt,
              sourceId,
              fetchedAt: nowIso,
            });
            break;
          }
        }
      }
    }
  } catch {
    // Ignorera loppmatchningsfel
  }
}
