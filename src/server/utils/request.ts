/**
 * Shared helpers for the REST layer: safe error surfacing, request-body
 * whitelisting, and lightweight input validation.
 */

/** Extract a human-readable message from an unknown `catch` binding. */
export function errorMessage(err: unknown, fallback = 'Request failed.'): string {
  if (err instanceof Error && err.message) return err.message;
  if (typeof err === 'string' && err.length > 0) return err;
  return fallback;
}

/**
 * Copy only the declared keys out of a request body.
 *
 * Every write endpoint funnels its payload through this so a client can never
 * mass-assign protected paths (for example injecting `cloudinaryConfig.apiSecret`
 * through `PUT /api/settings`, or `_id`/`__v` through an update).
 */
export function pickAllowed<T = Record<string, unknown>>(
  body: unknown,
  allowed: readonly string[]
): T {
  const source = body && typeof body === 'object' ? (body as Record<string, unknown>) : {};
  const result: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in source && source[key] !== undefined) {
      result[key] = source[key];
    }
  }
  return result as T;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_PATTERN = /^\+?[0-9\s().-]{7,20}$/;
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

export function isValidEmail(value: unknown): value is string {
  return typeof value === 'string' && EMAIL_PATTERN.test(value.trim());
}

export function isValidPhone(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  const trimmed = value.trim();
  if (!PHONE_PATTERN.test(trimmed)) return false;
  // Require enough actual digits to be dialable.
  return trimmed.replace(/\D/g, '').length >= 7;
}

export function isIsoDate(value: unknown): value is string {
  if (typeof value !== 'string' || !ISO_DATE_PATTERN.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

export function isTimeString(value: unknown): value is string {
  return typeof value === 'string' && TIME_PATTERN.test(value.trim());
}

/** Trimmed string of reasonable length (used for names and free-text fields). */
export function isText(value: unknown, min = 2, max = 2000): value is string {
  return typeof value === 'string' && value.trim().length >= min && value.trim().length <= max;
}

/** Whole number within an inclusive range. */
export function isIntegerInRange(value: unknown, min: number, max: number): boolean {
  const num = typeof value === 'string' ? Number(value) : (value as number);
  return typeof num === 'number' && Number.isInteger(num) && num >= min && num <= max;
}
