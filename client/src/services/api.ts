/**
 * api.ts — Centralized API client
 *
 * Features:
 * - Single source of truth for the backend URL (VITE_API_URL env var)
 * - 30-second AbortController timeout per request
 * - Automatic retry: up to 3 attempts with 5-second delay between each
 * - Smart error messages:
 *     • Browser offline  → "You appear to be offline. Check your connection."
 *     • Network failure  → "Server is starting up. Please wait 20–60 seconds…"
 *     • Timeout          → "Request timed out. The server may be waking up…"
 *     • HTTP 4xx / 5xx   → actual server message + HTTP status
 * - Never says "Check your internet connection" when the server is the issue
 */

// ─────────────────────────────────────────────────────────────
// Base URL — reads VITE_API_URL at Vite build time.
// Local dev: http://localhost:5000 (Vite proxy also handles /api/*)
// Production (Vercel): https://dellcraft-api.onrender.com
// ─────────────────────────────────────────────────────────────
export const API_BASE_URL: string =
  (import.meta.env.VITE_API_URL as string) || 'http://localhost:5000';

const AUTH_TOKEN_KEY  = 'africraft_auth_token';
const TIMEOUT_MS      = 30_000;   // 30 s per attempt
const MAX_RETRIES     = 3;        // total attempts = 1 + 3 retries
const RETRY_DELAY_MS  = 5_000;    // 5 s between retries

// ── HTTP status messages ──────────────────────────────────────
const HTTP_MESSAGES: Record<number, string> = {
  400: 'Bad request — please check your input.',
  401: 'You are not signed in, or your session has expired.',
  403: 'You do not have permission to perform this action.',
  404: 'The requested resource was not found.',
  409: 'A conflict occurred — the record may already exist.',
  422: 'The server could not process your request.',
  429: 'Too many requests — please slow down.',
  500: 'An internal server error occurred. Please try again.',
  502: 'Server is temporarily unavailable. Please try again shortly.',
  503: 'Service unavailable — the server may be starting up.',
  504: 'The server took too long to respond. Please try again.',
};

// ── Auth token helpers ────────────────────────────────────────
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

// ── URL builder ───────────────────────────────────────────────
function buildUrl(path: string): string {
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

// ── Auth headers helper ───────────────────────────────────────
function authHeader(token: string | null): Record<string, string> {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ── Parse response body safely ────────────────────────────────
async function parseBody(res: Response): Promise<any> {
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) {
    try { return await res.json(); } catch { return null; }
  }
  const text = await res.text();
  try { return text ? JSON.parse(text) : null; } catch { return text || null; }
}

// ── Build human-readable error from HTTP response ─────────────
function buildHttpError(res: Response, data: any): Error {
  const serverMsg  = data?.message || data?.error || null;
  const statusMsg  = HTTP_MESSAGES[res.status] || null;
  const endpoint   = res.url ? new URL(res.url).pathname : '';

  // Prefer server message, then status lookup, then generic fallback
  const message = serverMsg || statusMsg || `HTTP ${res.status} — ${endpoint}`;

  const err: any = new Error(message);
  err.status  = res.status;
  err.data    = data;
  err.url     = res.url;
  err.isHttp  = true;
  return err;
}

// ── Build human-readable error from network failure ───────────
function buildNetworkError(cause: Error, attempt: number): Error {
  // Only blame the user's connection if the browser itself reports offline
  if (!navigator.onLine) {
    const err: any = new Error(
      'You appear to be offline. Check your connection and try again.'
    );
    err.isOffline = true;
    return err;
  }

  // Timeout
  if (cause.name === 'AbortError') {
    const err: any = new Error(
      `Request timed out after ${TIMEOUT_MS / 1000}s. ` +
      `The server may be waking up — please try again in a moment.`
    );
    err.isTimeout = true;
    return err;
  }

  // Network error (server cold-starting, DNS, CORS preflight failure, etc.)
  // Show progressively more informative messages with each retry
  const messages: Record<number, string> = {
    1: 'Server is starting up. Please wait 20–60 seconds and try again.',
    2: 'Still waiting for the server to wake up…',
    3: 'The server is taking longer than usual to respond. Please try again shortly.',
  };

  const err: any = new Error(messages[attempt] || messages[3]);
  err.isNetwork = true;
  err.attempt   = attempt;
  return err;
}

// ── Sleep helper ──────────────────────────────────────────────
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ── Core request with timeout + retry ────────────────────────
async function request(url: string, options: RequestInit): Promise<any> {
  let lastError: Error = new Error('Unknown error');

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    const controller = new AbortController();
    const timer      = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const res = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(timer);

      const data = await parseBody(res);

      if (!res.ok) {
        const err = buildHttpError(res, data);
        // Do NOT retry 4xx errors — they are definitive (wrong credentials, etc.)
        if (res.status >= 400 && res.status < 500) throw err;
        // Retry 5xx server errors
        lastError = err;
      } else {
        return data; // ✓ success
      }
    } catch (err: any) {
      clearTimeout(timer);
      // Re-throw non-network errors immediately (HTTP 4xx already thrown above)
      if (err.isHttp && err.status >= 400 && err.status < 500) throw err;

      lastError = buildNetworkError(err, attempt);
    }

    // Wait before retrying (except on the last attempt)
    if (attempt < MAX_RETRIES) {
      await sleep(RETRY_DELAY_MS);
    }
  }

  throw lastError;
}

// ── Public API helpers ────────────────────────────────────────
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
