import fastify from 'fastify';
import cors from '@fastify/cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { logger } from './lib/logger.js';
import { getDb } from './db/connection.js';
import { runMigrations } from './db/migrations.js';
import { kallorRoutes } from './routes/kallor.js';
import { loppRoutes } from './routes/lopp.js';
import { hastarRoutes } from './routes/hastar.js';
import { banorRoutes } from './routes/banor.js';
import { tipsRoutes } from './routes/tips.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Läs .env från repo-roten
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const port = Number(process.env.PORT) || 3001;

export async function createServer(customDbPath?: string) {
  // Kör databasmigrationer automatiskt
  try {
    const db = customDbPath ? getDb(customDbPath) : undefined;
    runMigrations(db);
  } catch (err) {
    logger.error('Fel vid körning av databasmigrationer', err);
    throw err;
  }

  const app = fastify({
    logger: false, // Egen logger enligt projektets regler
  });

  await app.register(cors, {
    origin: true,
  });

  // Registrera API-rutter
  await app.register(kallorRoutes);
  await app.register(loppRoutes);
  await app.register(hastarRoutes);
  await app.register(banorRoutes);
  await app.register(tipsRoutes);

  // Hälsokontroll enligt Fas 1-specifikationen
  app.get('/halsa', async (_req, reply) => {
    return reply.status(200).send({ ok: true });
  });

  // API-version / status
  app.get('/api/status', async (_req, reply) => {
    return reply.status(200).send({
      ok: true,
      service: 'HTG Backend',
      version: '1.0.0',
      time: new Date().toISOString(),
    });
  });

  return app;
}

async function main() {
  try {
    const server = await createServer();
    await server.listen({ port, host: '0.0.0.0' });
    logger.info(`HTG backend körs på port ${port}`);
  } catch (err) {
    logger.error('Kunde inte starta servern', err);
    process.exit(1);
  }
}

if (process.env.NODE_ENV !== 'test') {
  main();
}
