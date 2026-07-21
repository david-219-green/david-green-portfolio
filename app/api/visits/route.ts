// Live visitor counter backed by Upstash Redis (Vercel marketplace
// integration — env vars are auto-injected on deploy). When storage isn't
// configured, both handlers return { count: null } and the client keeps its
// static fallback number, so this route can never break the page.
const SEED = 105; // display starts at 106 for the first real visitor

export const dynamic = "force-dynamic";

async function redis(cmd: string): Promise<number | null> {
  const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
  const token =
    process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  try {
    const r = await fetch(`${url}/${cmd}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!r.ok) return null;
    const { result } = (await r.json()) as { result: number | string | null };
    return Number(result ?? 0);
  } catch {
    return null;
  }
}

export async function GET() {
  const n = await redis("get/portfolio:visits");
  return Response.json({ count: n === null ? null : SEED + n });
}

export async function POST() {
  const n = await redis("incr/portfolio:visits");
  return Response.json({ count: n === null ? null : SEED + n });
}
