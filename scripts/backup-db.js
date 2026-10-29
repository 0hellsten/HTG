#!/usr/bin/env node
// Skript för säkerhetskopiering av Stallbackens SQLite-databas
// Sparar kopia i backups/ och behåller de 14 senaste backupfilerna.
// Körs dagligen via cron eller manuellt med "pnpm backup".

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Enkel inläsning av .env utan externa beroenden
function loadEnv() {
  const envPath = path.join(rootDir, '.env');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf-8').split(/\r?\n/);
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx > 0) {
        const k = trimmed.substring(0, idx).trim();
        const v = trimmed.substring(idx + 1).trim();
        if (!process.env[k]) {
          process.env[k] = v;
        }
      }
    }
  }
}

loadEnv();

const dbPath = process.env.DB_PATH || path.join(rootDir, 'data', 'stallbacken.db');
const backupsDir = path.join(rootDir, 'backups');
const maxBackups = 14;

export function runBackup() {
  if (!fs.existsSync(dbPath)) {
    console.warn(`[VARNING] Databasfilen hittades inte på: ${dbPath}`);
    return null;
  }

  if (!fs.existsSync(backupsDir)) {
    fs.mkdirSync(backupsDir, { recursive: true });
  }

  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const hh = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  const ss = String(now.getSeconds()).padStart(2, '0');

  const dateTag = `${yyyy}-${mm}-${dd}`;
  let targetFileName = `stallbacken-${dateTag}.db`;
  let targetPath = path.join(backupsDir, targetFileName);

  // Om det redan finns en backup från samma dygn, lägg till tidsstämpel
  if (fs.existsSync(targetPath)) {
    targetFileName = `stallbacken-${dateTag}-${hh}${min}${ss}.db`;
    targetPath = path.join(backupsDir, targetFileName);
  }

  // Kopiera databasfilen
  fs.copyFileSync(dbPath, targetPath);

  const stats = fs.statSync(targetPath);
  const sizeKb = (stats.size / 1024).toFixed(1);
  console.log(`[INFO] Databasbackup skapad: ${targetFileName} (${sizeKb} kB)`);

  // Rotera och behåll de 14 senaste
  const allBackups = fs
    .readdirSync(backupsDir)
    .filter((f) => f.startsWith('stallbacken-') && f.endsWith('.db'))
    .map((f) => {
      const full = path.join(backupsDir, f);
      return {
        name: f,
        fullPath: full,
        mtime: fs.statSync(full).mtime.getTime(),
      };
    })
    .sort((a, b) => b.mtime - a.mtime); // Nyast först

  if (allBackups.length > maxBackups) {
    const toDelete = allBackups.slice(maxBackups);
    for (const item of toDelete) {
      try {
        fs.unlinkSync(item.fullPath);
        console.log(`[INFO] Äldre backup borttagen enligt 14-dagarsregeln: ${item.name}`);
      } catch (err) {
        console.warn(`[VARNING] Kunde inte ta bort gammal backup ${item.name}:`, err);
      }
    }
  }

  console.log(`[INFO] Totalt ${Math.min(allBackups.length, maxBackups)} säkerhetskopior sparade i backups/.`);
  return targetPath;
}

// Kör direkt om anropas via CLI
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    runBackup();
  } catch (err) {
    console.error('[FEL] Misslyckades att skapa databasbackup:', err);
    process.exit(1);
  }
}
