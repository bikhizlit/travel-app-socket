import express from 'express';
import cors from 'cors';

import { AppDataSource } from './db/data-source';
import { frontendOrigins } from './config/env';

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: frontendOrigins,
      credentials: true,
    }),
  );

  app.use(express.json());

  app.get('/health', async (_req, res) => {
    let database: 'ok' | 'error' = 'ok';
    try {
      await AppDataSource.query('SELECT 1');
    } catch {
      database = 'error';
    }

    res.json({
      status: database === 'ok' ? 'ok' : 'degraded',
      service: 'travel-app-socket',
      database,
    });
  });

  return app;
}