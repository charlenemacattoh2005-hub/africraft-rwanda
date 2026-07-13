/**
 * warmup.ts
 * Pings the Render backend on app startup so the free-tier server
 * wakes up before the user tries to log in or load products.
 * The ping is fire-and-forget — it never blocks the UI.
 */
const API_BASE = (import.meta.env.VITE_API_URL as string) || 'http://localhost:5000';

let warmedUp = false;

export function warmupServer(): void {
  if (warmedUp) return;
  warmedUp = true;

  // Retry up to 5 times with exponential back-off while the server cold-starts
  const ping = (attempt = 1): void => {
    if (attempt > 5) return;

    fetch(`${API_BASE}/health`, { method: 'GET', cache: 'no-store' })
      .then(r => {
        if (r.ok) {
          console.log('[warmup] Server is ready ✓');
        } else {
          // Non-2xx — server is up but something is wrong, don't retry
          console.warn(`[warmup] Server returned ${r.status}`);
        }
      })
      .catch(() => {
        // Server still sleeping — retry after delay
        const delay = Math.min(3000 * attempt, 15000);
        console.log(`[warmup] Server waking up… retrying in ${delay / 1000}s (attempt ${attempt})`);
        setTimeout(() => ping(attempt + 1), delay);
      });
  };

  ping();
}
