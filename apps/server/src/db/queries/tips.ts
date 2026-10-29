// Databasfrågor för tips och redaktionella artiklar
// Stallbacken — HTG

import Database from 'better-sqlite3';
import { TipItem } from '@stallbacken/shared';

export interface DbTipArticleInput {
  id: string;
  provider: string;
  author?: string;
  title: string;
  summary?: string;
  content?: string;
  url?: string;
  publishedAt: string;
  sourceId: string;
  fetchedAt: string;
}

export interface DbRaceTipInput {
  id: string;
  raceId: string;
  startId?: string;
  provider: string;
  author?: string;
  title?: string;
  rank?: number;
  comment?: string;
  publishedAt: string;
  sourceId: string;
  fetchedAt: string;
}

/**
 * Sparar eller uppdaterar en redaktionell tipsartikel.
 */
export function saveTipArticle(db: Database.Database, item: DbTipArticleInput): void {
  const stmt = db.prepare(`
    INSERT INTO tip_articles (id, provider, author, title, summary, content, url, published_at, source_id, fetched_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    ON CONFLICT(id) DO UPDATE SET
      provider = excluded.provider,
      author = COALESCE(excluded.author, tip_articles.author),
      title = excluded.title,
      summary = COALESCE(excluded.summary, tip_articles.summary),
      content = COALESCE(excluded.content, tip_articles.content),
      url = COALESCE(excluded.url, tip_articles.url),
      published_at = excluded.published_at,
      source_id = excluded.source_id,
      fetched_at = excluded.fetched_at,
      updated_at = datetime('now')
  `);

  stmt.run(
    item.id,
    item.provider,
    item.author || null,
    item.title,
    item.summary || null,
    item.content || null,
    item.url || null,
    item.publishedAt,
    item.sourceId,
    item.fetchedAt
  );
}

/**
 * Hämtar senaste redaktionella artiklar och tips.
 */
export function getLatestTipArticles(db: Database.Database, limit = 20): TipItem[] {
  interface ArticleRow {
    id: string;
    provider: string;
    author: string | null;
    title: string;
    summary: string | null;
    url: string | null;
    published_at: string;
    source_id: string;
  }

  const rows = db
    .prepare(
      `
      SELECT id, provider, author, title, summary, url, published_at, source_id
      FROM tip_articles
      ORDER BY published_at DESC
      LIMIT ?
    `
    )
    .all(limit) as ArticleRow[];

  return rows.map((r) => ({
    id: r.id,
    provider: r.provider,
    author: r.author || undefined,
    title: r.title,
    summary: r.summary || undefined,
    url: r.url || undefined,
    publishedAt: r.published_at,
    sourceId: r.source_id,
  }));
}

/**
 * Sparar eller uppdaterar ett loppspecifikt tips.
 */
export function saveRaceTip(db: Database.Database, tip: DbRaceTipInput): void {
  try {
    const hasRace = db.prepare('SELECT 1 FROM races WHERE id = ?').get(tip.raceId);
    if (!hasRace) {
      return;
    }
    if (tip.startId) {
      const hasStart = db.prepare('SELECT 1 FROM starts WHERE id = ?').get(tip.startId);
      if (!hasStart) {
        return;
      }
    }

    const stmt = db.prepare(`
      INSERT INTO tips (id, race_id, start_id, provider, rank, comment, published_at, source_id, fetched_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
      ON CONFLICT(id) DO UPDATE SET
        race_id = excluded.race_id,
        start_id = COALESCE(excluded.start_id, tips.start_id),
        provider = excluded.provider,
        rank = COALESCE(excluded.rank, tips.rank),
        comment = COALESCE(excluded.comment, tips.comment),
        published_at = excluded.published_at,
        source_id = excluded.source_id,
        fetched_at = excluded.fetched_at,
        updated_at = datetime('now')
    `);

    stmt.run(
      tip.id,
      tip.raceId,
      tip.startId || `${tip.raceId}_1`,
      tip.provider,
      tip.rank || null,
      tip.comment || null,
      tip.publishedAt,
      tip.sourceId,
      tip.fetchedAt
    );
  } catch {
    // Tyst felhantering så att artiklar sparas även om lopprelationer saknas
  }
}

/**
 * Hämtar loppspecifika tips för ett visst lopp med hästnamn och nummer.
 */
export function getTipsForRace(db: Database.Database, raceId: string): TipItem[] {
  interface TipRow {
    id: string;
    race_id: string;
    start_id: string;
    provider: string;
    rank: number | null;
    comment: string | null;
    published_at: string;
    source_id: string;
    start_number: number | null;
    horse_name: string | null;
  }

  const rows = db
    .prepare(
      `
      SELECT 
        t.id,
        t.race_id,
        t.start_id,
        t.provider,
        t.rank,
        t.comment,
        t.published_at,
        t.source_id,
        s.start_number,
        h.name as horse_name
      FROM tips t
      LEFT JOIN starts s ON t.start_id = s.id
      LEFT JOIN horses h ON s.horse_id = h.id
      WHERE t.race_id = ?
      ORDER BY t.rank ASC, t.provider ASC
    `
    )
    .all(raceId) as TipRow[];

  return rows.map((r) => ({
    id: r.id,
    raceId: r.race_id,
    startId: r.start_id,
    provider: r.provider,
    title: r.horse_name ? `${r.horse_name} (nr ${r.start_number || '–'})` : `Tips: ${r.provider}`,
    summary: r.comment || undefined,
    rank: r.rank || undefined,
    horseNumber: r.start_number || undefined,
    horseName: r.horse_name || undefined,
    publishedAt: r.published_at,
    sourceId: r.source_id,
  }));
}

/**
 * Hämtar alla sparade lopptips i systemet.
 */
export function getAllRaceTips(db: Database.Database): TipItem[] {
  interface TipRow {
    id: string;
    race_id: string;
    start_id: string;
    provider: string;
    rank: number | null;
    comment: string | null;
    published_at: string;
    source_id: string;
    start_number: number | null;
    horse_name: string | null;
    race_number: number | null;
    track_name: string | null;
  }

  const rows = db
    .prepare(
      `
      SELECT 
        t.id,
        t.race_id,
        t.start_id,
        t.provider,
        t.rank,
        t.comment,
        t.published_at,
        t.source_id,
        s.start_number,
        h.name as horse_name,
        r.number as race_number,
        tr.name as track_name
      FROM tips t
      LEFT JOIN starts s ON t.start_id = s.id
      LEFT JOIN horses h ON s.horse_id = h.id
      LEFT JOIN races r ON t.race_id = r.id
      LEFT JOIN race_days rd ON r.race_day_id = rd.id
      LEFT JOIN tracks tr ON rd.track_id = tr.id
      ORDER BY t.published_at DESC, t.rank ASC
      LIMIT 50
    `
    )
    .all() as TipRow[];

  return rows.map((r) => ({
    id: r.id,
    raceId: r.race_id,
    startId: r.start_id,
    trackName: r.track_name || undefined,
    provider: r.provider,
    title: r.horse_name ? `${r.horse_name} (nr ${r.start_number || '–'})` : `Tips: ${r.provider}`,
    summary: r.comment || undefined,
    rank: r.rank || undefined,
    horseNumber: r.start_number || undefined,
    horseName: r.horse_name || undefined,
    publishedAt: r.published_at,
    sourceId: r.source_id,
  }));
}
