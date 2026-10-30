import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { logger } from '../lib/logger.js';
import { getDb } from './connection.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface MigrationRow {
  version: string;
  applied_at: string;
}

export function runMigrations(database?: Database.Database): void {
  const db = database || getDb();

  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version TEXT PRIMARY KEY,
      applied_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  let migrationsDir = path.resolve(__dirname, 'migrations');
  if (!fs.existsSync(migrationsDir)) {
    const srcMigrations = path.resolve(__dirname, '../../src/db/migrations');
    if (fs.existsSync(srcMigrations)) {
      migrationsDir = srcMigrations;
    } else {
      logger.warn(`Migrationsmappen finns inte: ${migrationsDir}`);
      return;
    }
  }

  const files = fs
    .readdirSync(migrationsDir)
    .filter((file) => /^\d+.*\.sql$/.test(file))
    .sort();

  const appliedRows = db.prepare('SELECT version FROM schema_migrations').all() as MigrationRow[];
  const appliedVersions = new Set(appliedRows.map((r) => r.version));

  for (const file of files) {
    if (!appliedVersions.has(file)) {
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf-8');

      logger.info(`Kör databasmigration: ${file}`);

      const applyMigration = db.transaction(() => {
        db.exec(sql);
        db.prepare(
          "INSERT INTO schema_migrations (version, applied_at) VALUES (?, datetime('now'))"
        ).run(file);
      });

      applyMigration();
      logger.info(`Migration slutförd: ${file}`);
    }
  }
}
