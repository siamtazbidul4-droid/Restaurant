import { Request, Response, NextFunction } from 'express';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  const isProduction = process.env.NODE_ENV === 'production';

  console.error('[API Error]', {
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method,
    message: err.message,
    status: err.status || err.statusCode,
  });

  const statusCode = err.status || err.statusCode || 500;

  // In production, mask internal 500 database/system errors
  let clientMessage = err.message || 'An unexpected operational error occurred.';
  if (isProduction && statusCode === 500) {
    clientMessage = 'An unexpected error occurred while processing your request. Please try again shortly.';
  }

  res.status(statusCode).json({
    success: false,
    message: clientMessage,
    code: err.code || 'INTERNAL_SERVER_ERROR',
  });
}
