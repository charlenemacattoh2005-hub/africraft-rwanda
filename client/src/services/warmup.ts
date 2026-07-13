/**
 * warmup.ts — Server warm-up service
 *
 * Pings the backend health endpoint on app startup so the Render
 * free-tier server wakes up before the user tries to interact.
 *
 * Features:
 * - Polls GET /health every 5s until the server responds 200
 * - Exposes shared server state: 'unknown' | 'starting' | 'ready'
 * - Components can subscribe to state changes via onServerState()
 * - Never blocks the UI — fully asynchronous
 */
import { API_BASE_URL } from './api';

export type ServerState = 'unknown' | 'starting' | 'ready';

// ── Shared state ──────────────────────────────────────────────
let currentState: ServerState           = 'unknown';
let started = false;
const subscribers: Array<(s: ServerState) => void> = [];

function setState(next: ServerState): void {
  if (next === currentState) return;
  currentState = next;
  subscribers.forEach(fn => fn(next));
}

/** Get the current known server state without subscribing */
export function getServerState(): ServerState {
  return currentState;
}

/**
 * Subscribe to server state changes.
 * Returns an unsubscribe function — call it in useEffect cleanup.
 *
 * @example
 * useEffect(() => onServerState(setState), []);
 */
export function onServerState(fn: (s: ServerState) => void): () => void {
  subscribers.push(fn);
  // Immediately call with current state so subscriber is in sync
  fn(currentState);
  return () => {
    const i = subscribers.indexOf(fn);
    if (i !== -1) subscribers.splice(i, 1);
  };
}

/**
 * Start the warm-up loop (idempotent — safe to call multiple times).
 * Called once in main.tsx on app load.
 */
export function warmupServer(): void {
  if (started) return;
  started = true;

  const POLL_INTERVAL = 5000;   // 5s between pings
  const MAX_ATTEMPTS  = 20;     // give up after 100s
  let   attempt       = 0;

  function ping(): void {
    if (attempt >= MAX_ATTEMPTS) {
      // After max attempts, leave state as 'starting' — don't show error,
      // but stop polling so we don't hammer the server forever
      console.warn('[warmup] Server did not respond after 100s — stopping poll');
      return;
    }

    attempt++;

    // Set to 'starting' on first failed attempt (not immediately on load)
    const controller = new AbortController();
    const timeout    = setTimeout(() => controller.abort(), 8000);

    fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      cache:  'no-store',
      signal: controller.signal,
    })
      .then(r => {
        clearTimeout(timeout);
        if (r.ok) {
          setState('ready');
          console.log('[warmup] Server ready ✓');
        } else {
          // Server is up but unhealthy — keep polling
          if (currentState !== 'ready') setState('starting');
          setTimeout(ping, POLL_INTERVAL);
        }
      })
      .catch(() => {
        clearTimeout(timeout);
        if (currentState !== 'ready') setState('starting');
        setTimeout(ping, POLL_INTERVAL);
      });
  }

  ping();
}
