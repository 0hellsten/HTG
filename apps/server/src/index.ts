import fastify from 'fastify';
import cors from '@fastify/cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { logger } from './lib/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Läs .env från repo-roten
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const port = Number(process.env.PORT) || 3001;

export async function createServer() {
  const app = fastify({
    logger: false, // Vi använder vår egen logger enligt kodreglerna
  });

  await app.register(cors, {
    origin: true,
  });

  // Hälsokontroll enligt Fas 1-specifikationen
  app.get('/halsa', async (_req, reply) => {
    return reply.status(200).send({ ok: true });
  });

  // API-version / status
  app.get('/api/status', async (_req, reply) => {
    return reply.status(200).send({
      ok: true,
      service: 'Stallbacken Backend',
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
  } catch (err) {
    logger.error('Kunde inte starta servern', err);
    process.exit(1);
  }
}

if (process.env.NODE_ENV !== 'test') {
  main();
}
