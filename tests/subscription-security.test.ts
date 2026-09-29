import assert from "node:assert/strict";
import test from "node:test";
import { DatabaseSync } from "node:sqlite";
import {
  createUnsubscribeToken,
  escapeHtml,
  verifyUnsubscribeToken,
} from "../lib/subscription-security.ts";
import { verifyTurnstile } from "../lib/turnstile.ts";

test("approval display values are HTML escaped", () => {
  assert.equal(escapeHtml(`<img src=x onerror="alert(1)">`), "&lt;img src=x onerror=&quot;alert(1)&quot;&gt;");
});

test("unsubscribe token is bound to the subscriber and normalized email", async () => {
  const token = await createUnsubscribeToken("test-secret", "subscriber-1", "reader@example.com");
  assert.equal(await verifyUnsubscribeToken("test-secret", "subscriber-1", "reader@example.com", token), true);
  assert.equal(await verifyUnsubscribeToken("test-secret", "subscriber-2", "reader@example.com", token), false);
  assert.equal(await verifyUnsubscribeToken("test-secret", "subscriber-1", "other@example.com", token), false);
  assert.equal(await verifyUnsubscribeToken("test-secret", "subscriber-1", "reader@example.com", `${token.slice(0, -1)}0`), false);
  assert.equal(await verifyUnsubscribeToken("", "subscriber-1", "reader@example.com", token), false);
});

test("Turnstile verification fails closed and checks action and hostname", async () => {
  const passingFetch = async () => new Response(JSON.stringify({
    success: true,
    action: "subscribe",
    hostname: "l-proof-ai.xyz",
  }));
  assert.deepEqual(await verifyTurnstile(undefined, "token", null, "l-proof-ai.xyz", passingFetch), {
    ok: false,
    reason: "not-configured",
  });
  assert.deepEqual(await verifyTurnstile("secret", "token", null, "l-proof-ai.xyz", passingFetch), { ok: true });
  assert.equal((await verifyTurnstile("secret", "token", null, "evil.example", passingFetch)).ok, false);
  assert.equal((await verifyTurnstile("secret", "token", null, "l-proof-ai.xyz", async () => {
    throw new Error("offline");
  })).ok, false);
});

test("atomic request budget allows only one cooldown claim", () => {
  const db = new DatabaseSync(":memory:");
  db.exec(`CREATE TABLE request_limits (
    key TEXT PRIMARY KEY NOT NULL,
    window_start INTEGER NOT NULL,
    count INTEGER DEFAULT 1 NOT NULL,
    updated_at INTEGER NOT NULL
  )`);
  const statement = db.prepare(`INSERT INTO request_limits (key, window_start, count, updated_at)
    VALUES (?, ?, 1, ?)
    ON CONFLICT(key) DO UPDATE SET
      count = CASE WHEN window_start < ? THEN 1 ELSE count + 1 END,
      window_start = CASE WHEN window_start < ? THEN ? ELSE window_start END,
      updated_at = ?
    WHERE window_start < ? OR count < ?
    RETURNING count`);
  const now = Date.now();
  const boundary = now - 600_000;
  const claims = Array.from({ length: 20 }, () =>
    statement.get("subscribe-email:test", now, now, boundary, boundary, now, now, boundary, 1));
  assert.equal(claims.filter(Boolean).length, 1);
});

test("unsubscribe transition is idempotent", () => {
  const db = new DatabaseSync(":memory:");
  db.exec(`CREATE TABLE subscribers (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL,
    name TEXT,
    interests TEXT NOT NULL,
    status TEXT NOT NULL,
    unsubscribed_at TEXT
  ); INSERT INTO subscribers VALUES ('subscriber-1', 'reader@example.com', NULL, '[]', 'approved', NULL)`);
  const statement = db.prepare(`UPDATE subscribers
    SET status = 'unsubscribed', unsubscribed_at = ?
    WHERE id = ? AND status != 'unsubscribed'
    RETURNING id`);
  assert.equal((statement.get("2026-09-29T00:00:00.000Z", "subscriber-1") as { id: string }).id, "subscriber-1");
  assert.equal(statement.get("2026-09-29T00:00:01.000Z", "subscriber-1"), undefined);
});
