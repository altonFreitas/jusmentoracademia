import { getSupabaseServiceClient } from "@/lib/supabase";

/**
 * Best-effort extraction of the visitor's IP from standard proxy headers.
 * Vercel (and most reverse proxies) set x-forwarded-for as
 * "client, proxy1, proxy2..." — the first entry is the original client.
 */
export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const first = forwardedFor.split(",")[0]?.trim();
    if (first) return first;
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  return "unknown";
}

type RateLimitWindow = {
  /** Sliding window length, in minutes. */
  windowMinutes: number;
  /** Max allowed attempts within that window. */
  max: number;
};

type RateLimitResult =
  | { allowed: true }
  | { allowed: false; retryAfterSeconds: number };

/**
 * Checks (and, if allowed, records) an attempt against one or more
 * sliding-window limits, scoped by `scope` + IP — e.g. scope "register"
 * with a 3-per-10-minutes burst limit and a 10-per-day daily limit.
 *
 * Backed by Supabase (via the service role client) rather than in-memory
 * state, so the limit holds across every serverless instance, not just a
 * single warm process. Every *allowed* attempt is recorded; blocked
 * attempts are not re-recorded, so a bot hammering the endpoint while
 * blocked doesn't grow the table or push its own cooldown further out —
 * the retry time stays fixed to when the oldest counted attempt ages out.
 *
 * Fails open (allows the request) if the service role client isn't
 * configured or a lookup fails, since a mis-set env var should never be
 * the reason a legitimate visitor's form submission is silently blocked —
 * it's logged instead, as a configuration problem to fix.
 */
export async function checkRateLimit(
  scope: string,
  ip: string,
  windows: RateLimitWindow[],
): Promise<RateLimitResult> {
  const service = getSupabaseServiceClient();
  if (!service) {
    console.warn(
      `Rate limiting for "${scope}" skipped — SUPABASE_SERVICE_ROLE_KEY is not configured.`,
    );
    return { allowed: true };
  }

  const now = Date.now();
  const widestWindowMinutes = Math.max(...windows.map((w) => w.windowMinutes));
  const sinceWidest = new Date(now - widestWindowMinutes * 60_000).toISOString();

  const { data: rows, error } = await service
    .from("rate_limit_attempts")
    .select("created_at")
    .eq("scope", scope)
    .eq("ip", ip)
    .gte("created_at", sinceWidest);

  if (error) {
    console.error(`Rate limit lookup failed for scope "${scope}":`, error);
    return { allowed: true };
  }

  const timestamps = (rows ?? []).map((row: { created_at: string }) =>
    new Date(row.created_at).getTime(),
  );

  for (const window of windows) {
    const cutoff = now - window.windowMinutes * 60_000;
    const inWindow = timestamps.filter((t: number) => t >= cutoff);

    if (inWindow.length >= window.max) {
      const oldestInWindow = Math.min(...inWindow);
      const retryAfterSeconds = Math.max(
        1,
        Math.ceil((oldestInWindow + window.windowMinutes * 60_000 - now) / 1000),
      );
      return { allowed: false, retryAfterSeconds };
    }
  }

  const { error: insertError } = await service
    .from("rate_limit_attempts")
    .insert({ scope, ip });

  if (insertError) {
    // Recording failed, but the attempt itself is still allowed through —
    // fail open rather than block a real visitor over a logging hiccup.
    console.error(`Rate limit recording failed for scope "${scope}":`, insertError);
  }

  // Best-effort housekeeping so the table doesn't grow forever. Cheap
  // (indexed by created_at) and only needs to run occasionally, not on
  // every single request.
  if (Math.random() < 0.1) {
    const pruneBefore = new Date(now - 2 * 24 * 60 * 60 * 1000).toISOString();
    void service.from("rate_limit_attempts").delete().lt("created_at", pruneBefore);
  }

  return { allowed: true };
}
