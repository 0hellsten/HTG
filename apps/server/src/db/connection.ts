import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { logger } from '../lib/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let dbInstance: Database.Database | null = null;

export function getDefaultDbPath(): string {
  if (process.env.DB_PATH) {
    return process.env.DB_PATH;
  }
  const repoRoot = path.resolve(__dirname, '../../../../');
  return path.join(repoRoot, 'data', 'stallbacken.db');
}

export function getDb(dbPath?: string): Database.Database {
  if (dbInstance && !dbPath) {
    return dbInstance;
  }

  const targetPath = dbPath || getDefaultDbPath();

  if (targetPath !== ':memory:') {
    const dir = path.dirname(targetPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  const db = new Database(targetPath);

  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  if (!dbPath) {
    dbInstance = db;
    logger.info(`SQLite-databas ansluten: ${targetPath}`);
  }

  return db;
}

export function closeDb(): void {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
    logger.info('SQLite-databasanslutning stängd');
  }
}
