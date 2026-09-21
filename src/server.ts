import 'reflect-metadata';
import 'dotenv/config';

import http from 'node:http';

import { createApp } from './app';
import { AppDataSource } from './db/data-source';
import { env } from './config/env';
import { initSocket } from './socket';   // ← add

async function bootstrap() {
  try {
    await AppDataSource.initialize();
    console.log('Database connection established');

    const app = createApp();
    const httpServer = http.createServer(app);

    const io = initSocket(httpServer);   // ← add

    httpServer.listen(env.PORT, () => {
      console.log(`Socket service listening on http://localhost:${env.PORT}`);
    });

    // io is now live; we'll use it in Phase 5 to emit from REST routes.
  } catch (err) {
    console.error('Failed to start socket service:', err);
    process.exit(1);
  }
}

bootstrap();