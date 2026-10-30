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
import { stallRoutes } from './routes/stall.js';
import { janneBoyRoutes } from './routes/janne-boy.js';
import { omgangerRoutes } from './routes/omganger.js';
import { scheduler } from './collect/scheduler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const port = Number(process.env.PORT) || 3001;

export async function createServer(customDbPath?: string) {
  try {
    const db = customDbPath ? getDb(customDbPath) : undefined;
    runMigrations(db);
  } catch (err) {
    logger.error('Fel vid körning av databasmigrationer', err);
    throw err;
  }

  const app = fastify({
    logger: false,
  });

  await app.register(cors, {
    origin: true,
  });

  await app.register(kallorRoutes);
  await app.register(loppRoutes);
  await app.register(hastarRoutes);
  await app.register(banorRoutes);
  await app.register(tipsRoutes);
  await app.register(stallRoutes);
  await app.register(janneBoyRoutes);
  await app.register(omgangerRoutes);

  app.get('/halsa', async (_req, reply) => {
    return reply.status(200).send({ ok: true });
  });

  app.get('/api/status', async (_req, reply) => {
    return reply.status(200).send({
      ok: true,
      service: 'Tangitza Backend',
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
    logger.info(`Stallbacken backend körs på port ${port}`);

    if (process.env.NODE_ENV !== 'test') {
      scheduler.start();
    }
  } catch (err) {
    logger.error('Kunde inte starta servern', err);
    process.exit(1);
  }
}

if (process.env.NODE_ENV !== 'test') {
  main();
}
