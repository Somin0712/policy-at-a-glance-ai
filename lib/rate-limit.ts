type Entry = { count: number; resetAt: number };

const globalStore = globalThis as typeof globalThis & { __policyRateLimit?: Map<string, Entry> };
const store = globalStore.__policyRateLimit ?? new Map<string, Entry>();
globalStore.__policyRateLimit = store;

export function checkRateLimit(key: string, limit = 20, windowMs = 60_000) {
  const now = Date.now();
  const current = store.get(key);
  if (!current || current.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1 };
  }
  if (current.count >= limit) return { ok: false, remaining: 0, retryAfterMs: current.resetAt - now };
  current.count += 1;
  return { ok: true, remaining: limit - current.count };
}

export function requestKey(req: Request, scope: string) {
  const forwarded = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const realIp = req.headers.get("x-real-ip")?.trim();
  return `${scope}:${forwarded || realIp || "unknown"}`;
}
