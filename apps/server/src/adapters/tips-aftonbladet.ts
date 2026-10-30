// Källans namn: Aftonbladet Trav365
// Domän: https://rss.aftonbladet.se/rss2/small/pages/sections/sportbladet/trav365/
// Status: publik RSS 2.0-feed
// Robots.txt: tillåter RSS-flödet under /rss2/
// Anropsbudget: 2 gånger per dygn (TTL 12 timmar)
// Privat, icke-kommersiell användning. Ingen vidarespridning av data.

import Database from 'better-sqlite3';
import { SourceAdapter, SourceResult, FetchContext, TipItem } from '@stallbacken/shared';
import { FetchOptions } from '../collect/queue.js';
import { HealthManager } from '../health/health-manager.js';
import { getDb } from '../db/connection.js';
import { fetchRssTips, RssAdapterConfig } from './tips-rss.js';

export class TipsAftonbladetAdapter implements SourceAdapter<TipItem[]> {
  readonly id = 'tips-aftonbladet';
  readonly label = 'Tips från Aftonbladet';
  readonly ttlSeconds = 43200;
  readonly staleAfterSeconds = 86400;

  private config: RssAdapterConfig = {
    id: this.id,
    label: this.label,
    feedUrl: 'https://rss.aftonbladet.se/rss2/small/pages/sections/sportbladet/trav365/',
    providerPrefix: 'Tips från Aftonbladet',
    fixtureFilename: 'tips-aftonbladet.xml',
    ttlSeconds: this.ttlSeconds,
    staleAfterSeconds: this.staleAfterSeconds,
  };

  private db: Database.Database;
  private healthManager: HealthManager;
  private fetchOptions: Partial<FetchOptions> = {};
  private simulatedFailure = false;
  private allowFixtureFallback = true;

  constructor(database?: Database.Database) {
    this.db = database || getDb();
    this.healthManager = new HealthManager(this.db);
  }

  setFeedUrl(url: string): void {
    this.config.feedUrl = url;
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

  async fetch(ctx?: FetchContext): Promise<SourceResult<TipItem[]>> {
    return fetchRssTips(
      this.config,
      this.db,
      this.healthManager,
      this.fetchOptions,
      this.simulatedFailure,
      ctx?.forceRefresh,
      this.allowFixtureFallback
    );
  }
}

export const tipsAftonbladetAdapter = new TipsAftonbladetAdapter();
