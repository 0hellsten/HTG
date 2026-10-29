import { describe, it, expect, beforeEach } from 'vitest';
import Database from 'better-sqlite3';
import { runMigrations } from '../src/db/migrations.js';
import { TipsExpressenAdapter } from '../src/adapters/tips-expressen.js';
import { TipsTravrondenAdapter } from '../src/adapters/tips-travronden.js';
import { parseRssXml } from '../src/adapters/rss-parser.js';

describe('Tip-adaptrar (Fas 8)', () => {
  let db: Database.Database;

  beforeEach(() => {
    db = new Database(':memory:');
    runMigrations(db);
  });

  it('parsar standard RSS 2.0-artiklar och städar CDATA och HTML', () => {
    const sampleXml = `
      <rss version="2.0">
        <channel>
          <item>
            <title><![CDATA[V75 Tips: Bästa spikarna]]></title>
            <link>https://example.com/tips-1</link>
            <description><![CDATA[<p>Mycket fin chans för stjärnhästen.</p>]]></description>
            <author>trav@expressen.se (Eskil Hellberg)</author>
            <pubDate>Thu, 29 Oct 2026 12:00:00 GMT</pubDate>
          </item>
        </channel>
      </rss>
    `;

    const items = parseRssXml(sampleXml);
    expect(items.length).toBe(1);
    expect(items[0].title).toBe('V75 Tips: Bästa spikarna');
    expect(items[0].description).toBe('Mycket fin chans för stjärnhästen.');
    expect(items[0].author).toContain('Eskil Hellberg');
  });

  it('TipsExpressenAdapter sparar artiklar med avsändare "Tips från X"', async () => {
    const adapter = new TipsExpressenAdapter(db);
    adapter.setFeedUrl('http://127.0.0.1:59999/ogiltig'); // tvinga fixtur
    adapter.setFetchOptions({ maxRetries: 0, backoffDelays: [] });
    adapter.setAllowFixtureFallback(true);

    const result = await adapter.fetch();
    expect(result.status).toBe('ok');
    expect(result.data).toBeDefined();
    expect(result.data?.length).toBeGreaterThan(0);
    expect(result.data?.[0].provider).toContain('Tips från Expressen');

    // Kontrollera databasen
    const articles = db.prepare('SELECT * FROM tip_articles WHERE source_id = ?').all('tips-expressen');
    expect(articles.length).toBeGreaterThan(0);
  });

  it('TipsTravrondenAdapter fungerar oberoende av Expressen och sparar stallbacksrapporter', async () => {
    const adapter = new TipsTravrondenAdapter(db);
    adapter.setFeedUrl('http://127.0.0.1:59999/ogiltig');
    adapter.setFetchOptions({ maxRetries: 0, backoffDelays: [] });
    adapter.setAllowFixtureFallback(true);

    const result = await adapter.fetch();
    expect(result.status).toBe('ok');
    expect(result.data).toBeDefined();
    expect(result.data?.[0].provider).toBe('Tips från Travronden');
  });

  it('degraderar lugnt till failed utan krasch om källa är avstängd', async () => {
    const adapter = new TipsExpressenAdapter(db);
    adapter.setSimulatedFailure(true);

    const result = await adapter.fetch();
    expect(result.status).toBe('failed');
    expect(result.message).toBe('Tipsen är från i morse. De brukar komma in på nytt vid lunch.');
  });
});
