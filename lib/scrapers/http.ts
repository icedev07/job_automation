// Shared fetch helper for feed scanners.
//
// Feeds must DEGRADE GRACEFULLY rather than throw on transient HTTP problems —
// rate limits (Arbeitnow caps at 5 req/min, HN Algolia throttles), Cloudflare /
// anti-bot challenges (some boards 403 a datacenter IP like Vercel while
// serving a residential IP fine), or a network blip. A thrown error surfaces in
// the admin UI as a red "Error:" and can abort a "Scrape all sources" run; a
// returned warning shows as "0 found · <reason>" and lets every other source
// keep going.

export type FeedHttpResult =
  | { ok: true; res: Response; body: string }
  | { ok: false; warning: string };

// Cloudflare / generic anti-bot interstitials served with a 200 or 403.
const CHALLENGE_RE = /Just a moment|cf-browser-verification|Attention Required|cf-chl-|__cf_chl|enable JavaScript and cookies/i;

export async function feedHttpGet(
  label: string,
  url: string,
  init: RequestInit,
): Promise<FeedHttpResult> {
  let res: Response;
  try {
    res = await fetch(url, init);
  } catch (e) {
    const msg = (e as Error).message || String(e);
    if (/abort/i.test(msg)) return { ok: false, warning: `${label} timed out (scan budget reached)` };
    return { ok: false, warning: `${label} fetch failed: ${msg.slice(0, 120)}` };
  }

  const body = await res.text().catch(() => "");

  if (!res.ok) {
    const blocked = res.status === 403 || res.status === 503;
    const limited = res.status === 429;
    const hint = limited
      ? " (rate-limited — try again shortly)"
      : blocked
        ? " (likely Cloudflare/anti-bot blocking this server's IP)"
        : "";
    return { ok: false, warning: `${label} responded ${res.status}${hint}` };
  }

  if (CHALLENGE_RE.test(body.slice(0, 4000))) {
    return {
      ok: false,
      warning: `${label} returned an anti-bot challenge page (blocked from this server's IP)`,
    };
  }

  return { ok: true, res, body };
}

// Parse JSON from an already-fetched body, returning a warning result instead
// of throwing when a 200 response is unexpectedly not JSON (some CDNs serve an
// HTML error/maintenance page with a 200).
export function parseJsonOrWarn<T>(label: string, body: string): { ok: true; data: T } | { ok: false; warning: string } {
  try {
    return { ok: true, data: JSON.parse(body) as T };
  } catch {
    return { ok: false, warning: `${label} returned a non-JSON response` };
  }
}
