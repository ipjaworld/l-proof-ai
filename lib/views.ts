import { getCloudflareEnv } from "@/lib/cloudflare-env";

export type ViewCounts = { total: number; today: number };

function database() {
  const db = getCloudflareEnv().DB;
  if (!db) throw new Error("Cloudflare D1 binding `DB` is unavailable");
  return db;
}

export function todayInKst(now = new Date()) {
  return new Date(now.getTime() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

export async function getViewCounts(pageKey?: string, today = todayInKst()): Promise<ViewCounts> {
  const result = await database().prepare(
    `SELECT COALESCE(SUM(view_count), 0) AS total,
            COALESCE(SUM(CASE WHEN day_kst = ? THEN view_count ELSE 0 END), 0) AS today
     FROM page_view_daily WHERE page_key = ?`,
  ).bind(today, pageKey ?? "site:total").first<ViewCounts>();
  return { total: result?.total ?? 0, today: result?.today ?? 0 };
}

export async function recordView(pageKey: string) {
  const today = todayInKst();
  const increment =
    `INSERT INTO page_view_daily (page_key, day_kst, view_count) VALUES (?, ?, 1)
     ON CONFLICT(page_key, day_kst) DO UPDATE SET view_count = view_count + 1`;
  await database().batch([
    database().prepare(increment).bind("site:total", today),
    database().prepare(increment).bind(pageKey, today),
  ]);
  return getViewCounts(pageKey === "home" ? undefined : pageKey, today);
}
