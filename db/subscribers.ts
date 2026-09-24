import { getCloudflareEnv } from "@/lib/cloudflare-env";

export type Interest = "coding-agents" | "llm" | "agi";

export type SubscriptionInput = {
  email: string;
  name?: string;
  interests: Interest[];
  source: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
};

type UpsertResult = {
  id: string;
  status: string;
  created_at: string;
  notification_status: string;
  notification_last_attempt_at: string | null;
};

function database() {
  const env = getCloudflareEnv();
  if (!env.DB) throw new Error("D1 binding DB is unavailable");
  return env.DB;
}

export async function requestKey(request: Request, action: string) {
  const values = getCloudflareEnv();
  const ip = request.headers.get("cf-connecting-ip") ?? "non-cloudflare";
  const salt = values.RATE_LIMIT_SALT ?? "l-proof-ai-local-preview";
  const bytes = new TextEncoder().encode([salt, action, ip].join("|"));
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}

export async function consumeBudget(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const windowBoundary = now - windowMs;
  const result = await database()
    .prepare(
      `INSERT INTO request_limits ("key", "window_start", "count", "updated_at")
       VALUES (?, ?, 1, ?)
       ON CONFLICT("key") DO UPDATE SET
         "count" = CASE WHEN "window_start" < ? THEN 1 ELSE "count" + 1 END,
         "window_start" = CASE WHEN "window_start" < ? THEN ? ELSE "window_start" END,
         "updated_at" = ?
       WHERE "window_start" < ? OR "count" < ?
       RETURNING "count"`,
    )
    .bind(key, now, now, windowBoundary, windowBoundary, now, now, windowBoundary, limit)
    .first<{ count: number }>();

  return Boolean(result && result.count <= limit);
}

export async function hasBudget(key: string, limit: number, windowMs: number) {
  const boundary = Date.now() - windowMs;
  const result = await database()
    .prepare(`SELECT "count", "window_start" FROM request_limits WHERE "key" = ?`)
    .bind(key)
    .first<{ count: number; window_start: number }>();
  return !result || result.window_start < boundary || result.count < limit;
}

export async function enforceRateLimit(key: string, limit = 5, windowMs = 10 * 60_000) {
  if (!(await consumeBudget(key, limit, windowMs))) throw new Error("RATE_LIMITED");
}

export async function upsertSubscriber(input: SubscriptionInput) {
  const now = new Date().toISOString();
  const id = crypto.randomUUID();
  const result = await database()
    .prepare(
      `INSERT INTO subscribers (
        "id", "email", "normalized_email", "name", "interests", "status",
        "consent_version", "consented_at", "created_at", "source",
        "utm_source", "utm_medium", "utm_campaign", "notification_status", "last_applied_at"
      ) VALUES (?, ?, ?, ?, ?, 'pending', '2026-09-12', ?, ?, ?, ?, ?, ?, 'pending', ?)
      ON CONFLICT("normalized_email") DO UPDATE SET
        "email" = excluded."email",
        "name" = COALESCE(excluded."name", subscribers."name"),
        "interests" = excluded."interests",
        "consent_version" = excluded."consent_version",
        "consented_at" = excluded."consented_at",
        "status" = CASE WHEN subscribers."status" = 'unsubscribed' THEN 'pending' ELSE subscribers."status" END,
        "unsubscribed_at" = CASE WHEN subscribers."status" = 'unsubscribed' THEN NULL ELSE subscribers."unsubscribed_at" END,
        "source" = excluded."source",
        "utm_source" = COALESCE(excluded."utm_source", subscribers."utm_source"),
        "utm_medium" = COALESCE(excluded."utm_medium", subscribers."utm_medium"),
        "utm_campaign" = COALESCE(excluded."utm_campaign", subscribers."utm_campaign"),
        "last_applied_at" = excluded."last_applied_at"
      RETURNING "id", "status", "created_at", "notification_status", "notification_last_attempt_at"`,
    )
    .bind(
      id,
      input.email,
      input.email.toLowerCase(),
      input.name || null,
      JSON.stringify(input.interests),
      now,
      now,
      input.source,
      input.utmSource || null,
      input.utmMedium || null,
      input.utmCampaign || null,
      now,
    )
    .first<UpsertResult>();

  if (!result) throw new Error("SUBSCRIBER_WRITE_FAILED");
  return { ...result, isNew: result.id === id };
}

export async function setNotificationResult(
  id: string,
  status: "sent" | "not-configured" | "failed" | "deferred",
  error?: string,
  emailId?: string,
) {
  const now = new Date().toISOString();
  await database()
    .prepare(
      `UPDATE subscribers
       SET "notification_status" = ?, "notification_error" = ?,
           "notification_last_attempt_at" = ?, "notification_attempts" = "notification_attempts" + 1,
           "notification_email_id" = COALESCE(?, "notification_email_id"),
           "notification_delivery_status" = CASE WHEN ? IS NOT NULL THEN 'sent' ELSE "notification_delivery_status" END,
           "notification_event_updated_at" = CASE WHEN ? IS NOT NULL THEN ? ELSE "notification_event_updated_at" END
       WHERE "id" = ?`,
    )
    .bind(status, error?.slice(0, 300) ?? null, now, emailId ?? null, emailId ?? null, emailId ?? null, now, id)
    .run();
}

export function shouldNotifyOperator(subscriber: UpsertResult, now = Date.now()) {
  if (subscriber.notification_status === "sent") return false;
  if (!subscriber.notification_last_attempt_at) return true;
  const lastAttempt = Date.parse(subscriber.notification_last_attempt_at);
  return !Number.isFinite(lastAttempt) || now - lastAttempt >= 10 * 60_000;
}

export async function unsubscribeSubscriber(normalizedEmail: string) {
  const now = new Date().toISOString();
  const result = await database()
    .prepare(
      `UPDATE subscribers
       SET "status" = 'unsubscribed', "unsubscribed_at" = ?
       WHERE "normalized_email" = ? AND "status" != 'unsubscribed'
       RETURNING "id", "email", "name", "interests"`,
    )
    .bind(now, normalizedEmail)
    .first<{ id: string; email: string; name: string | null; interests: string }>();
  return result ?? null;
}

export async function cleanupOldRateLimits() {
  const cutoff = Date.now() - 24 * 60 * 60_000;
  await database()
    .prepare(`DELETE FROM request_limits WHERE "updated_at" < ?`)
    .bind(cutoff)
    .run();
}
