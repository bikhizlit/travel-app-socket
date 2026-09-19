import http from 'node:http';

import { createApp } from './app.js';
import { env } from './config/env.js';

const app = createApp();

const httpServer = http.createServer(app);

httpServer.listen(env.PORT, '0.0.0.0', () => {
  console.log(
    `Socket service listening on http://localhost:${env.PORT}`,
  );
});