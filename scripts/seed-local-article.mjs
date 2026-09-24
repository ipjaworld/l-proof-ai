import { createHash } from "node:crypto";
import { readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { isAbsolute, join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import "./sites-env.mjs";

const sourceArg = process.argv[2] ?? "content/drafts/2026-09-21.md";
const sourcePath = isAbsolute(sourceArg) ? sourceArg : resolve(sourceArg);
const raw = readFileSync(sourcePath, "utf8").replace(/^\uFEFF/, "");
const withoutFrontmatter = raw.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, "");
const publicText = withoutFrontmatter.split(/\r?\n## 편집자 메모/)[0].trim();
const subject = "에이전트가 오래 일할수록, 사람의 승인선이 제품이 된다";
const previewText = "더 오래 일하는 에이전트가 늘어날수록, 자동화의 범위보다 사람의 승인선을 먼저 설계해야 합니다.";
const editionNumber = 1;
const slug = "agent-approval-lines-become-the-product";
const proofLevel = 3;
const tags = ["agents", "human-in-the-loop", "product"];
const now = new Date().toISOString();

const escapeHtml = (value) => value.replace(/[&<>"']/g, (character) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
})[character]);
const contentHtml = `<!doctype html><html lang="ko"><body><main><h1>${escapeHtml(subject)}</h1>${publicText
  .split(/\r?\n\r?\n/)
  .map((block) => `<p>${escapeHtml(block).replace(/\r?\n/g, "<br>")}</p>`)
  .join("")}</main></body></html>`;
const publicationIdentity = JSON.stringify({
  editionNumber, slug, previewText, proofLevel, tags,
  heroImageUrl: null, scheduledPublishAt: now,
});
const hash = createHash("sha256")
  .update(`${subject}\n${publicText}\n${contentHtml}\n${publicationIdentity}`)
  .digest("hex");
const sql = (value) => `'${String(value).replaceAll("'", "''")}'`;
const statement = `INSERT INTO briefing_editions
  (id,edition_number,slug,subject,preview_text,content_text,content_html,proof_level,tags,
   content_hash,status,publication_status,review_due_at,scheduled_publish_at,published_at,
   scheduled_send_at,approval_token_hash,approved_at,approved_content_hash,created_at,updated_at)
 VALUES
  ('local-issue-01',${editionNumber},${sql(slug)},${sql(subject)},${sql(previewText)},${sql(publicText)},
   ${sql(contentHtml)},${proofLevel},${sql(JSON.stringify(tags))},${sql(hash)},'approved','published',
   ${sql(now)},${sql(now)},${sql(now)},'2999-01-01T00:00:00.000Z',${sql(hash)},${sql(now)},${sql(hash)},${sql(now)},${sql(now)})
 ON CONFLICT(id) DO UPDATE SET
   edition_number=excluded.edition_number,slug=excluded.slug,subject=excluded.subject,
   preview_text=excluded.preview_text,content_text=excluded.content_text,content_html=excluded.content_html,
   proof_level=excluded.proof_level,tags=excluded.tags,content_hash=excluded.content_hash,
   status='approved',publication_status='published',published_at=excluded.published_at,
   scheduled_send_at=excluded.scheduled_send_at,approved_at=excluded.approved_at,
   approved_content_hash=excluded.approved_content_hash,updated_at=excluded.updated_at;`;

const sqlPath = join(tmpdir(), `l-proof-local-article-${process.pid}.sql`);
try {
  writeFileSync(sqlPath, statement, { encoding: "utf8", mode: 0o600 });
  const result = spawnSync(process.execPath, [
    "node_modules/wrangler/bin/wrangler.js", "d1", "execute", "DB", "--local",
    "--config", "wrangler.jsonc", "--file", sqlPath,
  ], { cwd: process.cwd(), stdio: "inherit", shell: false });
  if (result.status !== 0) process.exit(result.status ?? 1);
  console.log(JSON.stringify({ ok: true, url: `/articles/${slug}` }));
} finally {
  try { unlinkSync(sqlPath); } catch {}
}
