import { Request, Response, NextFunction } from 'express';

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const rateLimitMap = new Map<string, RateLimitRecord>();

/**
 * Resolve the visitor's real address. Behind Render the socket address is the
 * reverse proxy, so the left-most X-Forwarded-For entry must be preferred
 * (app.set('trust proxy', ...) is enabled in app.ts for the same reason).
 */
function clientKey(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  const first = Array.isArray(forwarded) ? forwarded[0] : forwarded;
  if (first && first.trim().length > 0) {
    return first.split(',')[0].trim();
  }
  return req.ip || 'unknown';
}

// Buckets are only discarded when re-hit, so traffic from many unique clients
// would otherwise grow the map without bound on a long-lived process.
const sweepTimer = setInterval(() => {
  const now = Date.now();
  rateLimitMap.forEach((record, key) => {
    if (now > record.resetAt) rateLimitMap.delete(key);
  });
}, 60 * 1000);
sweepTimer.unref();

export function simpleRateLimit(maxRequests = 30, windowMs = 60 * 1000) {
  return (req: Request, res: Response, next: NextFunction) => {
    const key = `${req.baseUrl || req.path}_${clientKey(req)}`;
    const now = Date.now();

    const record = rateLimitMap.get(key);

    if (!record || now > record.resetAt) {
      rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    if (record.count >= maxRequests) {
      return res.status(429).json({
        success: false,
        message: 'Too many requests. Please try again shortly.',
        code: 'RATE_LIMIT_EXCEEDED',
      });
    }

    record.count += 1;
    next();
  };
}
