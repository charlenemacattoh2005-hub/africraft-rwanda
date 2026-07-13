/**
 * api.ts — Production-quality centralized API client
 *
 * ─────────────────────────────────────────────────────────────
 * FEATURES
 * ─────────────────────────────────────────────────────────────
 * • Single source of truth for backend URL (VITE_API_URL env var)
 * • 30-second AbortController timeout per attempt
 * • 5 automatic retry attempts with increasing delays:
 *     attempt 1 → wait 5s  → attempt 2
 *     attempt 2 → wait 10s → attempt 3
 *     attempt 3 → wait 15s → attempt 4
 *     attempt 4 → wait 20s → attempt 5
 *     attempt 5 → final failure
 * • 4xx errors are NEVER retried (definitive — wrong password, etc.)
 * • 5xx errors ARE retried (server may be temporarily down)
 * • Network errors ARE retried (cold start, DNS, CORS preflight)
 * • Structured console logging on every attempt
 * • Smart human-readable error messages — never blames user internet
 *   unless navigator.onLine === false
 * ─────────────────────────────────────────────────────────────
 */

// ─────────────────────────────────────────────────────────────
// Base URL
// Dev:  http://localhost:5000  (Vite proxy handles /api/* in dev)
// Prod: set VITE_API_URL in Vercel dashboard + .env.production
// ─────────────────────────────────────────────────────────────
export const API_BASE_URL: string =
  (import.meta.env.VITE_API_URL as string) || 'http://localhost:5000';

// ─────────────────────────────────────────────────────────────
// Config
// ─────────────────────────────────────────────────────────────
const AUTH_TOKEN_KEY = 'africraft_auth_token';
const TIMEOUT_MS     = 30_000; // 30 s per attempt

/** Delays between attempts in ms: after attempt 1, 2, 3, 4 */
const RETRY_DELAYS = [5_000, 10_000, 15_000, 20_000]; // → 5 total attempts

/** Total number of attempts = 1 initial + 4 retries */
const MAX_ATTEMPTS = RETRY_DELAYS.length + 1; // 5

// ─────────────────────────────────────────────────────────────
// HTTP status → friendly message
// ─────────────────────────────────────────────────────────────
const HTTP_STATUS_MESSAGES: Record<number, string> = {
  400: 'Bad request — please check your input and try again.',
  401: 'You are not signed in, or your session has expired. Please log in again.',
  403: 'You do not have permission to perform this action.',
  404: 'The requested resource was not found.',
  409: 'A conflict occurred — this record may already exist.',
  422: 'The server could not process your request. Please check your input.',
  429: 'Too many requests — please wait a moment and try again.',
  500: 'An internal server error occurred. Please try again in a moment.',
  502: 'The server is temporarily unavailable (bad gateway). Please try again shortly.',
  503: 'The service is unavailable — the server may still be starting up.',
  504: 'The server gateway timed out. Please try again.',
};

/** Messages shown while retrying a network failure — indexed by attempt number (1-based) */
const COLD_START_MESSAGES: Record<number, string> = {
  1: 'Server is starting. This may take up to one minute.',
  2: 'Still waiting for the server to wake up…',
  3: 'The server is taking longer than expected. Still retrying…',
  4: 'Almost there — waiting for the server to respond…',
  5: 'Final retry attempt.',
};

/** Shown after ALL retries are exhausted */
const FINAL_FAILURE_MESSAGE =
  'The DellCraft server is temporarily unavailable.\n\n' +
  'Possible reasons:\n' +
  '• Render is still starting.\n' +
  '• The backend deployment failed.\n' +
  '• The server is under maintenance.\n\n' +
  'Please try again in one minute.';

// ─────────────────────────────────────────────────────────────
// Auth token helpers
// ─────────────────────────────────────────────────────────────
export function setAuthToken(token: string | null): void {
  if (!token) {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    sessionStorage.removeItem(AUTH_TOKEN_KEY);
    return;
  }
  try {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  } catch {
    sessionStorage.setItem(AUTH_TOKEN_KEY, token);
  }
}

export function getAuthToken(): string | null {
  try {
    return (
      localStorage.getItem(AUTH_TOKEN_KEY) ||
      sessionStorage.getItem(AUTH_TOKEN_KEY)
    );
  } catch {
    return sessionStorage.getItem(AUTH_TOKEN_KEY);
  }
}

export function getAuthPayload(): Record<string, any> | null {
  const token = getAuthToken();
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  try {
    return JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────────────────────
// Internal helpers
// ─────────────────────────────────────────────────────────────
function buildUrl(path: string): string {
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

function authHeader(token: string | null): Record<string, string> {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function parseBody(res: Response): Promise<any> {
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) {
    try { return await res.json(); } catch { return null; }
  }
  const text = await res.text();
  try { return text ? JSON.parse(text) : null; } catch { return text || null; }
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/** Structured logger — only in development */
function log(
  level: 'info' | 'warn' | 'error',
  method: string,
  url: string,
  extra: Record<string, any>
): void {
  const label = `[api] ${method} ${url}`;
  const data = { ...extra, ts: new Date().toISOString() };
  if (level === 'info')  console.info(label, data);
  if (level === 'warn')  console.warn(label, data);
  if (level === 'error') console.error(label, data);
}

// ─────────────────────────────────────────────────────────────
// Error builders
// ─────────────────────────────────────────────────────────────
function buildHttpError(res: Response, data: any, method: string): Error {
  const serverMsg = data?.message || data?.error || null;
  const statusMsg = HTTP_STATUS_MESSAGES[res.status] || null;
  const endpoint  = res.url ? new URL(res.url).pathname : '';

  const message = serverMsg || statusMsg || `HTTP ${res.status} ${res.statusText} — ${endpoint}`;

  const err: any = new Error(message);
  err.status = res.status;
  err.data   = data;
  err.url    = res.url;
  err.isHttp = true;

  log('warn', method, endpoint, { status: res.status, message });
  return err;
}

function buildNetworkError(cause: Error, attempt: number, method: string, url: string): Error {
  // Only mention internet if the browser itself says it's offline
  if (!navigator.onLine) {
    const err: any = new Error(
      'You appear to be offline. Please check your internet connection and try again.'
    );
    err.isOffline = true;
    log('warn', method, url, { offline: true, attempt });
    return err;
  }

  // Request was aborted by our timeout
  if (cause.name === 'AbortError') {
    const msg =
      `Request timed out after ${TIMEOUT_MS / 1000}s ` +
      `(attempt ${attempt} of ${MAX_ATTEMPTS}). ` +
      `The server may be waking up — retrying…`;
    const err: any = new Error(msg);
    err.isTimeout = true;
    err.attempt   = attempt;
    log('warn', method, url, { timeout: true, attempt });
    return err;
  }

  // Any other network failure (cold start, DNS, CORS preflight)
  const message = COLD_START_MESSAGES[attempt] ?? COLD_START_MESSAGES[5];
  const err: any = new Error(message);
  err.isNetwork  = true;
  err.isColdStart = true;
  err.attempt    = attempt;

  log('warn', method, url, { network: cause.message, attempt });
  return err;
}

// ─────────────────────────────────────────────────────────────
// Core request — timeout + retry loop
// ─────────────────────────────────────────────────────────────
async function request(
  url: string,
  options: RequestInit & { _method?: string }
): Promise<any> {
  const method = (options._method || options.method || 'GET').toUpperCase();
  const path   = url.replace(API_BASE_URL, '') || url;

  let lastError: Error = new Error('Unknown error');

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const controller = new AbortController();
    const timer      = setTimeout(() => controller.abort(), TIMEOUT_MS);

    log('info', method, path, { attempt, of: MAX_ATTEMPTS });

    try {
      const res = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timer);

      log('info', method, path, { attempt, status: res.status });

      const data = await parseBody(res);

      if (!res.ok) {
        const err = buildHttpError(res, data, method);
        // 4xx → definitive, no retry
        if (res.status >= 400 && res.status < 500) throw err;
        // 5xx → retry
        lastError = err;
      } else {
        // ✓ Success
        if (attempt > 1) {
          log('info', method, path, { recovered: true, attempt });
        }
        return data;
      }
    } catch (err: any) {
      clearTimeout(timer);

      // Re-throw 4xx immediately — no retry
      if (err.isHttp && err.status >= 400 && err.status < 500) throw err;

      lastError = buildNetworkError(err, attempt, method, path);
    }

    // Wait before next attempt (no wait after the last one)
    if (attempt < MAX_ATTEMPTS) {
      const delay = RETRY_DELAYS[attempt - 1];
      log('info', method, path, {
        retrying: true,
        attempt,
        nextIn: `${delay / 1000}s`,
      });
      await sleep(delay);
    }
  }

  // All attempts exhausted
  log('error', method, path, {
    failed: true,
    attempts: MAX_ATTEMPTS,
    error: lastError.message,
  });

  // Replace the per-attempt cold-start message with the final definitive message
  const finalErr: any = new Error(FINAL_FAILURE_MESSAGE);
  finalErr.isFinalFailure = true;
  finalErr.cause          = lastError;
  throw finalErr;
}

// ─────────────────────────────────────────────────────────────
// Public API helpers
// ─────────────────────────────────────────────────────────────
export function apiGet(path: string): Promise<any> {
  return request(buildUrl(path), {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
}

export function apiGetAuth(path: string): Promise<any> {
  const token = getAuthToken();
  return request(buildUrl(path), {
    method: 'GET',
    headers: { 'Content-Type': 'application/json', ...authHeader(token) },
  });
}

export function apiPost(path: string, body: any, isAuth = false): Promise<any> {
  const token = isAuth ? getAuthToken() : null;
  return request(buildUrl(path), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeader(token) },
    body: JSON.stringify(body ?? {}),
  });
}

export function apiPut(path: string, body: any, isAuth = false): Promise<any> {
  const token = isAuth ? getAuthToken() : null;
  return request(buildUrl(path), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeader(token) },
    body: JSON.stringify(body ?? {}),
  });
}

export function apiPatch(path: string, body: any): Promise<any> {
  const token = getAuthToken();
  return request(buildUrl(path), {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeader(token) },
    body: JSON.stringify(body ?? {}),
  });
}

export function apiDelete(path: string, isAuth = false): Promise<any> {
  const token = isAuth ? getAuthToken() : null;
  return request(buildUrl(path), {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json', ...authHeader(token) },
  });
}
