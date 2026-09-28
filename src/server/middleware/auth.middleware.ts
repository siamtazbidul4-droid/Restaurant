import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AdminUser, IAdminUser } from '../models/AdminUser.js';

export interface AuthRequest extends Request {
  user?: IAdminUser;
}

// JWT signing secret. In production it MUST come from SESSION_SECRET — the server
// fails fast on startup if it is missing or too weak. In development only, a
// stable local fallback is used so the app can run without configuration.
function resolveJwtSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (process.env.NODE_ENV === 'production') {
    if (!secret || secret.length < 32) {
      throw new Error(
        'Refusing to start in production: SESSION_SECRET must be set to a random string of at least 32 characters.'
      );
    }
    return secret;
  }
  if (secret && secret.length >= 32) return secret;
  if (secret) {
    console.warn('[auth] SESSION_SECRET is shorter than 32 characters — using it anyway in development.');
  }
  return 'aurelia-luxury-dining-dev-secret-key-2026';
}

const JWT_SECRET = resolveJwtSecret();

export async function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    let token = req.cookies?.aurelia_session;
    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please sign in.',
        code: 'UNAUTHENTICATED',
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: string };
    const user = await AdminUser.findById(decoded.id).select('-passwordHash');

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated or does not exist.',
        code: 'ACCOUNT_INVALID',
      });
    }

    req.user = user;
    next();
  } catch (err: any) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired session. Please sign in again.',
      code: 'TOKEN_EXPIRED',
    });
  }
}

export function requireRole(allowedRoles: Array<'Owner' | 'Admin' | 'Manager' | 'Staff'>) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: insufficient permissions.',
        code: 'FORBIDDEN',
      });
    }
    next();
  };
}

export function signToken(user: IAdminUser): string {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
      name: user.name,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}
