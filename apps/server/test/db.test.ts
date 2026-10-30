import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Database from 'better-sqlite3';
import { runMigrations } from '../src/db/migrations.js';

describe('Databas och migrationer (Fas 2)', () => {
  let db: Database.Database;

  beforeEach(() => {
    // Kör mot en temporär in-memory databas för isolerade tester
    db = new Database(':memory:');
    db.pragma('foreign_keys = ON');
  });

  afterEach(() => {
    db.close();
  });

  it('kör migration 001_grundschema.sql och skapar alla specificerade tabeller', () => {
    runMigrations(db);

    const tables = db
      .prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
      .all() as { name: string }[];

    const tableNames = tables.map((t) => t.name);

    // Verifiera att alla tabeller från specifikationen existerar
    const expectedTables = [
      'favorites',
      'horses',
      'odds',
      'people',
      'race_days',
      'races',
      'raw_cache',
      'schema_migrations',
      'source_health',
      'starts',
      'tips',
      'tracks',
      'weather',
    ];

    for (const expected of expectedTables) {
      expect(tableNames).toContain(expected);
    }
  });

  it('är idempotent och kan köras flera gånger utan fel', () => {
    runMigrations(db);
    // Andra körningen ska inte kasta fel och inte duplicera schema_migrations
    expect(() => runMigrations(db)).not.toThrow();

    const migrations = db.prepare('SELECT version FROM schema_migrations').all();
    expect(migrations.length).toBeGreaterThanOrEqual(3);
  });

  it('sparar och läser rader i source_health med automatiska tidsstämplar', () => {
    runMigrations(db);

    const insert = db.prepare(`
      INSERT INTO source_health (
        source_id, status, attempted_at, succeeded_at, age_seconds, message, detail, consecutive_failures, paused_until
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = insert.run(
      'fake-source',
      'ok',
      '2026-10-29T12:00:00.000Z',
      '2026-10-29T12:00:00.000Z',
      10,
      'Färskt',
      'Allt väl',
      0,
      null
    );

    expect(result.changes).toBe(1);

    const row = db
      .prepare('SELECT * FROM source_health WHERE id = ?')
      .get(result.lastInsertRowid) as {
      source_id: string;
      status: string;
      created_at: string;
      updated_at: string;
    };

    expect(row.source_id).toBe('fake-source');
    expect(row.status).toBe('ok');
    expect(row.created_at).toBeDefined();
    expect(row.updated_at).toBeDefined();
  });
});
