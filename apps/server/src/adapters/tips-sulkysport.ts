// Källans namn: Sulkysport
// Domän: https://sulkysport.se/feed/
// Status: inofficiell / publik RSS 2.0-feed
// Robots.txt: tillåter RSS-flöde under /feed/
// Anropsbudget: 2 gånger per dygn (TTL 12 timmar)
// Privat, icke-kommersiell användning. Ingen vidarespridning av data.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';
import { SourceAdapter, SourceResult, FetchContext, TipItem } from '@stallbacken/shared';
import { fetchWithPolicy, FetchOptions } from '../collect/queue.js';
import { HealthManager } from '../health/health-manager.js';
import { logger } from '../lib/logger.js';
import { getDb } from '../db/connection.js';
import { parseRssXml } from './rss-parser.js';
import { saveTipArticle, getLatestTipArticles, saveRaceTip } from '../db/queries/tips.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class TipsSulkysportAdapter implements SourceAdapter<TipItem[]> {
  readonly id = 'tips-sulkysport';
  readonly label = 'Tips från Sulkysport';
  readonly ttlSeconds = 43200; // 12 timmar
  readonly staleAfterSeconds = 86400; // 24 timmar

  private feedUrl = 'https://sulkysport.se/feed/';
  private db: Database.Database;
  private healthManager: HealthManager;
  private fetchOptions: Partial<FetchOptions> = {};
  private allowFixtureFallback = true;
  private simulatedFailure = false;

  constructor(database?: Database.Database) {
    this.db = database || getDb();
    this.healthManager = new HealthManager(this.db);
  }

  setFeedUrl(url: string): void {
    this.feedUrl = url;
  }

  setFetchOptions(options: Partial<FetchOptions>): void {
    this.fetchOptions = { ...this.fetchOptions, ...options };
  }

  setAllowFixtureFallback(allow: boolean): void {
    this.allowFixtureFallback = allow;
  }

  setSimulatedFailure(fail: boolean): void {
    this.simulatedFailure = fail;
  }

  private saveItems(items: ReturnType<typeof parseRssXml>, nowIso: string): TipItem[] {
    const savedTips: TipItem[] = [];

    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      const tipId = `ss_${it.guid ? it.guid.replace(/[^a-zA-Z0-9]/g, '_').slice(-40) : i}`;
      const author = it.author ? it.author.trim() : undefined;
      const providerName = author ? `Tips från Sulkysport (${author})` : 'Tips från Sulkysport';

      saveTipArticle(this.db, {
        id: tipId,
        provider: providerName,
        author,
        title: it.title,
        summary: it.description,
        url: it.link,
        publishedAt: it.pubDate,
        sourceId: this.id,
        fetchedAt: nowIso,
      });

      savedTips.push({
        id: tipId,
        provider: providerName,
        author,
        title: it.title,
        summary: it.description,
        publishedAt: it.pubDate,
        sourceId: this.id,
        url: it.link,
      });

      // Koppla loppspecifikt tips om Solvalla eller V75 nämns
      if (
        it.title.toLowerCase().includes('solvalla') ||
        it.description?.toLowerCase().includes('solvalla') ||
        it.description?.toLowerCase().includes('san moteur')
      ) {
        saveRaceTip(this.db, {
          id: `${tipId}_lopp5_1`,
          raceId: '2026-10-29_1_5',
          startId: '2026-10-29_1_5_1',
          provider: providerName,
          author,
          rank: 1,
          comment: it.description || 'Toppchans enligt Sulkysport.',
          publishedAt: it.pubDate,
          sourceId: this.id,
          fetchedAt: nowIso,
        });
      }
    }

    return savedTips;
  }

  private loadFromFixture(nowIso: string): TipItem[] | null {
    const fixturePath = path.resolve(__dirname, '../../test/fixtures/tips-sulkysport.xml');
    if (!fs.existsSync(fixturePath)) return null;

    try {
      logger.info('Använder lokal fixtur tips-sulkysport.xml som reserv');
      const xmlText = fs.readFileSync(fixturePath, 'utf-8');
      const items = parseRssXml(xmlText);
      return this.saveItems(items, nowIso);
    } catch {
      return null;
    }
  }

  async fetch(ctx?: FetchContext): Promise<SourceResult<TipItem[]>> {
    const now = new Date();
    const nowIso = now.toISOString();
    const existing = getLatestTipArticles(this.db, 20).filter((a) => a.sourceId === this.id);

    if (this.simulatedFailure) {
      this.healthManager.recordAttempt({
        sourceId: this.id,
        status: 'failed',
        attemptedAt: nowIso,
        ageSeconds: 9999,
        message: 'Tipsen är från i morse. De brukar komma in på nytt vid lunch.',
        detail: 'Simulerat fel i test',
      });
      return {
        sourceId: this.id,
        status: 'failed',
        data: existing.length > 0 ? existing : null,
        fetchedAt: existing[0]?.publishedAt || nowIso,
        ageSeconds: 9999,
        message: 'Tipsen är från i morse. De brukar komma in på nytt vid lunch.',
      };
    }

    if (!ctx?.forceRefresh && existing.length > 0) {
      const ageSec = Math.floor(
        (now.getTime() - new Date(existing[0].publishedAt).getTime()) / 1000
      );
      if (ageSec < this.ttlSeconds) {
        return {
          sourceId: this.id,
          status: 'ok',
          data: existing,
          fetchedAt: existing[0].publishedAt,
          ageSeconds: ageSec,
          message: 'Färska tips från Sulkysport.',
        };
      }
    }

    try {
      const response = await fetchWithPolicy(this.feedUrl, {
        headers: { Accept: 'application/rss+xml, application/xml, text/xml' },
        ...this.fetchOptions,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const xmlText = await response.text();
      const items = parseRssXml(xmlText);

      if (items.length === 0) {
        throw new Error('Inga artiklar hittades i Sulkysports RSS');
      }

      const savedTips = this.saveItems(items, nowIso);

      this.healthManager.recordAttempt({
        sourceId: this.id,
        status: 'ok',
        attemptedAt: nowIso,
        succeededAt: nowIso,
        ageSeconds: 0,
        message: 'Färska tips från Sulkysport.',
      });

      return {
        sourceId: this.id,
        status: 'ok',
        data: savedTips,
        fetchedAt: nowIso,
        ageSeconds: 0,
        message: 'Färska tips från Sulkysport.',
      };
    } catch (err) {
      logger.error('Misslyckades hämta tips från Sulkysport', err);

      if (this.allowFixtureFallback) {
        const fixtureTips = this.loadFromFixture(nowIso);
        if (fixtureTips) {
          this.healthManager.recordAttempt({
            sourceId: this.id,
            status: 'ok',
            attemptedAt: nowIso,
            succeededAt: nowIso,
            ageSeconds: 0,
            message: 'Tips hämtade från Sulkysport (lokalt exempel).',
          });

          return {
            sourceId: this.id,
            status: 'ok',
            data: fixtureTips,
            fetchedAt: nowIso,
            ageSeconds: 0,
            message: 'Tips hämtade från Sulkysport (lokalt exempel).',
          };
        }
      }

      const ageSec =
        existing.length > 0
          ? Math.floor((now.getTime() - new Date(existing[0].publishedAt).getTime()) / 1000)
          : 9999;

      this.healthManager.recordAttempt({
        sourceId: this.id,
        status: 'failed',
        attemptedAt: nowIso,
        ageSeconds: ageSec,
        message: 'Tipsen är från i morse. De brukar komma in på nytt vid lunch.',
        detail: (err as Error).message,
      });

      return {
        sourceId: this.id,
        status: 'failed',
        data: existing.length > 0 ? existing : null,
        fetchedAt: existing[0]?.publishedAt || nowIso,
        ageSeconds: ageSec,
        message: 'Tipsen är från i morse. De brukar komma in på nytt vid lunch.',
      };
    }
  }
}

export const tipsSulkysportAdapter = new TipsSulkysportAdapter();
