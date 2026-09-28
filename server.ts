import dotenv from 'dotenv';
dotenv.config();

import path from 'path';
import fs from 'fs';
import express from 'express';
import type { Server } from 'http';
import mongoose from 'mongoose';
import { createExpressApp } from './src/server/app.js';
import { connectDB } from './src/server/config/db.js';
import { seedInitialData } from './src/server/seeds/seedData.js';

const PORT = parseInt(process.env.PORT || '3000', 10);
const isProduction = process.env.NODE_ENV === 'production';

async function startServer() {
  try {
    console.log('[Aurelia Platform] Initializing database connection...');
    await connectDB();

    console.log('[Aurelia Platform] Checking and seeding bootstrap data...');
    await seedInitialData();

    const app = createExpressApp();

    if (!isProduction) {
      console.log('[Aurelia Platform] Mounting Vite dev middleware...');
      const { createServer: createViteServer } = await import('vite');
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
    } else {
      console.log('[Aurelia Platform] Serving production static bundle from dist...');
      const distPath = path.resolve(process.cwd(), 'dist');
      if (fs.existsSync(distPath)) {
        app.use(express.static(distPath));
        app.get('*', (req, res, next) => {
          if (req.path.startsWith('/api')) {
            return next();
          }
          res.sendFile(path.join(distPath, 'index.html'));
        });
      }
    }

    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`[Aurelia Platform] Server running securely at http://0.0.0.0:${PORT}`);
    });

    registerShutdownHooks(server);
  } catch (err) {
    console.error('[Aurelia Platform] Fatal startup error:', err);
    process.exit(1);
  }
}

/**
 * Render stops a service with SIGTERM and expects the process to drain within a
 * short grace window; without this the instance is SIGKILLed mid-request.
 */
function registerShutdownHooks(server: Server): void {
  let shuttingDown = false;

  const shutdown = (signal: string) => {
    if (shuttingDown) return;
    shuttingDown = true;
    console.log(`[Aurelia Platform] ${signal} received — draining connections...`);

    const forceExit = setTimeout(() => {
      console.error('[Aurelia Platform] Connections did not drain in time; forcing exit.');
      process.exit(1);
    }, 8000);
    forceExit.unref();

    server.close(() => {
      clearTimeout(forceExit);
      mongoose.connection
        .close()
        .catch(() => undefined)
        .then(() => process.exit(0));
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

// Surface async faults that Express cannot catch instead of dying silently.
process.on('unhandledRejection', (reason) => {
  console.error(
    '[Aurelia Platform] Unhandled promise rejection:',
    reason instanceof Error ? reason.stack : reason
  );
});

process.on('uncaughtException', (err) => {
  console.error('[Aurelia Platform] Uncaught exception:', err);
  process.exit(1);
});

startServer();

