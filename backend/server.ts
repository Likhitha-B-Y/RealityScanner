/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { scanRouter } from './routes/scanRoutes.ts';
import { reportRouter } from './routes/reportRoutes.ts';
import { authorityRouter } from './routes/authorityRoutes.ts';
import { demoRouter } from './routes/demoRoutes.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

export async function createFullStackServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // JSON parser with high limit for image payloads
  app.use(express.json({ limit: '25mb' }));
  app.use(express.urlencoded({ extended: true, limit: '25mb' }));

  // API Routes
  app.use('/api', scanRouter);
  app.use('/api/reports', reportRouter);
  app.use('/api/authority', authorityRouter);
  app.use('/api/demo', demoRouter);

  // Health check endpoint
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'healthy',
      app: 'Reality Scanner',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    });
  });

  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    // Mount Vite dev server middleware
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
      root: rootDir,
    });
    app.use(vite.middlewares);
  } else {
    // Serve production static build
    const distPath = path.resolve(rootDir, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Reality Scanner] Server running on http://0.0.0.0:${PORT}`);
  });

  return app;
}
