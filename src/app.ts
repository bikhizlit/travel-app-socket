import express from 'express';
import cors from 'cors';
import { frontendOrigins } from './config/env.js';

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: frontendOrigins,
      credentials: true,
    }),
  );

  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.status(200).json({
      status: 'ok',
      service: 'travel-app-socket',
    });
  });

  return app;
}