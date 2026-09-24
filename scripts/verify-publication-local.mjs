import { createHash } from "node:crypto";
import { unlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import "./sites-env.mjs";

const baseUrl = process.env.LOCAL_SITE_URL || "http://127.0.0.1:8787";
const id = "local-publication-verification";
const slug = "local-publication-verification";
const subject = "예약 공개 검증용 아티클";
const previewText = "예약 공개 전에는 숨겨지고 Worker 실행 뒤 공개되는지 확인합니다.";
const contentText = "# 예약 공개 검증용 아티클\n\n이 글은 로컬 예약 공개 흐름을 검증하기 위한 데이터입니다.";
const contentHtml = "<!doctype html><html lang=\"ko\"><body><h1>예약 공개 검증용 아티클</h1><p>로컬 테스트입니다.</p></body></html>";
const scheduledPublishAt = new Date(Date.now() - 60_000).toISOString();
const scheduledSendAt = "2999-01-01T00:00:00.000Z";
const now = new Date().toISOString();
const identity = JSON.stringify({
  editionNumber: 9999,
  slug,
  previewText,
  proofLevel: 3,
  tags: ["local-test"],
  heroImageUrl: null,
  scheduledPublishAt,
});
const hash = createHash("sha256")
  .update(`${subject}\n${contentText}\n${contentHtml}\n${identity}`)
  .digest("hex");
const sql = (value) => `'${String(value).replaceAll("'", "''")}'`;
const insert = `INSERT INTO briefing_editions
  (id,edition_number,slug,subject,preview_text,content_text,content_html,proof_level,tags,
   content_hash,status,publication_status,review_due_at,scheduled_publish_at,scheduled_send_at,
   approval_token_hash,approved_at,approved_content_hash,created_at,updated_at)
 VALUES (${sql(id)},9999,${sql(slug)},${sql(subject)},${sql(previewText)},${sql(contentText)},${sql(contentHtml)},
   3,'["local-test"]',${sql(hash)},'approved','scheduled',${sql(now)},${sql(scheduledPublishAt)},
   ${sql(scheduledSendAt)},${sql(hash)},${sql(now)},${sql(hash)},${sql(now)},${sql(now)})
 ON CONFLICT(id) DO UPDATE SET publication_status='scheduled',published_at=NULL,publication_error=NULL,
   scheduled_publish_at=excluded.scheduled_publish_at,content_hash=excluded.content_hash,
   approved_content_hash=excluded.approved_content_hash,updated_at=excluded.updated_at;`;

function executeLocal(statement) {
  const file = join(tmpdir(), `l-proof-verify-${process.pid}-${crypto.randomUUID()}.sql`);
  try {
    writeFileSync(file, statement, { encoding: "utf8", mode: 0o600 });
    const result = spawnSync(process.execPath, [
      "node_modules/wrangler/bin/wrangler.js", "d1", "execute", "DB", "--local",
      "--config", "wrangler.jsonc", "--file", file,
    ], { cwd: process.cwd(), encoding: "utf8", shell: false });
    if (result.status !== 0) throw new Error(result.stderr || result.stdout || "Local D1 command failed");
  } finally {
    try { unlinkSync(file); } catch {}
  }
}

executeLocal(insert);
try {
  const before = await fetch(`${baseUrl}/articles/${slug}`);
  if (before.status !== 404) throw new Error(`Expected 404 before publication, received ${before.status}`);
  const trigger = await fetch(`${baseUrl}/cdn-cgi/local/scheduled`);
  if (!trigger.ok) throw new Error(`Scheduled trigger failed: ${trigger.status}`);
  const after = await fetch(`${baseUrl}/articles/${slug}`);
  if (!after.ok) throw new Error(`Expected published article, received ${after.status}`);
  const publicIndex = await fetch(`${baseUrl}/api/public/v1/articles?limit=50`).then((response) => response.json());
  if (!publicIndex.items?.some((article) => article.slug === slug)) {
    throw new Error("Published article is missing from the public index");
  }
  console.log(JSON.stringify({ ok: true, before: before.status, after: after.status, slug }));
} finally {
  executeLocal(`DELETE FROM briefing_editions WHERE id=${sql(id)};`);
}
