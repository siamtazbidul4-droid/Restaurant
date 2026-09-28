import express from 'express';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import path from 'path';
import fs from 'fs';

import authRoutes from './routes/auth.routes.js';
import reservationsRoutes from './routes/reservations.routes.js';
import menuRoutes from './routes/menu.routes.js';
import tablesRoutes from './routes/tables.routes.js';
import eventsRoutes from './routes/events.routes.js';
import contactRoutes from './routes/contact.routes.js';
import settingsRoutes from './routes/settings.routes.js';
import contentRoutes from './routes/content.routes.js';
import mediaRoutes from './routes/media.routes.js';
import adminRoutes from './routes/admin.routes.js';
import { errorHandler } from './middleware/errorHandler.middleware.js';

export function createExpressApp() {
  const app = express();

  // Security hardening: disable fingerprinting
  app.disable('x-powered-by');

  // Render terminates TLS at a managed reverse proxy. Without trusting it,
  // req.ip always resolves to the proxy address, which would make the login
  // rate limiter treat every visitor on the instance as one single client.
  app.set('trust proxy', 1);

  // Security headers middleware
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    if (req.secure || req.headers['x-forwarded-proto'] === 'https') {
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    }
    next();
  });

  // The production build emits the Node bundle inside the same folder that is
  // served statically (dist/server.js). Never let the client download it.
  app.use((req, res, next) => {
    if (req.path === '/server.js' || req.path.startsWith('/server/')) {
      return res.status(404).json({ success: false, message: 'Not found' });
    }
    next();
  });

  // Body parsing middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(cookieParser());

  // Static files for uploaded media
  const uploadsDir = path.resolve(process.cwd(), 'public/uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  app.use('/uploads', express.static(uploadsDir));

  const imagesDir = path.resolve(process.cwd(), 'public/images');
  if (fs.existsSync(imagesDir)) {
    app.use('/images', express.static(imagesDir));
  }

  // Health check (used by Render health monitoring — includes live DB state)
  app.get('/api/health', (req, res) => {
    const dbState = mongoose.connection.readyState; // 0=disconnected 1=connected 2=connecting 3=disconnecting
    res.status(dbState === 1 ? 200 : 503).json({
      status: dbState === 1 ? 'ok' : 'degraded',
      service: 'Aurelia Haute Dining Engine',
      database: dbState === 1 ? 'connected' : 'unavailable',
      timestamp: new Date(),
    });
  });

  // REST API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/reservations', reservationsRoutes);
  app.use('/api/menu', menuRoutes);
  app.use('/api/tables', tablesRoutes);
  app.use('/api/events', eventsRoutes);
  app.use('/api/contact', contactRoutes);
  app.use('/api/settings', settingsRoutes);
  app.use('/api/content', contentRoutes);
  app.use('/api/media', mediaRoutes);
  app.use('/api/admin', adminRoutes);

  // API catch-all: unknown /api/* routes must return JSON 404,
  // never fall through to the SPA/HTML fallback (which would cause
  // "Unexpected token '<'" when clients parse the response as JSON).
  app.use('/api', (req, res) => {
    res.status(404).json({ message: `API route not found: ${req.method} ${req.originalUrl}` });
  });

  // Global Error Handler
  app.use(errorHandler);

  return app;
}
