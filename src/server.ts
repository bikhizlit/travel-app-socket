import 'reflect-metadata';
import 'dotenv/config';

import http from 'node:http';

import { createApp } from './app';
import { AppDataSource } from './db/data-source';
import { env } from './config/env';

async function bootstrap() {
  try {
    await AppDataSource.initialize();
    console.log('Database connection established');

    const app = createApp();
    const httpServer = http.createServer(app);

    // Socket.IO will be attached to httpServer in Phase 4.
    // import { attachSocketServer } from './socket';
    // attachSocketServer(httpServer);

    httpServer.listen(env.PORT, () => {
      console.log(`Socket service listening on http://localhost:${env.PORT}`);
    });
  } catch (err) {
    console.error('Failed to start socket service:', err);
    process.exit(1);
  }
}

bootstrap();