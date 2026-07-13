// ─────────────────────────────────────────────────────────────
// API base URL
// In production (Vercel), VITE_API_URL is set via .env.production
// AND via Vercel Environment Variables dashboard.
// In development, the Vite proxy forwards /api/* to localhost:5000.
// ─────────────────────────────────────────────────────────────
const API_BASE_URL: string =
  (import.meta.env.VITE_API_URL as string) || 'http://localhost:5000';

const AUTH_TOKEN_KEY = 'africraft_auth_token';

// ── Token helpers ─────────────────────────────────────────────
export function setAuthToken(token: string | null) {
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

// ── URL builder ───────────────────────────────────────────────
function buildUrl(path: string): string {
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${p}`;
}

// ── Response handler — surfaces real server errors ────────────
async function handleResponse(res: Response) {
  const contentType = res.headers.get('content-type') || '';
  let data: any = null;

  if (contentType.includes('application/json')) {
    try { data = await res.json(); } catch { data = null; }
  } else {
    const text = await res.text();
    try { data = text ? JSON.parse(text) : null; } catch { data = text || null; }
  }

  if (!res.ok) {
    // Build a human-readable error message that surfaces the real problem
    const serverMsg = data?.message || data?.error || null;
    const httpStatus = `HTTP ${res.status} ${res.statusText}`;
    const url = res.url ? ` [${new URL(res.url).pathname}]` : '';

    const message = serverMsg
      ? `${serverMsg} (${httpStatus}${url})`
      : `${httpStatus}${url} — check that the server is running`;

    const err: any = new Error(message);
    err.status = res.status;
    err.data   = data;
    err.url    = res.url;
    throw err;
  }

  return data;
}

// ── Fetch with timeout + better "failed to fetch" message ─────
async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs = 30000
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    return res;
  } catch (err: any) {
    if (err.name === 'AbortError') {
      throw new Error(
        `Request timed out after ${timeoutMs / 1000}s — the server may be starting up (cold start). Please try again in a moment.`
      );
    }
    // "Failed to fetch" — give a more useful message
    if (err.message === 'Failed to fetch' || err.message?.includes('NetworkError')) {
      throw new Error(
        `Cannot reach the server at ${API_BASE_URL}. ` +
        `Check your internet connection or the server may be offline.`
      );
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

// ── Public API helpers ────────────────────────────────────────
export async function apiGet(path: string) {
  const res = await fetchWithTimeout(buildUrl(path), {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  return handleResponse(res);
}

export async function apiGetAuth(path: string) {
  const token = getAuthToken();
  const res = await fetchWithTimeout(buildUrl(path), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  return handleResponse(res);
}

export async function apiPost(path: string, body: any, isAuth = false) {
  const token = isAuth ? getAuthToken() : null;
  const res = await fetchWithTimeout(buildUrl(path), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body ?? {}),
  });
  return handleResponse(res);
}

export async function apiPut(path: string, body: any, isAuth = false) {
  const token = isAuth ? getAuthToken() : null;
  const res = await fetchWithTimeout(buildUrl(path), {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body ?? {}),
  });
  return handleResponse(res);
}

export async function apiDelete(path: string, isAuth = false) {
  const token = isAuth ? getAuthToken() : null;
  const res = await fetchWithTimeout(buildUrl(path), {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  return handleResponse(res);
}

export function getAuthPayload() {
  const token = getAuthToken();
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  try {
    const payload = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(payload);
  } catch {
    return null;
  }
}
