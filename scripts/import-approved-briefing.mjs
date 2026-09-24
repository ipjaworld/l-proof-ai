import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync, unlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const rawInput = readFileSync(0, "utf8");
let input;
try { input = JSON.parse(rawInput); } catch { input = { text: rawInput }; }
if (typeof input.text !== "string" || !input.text.trim()) throw new Error("Approved text is required");

const subject = "에이전트가 오래 일할수록, 사람의 승인선이 제품이 된다";
const preview = "생성해야 할 때는 생성하게 하고, 판단해야 할 때는 판단하게 하고, 사람이 책임져야 할 순간에는 멈추게 하는 것.";
const editionNumber = 1;
const slug = "agent-approval-lines-become-the-product";
const proofLevel = 3;
const tags = ["agents", "human-in-the-loop", "product"];
const scheduledPublishAt = "2026-09-20T23:50:00.000Z";
const text = input.text.trim();
const escapeHtml = (value) => value.replace(/[&<>"']/g, (character) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
})[character]);
const paragraphs = text.split(/\n+/).map((line) => `<p style="margin:0 0 16px;line-height:1.8">${escapeHtml(line)}</p>`).join("");
const html = `<!doctype html><html lang="ko"><body style="margin:0;background:#f4f1ea;color:#172033;font-family:Arial,'Noto Sans KR',sans-serif"><main style="max-width:680px;margin:0 auto;padding:40px 24px"><p style="color:#b33a2b;font-weight:700;letter-spacing:.12em">L-PROOF-AI</p><h1 style="font-size:32px;line-height:1.25">${escapeHtml(subject)}</h1>${paragraphs}<hr style="border:0;border-top:1px solid #c9c1b5;margin:32px 0"><p style="font-size:12px;color:#667085">L-Proof-AI · 문의: this_is_laugh@naver.com</p></main></body></html>`;
const publicationIdentity = JSON.stringify({
  editionNumber, slug, previewText: preview, proofLevel, tags,
  heroImageUrl: null, scheduledPublishAt,
});
const hash = createHash("sha256").update(`${subject}\n${text}\n${html}\n${publicationIdentity}`).digest("hex");
const approvedAt = "2026-09-20T10:18:00.000Z";
const now = new Date().toISOString();
const sql = (value) => `'${String(value).replaceAll("'", "''")}'`;
const statement = `INSERT INTO briefing_editions (id,edition_number,slug,subject,preview_text,content_text,content_html,proof_level,tags,content_hash,status,publication_status,review_due_at,scheduled_publish_at,published_at,scheduled_send_at,approval_token_hash,approved_at,approved_content_hash,sent_at,created_at,updated_at) VALUES (${sql("2026-09-21-mon")},${editionNumber},${sql(slug)},${sql(subject)},${sql(preview)},${sql(text)},${sql(html)},${proofLevel},${sql(JSON.stringify(tags))},${sql(hash)},'sent','published','2026-09-20T21:00:00.000Z',${sql(scheduledPublishAt)},${sql(scheduledPublishAt)},'2026-09-21T00:00:00.000Z',${sql(hash)},${sql(approvedAt)},${sql(hash)},'2026-09-21T00:00:00.000Z',${sql(now)},${sql(now)}) ON CONFLICT(id) DO UPDATE SET edition_number=excluded.edition_number,slug=excluded.slug,subject=excluded.subject,preview_text=excluded.preview_text,content_text=excluded.content_text,content_html=excluded.content_html,proof_level=excluded.proof_level,tags=excluded.tags,content_hash=excluded.content_hash,status='sent',publication_status='published',review_due_at=excluded.review_due_at,scheduled_publish_at=excluded.scheduled_publish_at,published_at=excluded.published_at,scheduled_send_at=excluded.scheduled_send_at,approved_at=excluded.approved_at,approved_content_hash=excluded.approved_content_hash,sent_at=excluded.sent_at,held_at=NULL,publication_error=NULL,updated_at=excluded.updated_at;`;
const file = join(tmpdir(), `l-proof-approved-${process.pid}.sql`);
try {
  writeFileSync(file, statement, { encoding: "utf8", mode: 0o600 });
  const result = spawnSync(process.execPath, ["node_modules/wrangler/bin/wrangler.js", "d1", "execute", "DB", "--remote", "--file", file], { stdio: "inherit", shell: false });
  if (result.status !== 0) process.exit(result.status ?? 1);
  console.log(JSON.stringify({ edition: "2026-09-21-mon", status: "approved", contentHash: hash }));
} finally {
  try { unlinkSync(file); } catch {}
}
