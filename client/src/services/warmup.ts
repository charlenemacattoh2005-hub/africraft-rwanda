/**
 * warmup.ts — Server warm-up service
 *
 * Pings GET /health on app load so the Render free-tier server
 * wakes up before the user tries to log in or browse products.
 *
 * State machine:
 *   'unknown'  — initial state, no ping has completed yet
 *   'starting' — at least one ping failed (cold start in progress)
 *                NOTE: state only changes to 'starting' after the
 *                SECOND failed ping (5s after load) so we don't flash
 *                the banner immediately on fast connections.
 *   'ready'    — server responded 200
 *   'failed'   — server did not respond after MAX_ATTEMPTS
 *
 * Usage:
 *   warmupServer()              — start polling (called once in main.tsx)
 *   getServerState()            — read current state
 *   onServerState(cb)           — subscribe to changes, returns unsub fn
 */
import { API_BASE_URL } from './api';

export type ServerState = 'unknown' | 'starting' | 'ready' | 'failed';

// ── Shared singleton state ────────────────────────────────────
let currentState: ServerState = 'unknown';
let started = false;
const subscribers: Array<(s: ServerState) => void> = [];

function setState(next: ServerState): void {
  if (next === currentState) return;
  currentState = next;
  // Notify all subscribers
  subscribers.forEach(fn => {
    try { fn(next); } catch { /* never crash warmup loop on subscriber error */ }
  });
}

export function getServerState(): ServerState {
  return currentState;
}

/**
 * Subscribe to server state changes.
 * Immediately called with the current state.
 * Returns an unsubscribe function for useEffect cleanup.
 */
export function onServerState(fn: (s: ServerState) => void): () => void {
  subscribers.push(fn);
  fn(currentState); // sync current state to new subscriber
  return () => {
    const i = subscribers.indexOf(fn);
    if (i !== -1) subscribers.splice(i, 1);
  };
}

/**
 * Start the warm-up poll loop.
 * Idempotent — safe to call multiple times.
 */
export function warmupServer(): void {
  if (started) return;
  started = true;

  const PING_TIMEOUT_MS = 8_000;  // 8s per ping
  const POLL_INTERVAL   = 5_000;  // 5s between pings
  const MAX_ATTEMPTS    = 24;     // 24 × 5s = 120s max wait time
  let   failedPings     = 0;

  function ping(): void {
    const controller = new AbortController();
    const timeout    = setTimeout(() => controller.abort(), PING_TIMEOUT_MS);

    fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      cache:  'no-store',
      signal: controller.signal,
    })
      .then(r => {
        clearTimeout(timeout);
        if (r.ok) {
          console.info('[warmup] Server ready ✓');
          setState('ready');
          // Stop polling — server is awake
        } else {
          // Server responded but with an error (shouldn't happen for /health)
          console.warn(`[warmup] /health returned ${r.status}`);
          onPingFail();
        }
      })
      .catch(err => {
        clearTimeout(timeout);
        console.info(`[warmup] Ping failed (${err?.name ?? 'NetworkError'}) — server may be starting`);
        onPingFail();
      });
  }

  function onPingFail(): void {
    failedPings++;

    if (failedPings >= MAX_ATTEMPTS) {
      console.warn('[warmup] Server did not respond after 120s — stopping poll');
      setState('failed');
      return;
    }

    // Only flip to 'starting' after the SECOND failed ping (~10s after load).
    // This avoids flashing the cold-start banner on fast servers that just
    // took a couple of hundred ms to respond to the very first request.
    if (failedPings >= 2 && currentState !== 'ready') {
      setState('starting');
    }

    setTimeout(ping, POLL_INTERVAL);
  }

  // Start first ping immediately
  ping();
}
