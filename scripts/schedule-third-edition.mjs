import { createHash, randomBytes } from "node:crypto";
import { readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import process from "node:process";
import "./sites-env.mjs";

const editionId = "2026-09-28-mon";
const editionNumber = 3;
const slug = "agent-competition-beyond-benchmarks";
const previewText = "모델 가격이 내려갈수록 경쟁력은 프롬프트 인프라, 검증, 권한과 관측 구조에서 갈립니다.";
const proofLevel = 3;
const tags = ["agents", "infrastructure", "models", "governance"];
const scheduledPublishAt = "2026-09-27T23:50:00.000Z";
const scheduledSendAt = "2026-09-28T00:00:00.000Z";

const sourcePath = resolve("content/drafts/2026-09-28.md");
const source = readFileSync(sourcePath, "utf8").replace(/^\uFEFF/, "");
const withoutFrontmatter = source.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, "").trim();
const contentText = withoutFrontmatter.replace(/\r?\n## 편집자 메모 — 검토가 필요한 부분[\s\S]*$/, "").trim();
const titleMatch = contentText.match(/^#\s+(.+)$/m);
if (!titleMatch) throw new Error("원고의 첫 번째 H1 제목을 찾지 못했습니다.");
const subject = titleMatch[1].trim();

const escapeHtml = (value) => value.replace(/[&<>"']/g, (character) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
})[character]);

function inlineMarkdown(value) {
  let rendered = escapeHtml(value);
  rendered = rendered.replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '<a href="$2" style="color:#b33a2b">$1</a>');
  rendered = rendered.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  rendered = rendered.replace(/`([^`]+)`/g, '<code style="background:#eee9df;padding:2px 5px;border-radius:3px">$1</code>');
  return rendered;
}

function renderMarkdown(markdown) {
  const lines = markdown.split(/\r?\n/);
  const blocks = [];
  let paragraph = [];
  let list = [];
  const flushParagraph = () => {
    if (paragraph.length > 0) {
      blocks.push(`<p style="margin:0 0 18px;line-height:1.85">${inlineMarkdown(paragraph.join(" "))}</p>`);
      paragraph = [];
    }
  };
  const flushList = () => {
    if (list.length > 0) {
      blocks.push(`<ul style="margin:0 0 22px;padding-left:24px;line-height:1.8">${list.map((item) => `<li style="margin:0 0 8px">${inlineMarkdown(item)}</li>`).join("")}</ul>`);
      list = [];
    }
  };
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      flushParagraph();
      flushList();
      continue;
    }
    if (trimmed.startsWith("# ")) continue;
    if (/^---+$/.test(trimmed)) {
      flushParagraph();
      flushList();
      blocks.push('<hr style="border:0;border-top:1px solid #c9c1b5;margin:34px 0">');
      continue;
    }
    const heading = trimmed.match(/^(##|###)\s+(.+)$/);
    if (heading) {
      flushParagraph();
      flushList();
      const tag = heading[1] === "##" ? "h2" : "h3";
      const style = tag === "h2"
        ? "margin:38px 0 16px;font-size:24px;line-height:1.4"
        : "margin:28px 0 12px;font-size:18px;line-height:1.5";
      blocks.push(`<${tag} style="${style}">${inlineMarkdown(heading[2])}</${tag}>`);
      continue;
    }
    const item = trimmed.match(/^[-*]\s+(.+)$/);
    if (item) {
      flushParagraph();
      list.push(item[1]);
      continue;
    }
    flushList();
    paragraph.push(trimmed);
  }
  flushParagraph();
  flushList();
  return blocks.join("\n");
}

const articleHtml = renderMarkdown(contentText);
const contentHtml = `<!doctype html><html lang="ko"><body style="margin:0;background:#f4f1ea;color:#172033;font-family:Arial,'Noto Sans KR',sans-serif"><main style="max-width:700px;margin:0 auto;padding:40px 24px"><p style="color:#b33a2b;font-weight:700;letter-spacing:.12em">L-PROOF-AI · ISSUE 03</p><h1 style="font-size:32px;line-height:1.3;margin:0 0 18px">${escapeHtml(subject)}</h1>${articleHtml}<hr style="border:0;border-top:1px solid #c9c1b5;margin:34px 0"><p style="font-size:12px;color:#667085;line-height:1.7">L-Proof-AI · 문의: this_is_laugh@naver.com</p></main></body></html>`;
const publicationIdentity = JSON.stringify({
  editionNumber,
  slug,
  previewText,
  proofLevel,
  tags,
  heroImageUrl: null,
  scheduledPublishAt,
});
const contentHash = createHash("sha256")
  .update(`${subject}\n${contentText}\n${contentHtml}\n${publicationIdentity}`)
  .digest("hex");
const approvalTokenHash = createHash("sha256").update(randomBytes(32)).digest("hex");
const approvedAt = new Date().toISOString();
const reviewDueAt = approvedAt;
const sql = (value) => `'${String(value).replaceAll("'", "''")}'`;
const statement = `INSERT INTO briefing_editions (
  id, edition_number, slug, subject, preview_text, content_text, content_html,
  proof_level, tags, hero_image_url, content_hash, status, publication_status,
  review_due_at, scheduled_publish_at, published_at, scheduled_send_at,
  approval_token_hash, approved_at, approved_content_hash, held_at,
  publication_error, created_at, updated_at
) VALUES (
  ${sql(editionId)}, ${editionNumber}, ${sql(slug)}, ${sql(subject)}, ${sql(previewText)},
  ${sql(contentText)}, ${sql(contentHtml)}, ${proofLevel}, ${sql(JSON.stringify(tags))}, NULL,
  ${sql(contentHash)}, 'approved', 'scheduled', ${sql(reviewDueAt)}, ${sql(scheduledPublishAt)}, NULL,
  ${sql(scheduledSendAt)}, ${sql(approvalTokenHash)}, ${sql(approvedAt)}, ${sql(contentHash)}, NULL,
  NULL, ${sql(approvedAt)}, ${sql(approvedAt)}
)
ON CONFLICT(id) DO UPDATE SET
  edition_number=excluded.edition_number,
  slug=excluded.slug,
  subject=excluded.subject,
  preview_text=excluded.preview_text,
  content_text=excluded.content_text,
  content_html=excluded.content_html,
  proof_level=excluded.proof_level,
  tags=excluded.tags,
  hero_image_url=excluded.hero_image_url,
  content_hash=excluded.content_hash,
  status='approved',
  publication_status='scheduled',
  publication_error=NULL,
  review_due_at=excluded.review_due_at,
  scheduled_publish_at=excluded.scheduled_publish_at,
  published_at=NULL,
  scheduled_send_at=excluded.scheduled_send_at,
  approval_token_hash=excluded.approval_token_hash,
  approved_at=excluded.approved_at,
  approved_content_hash=excluded.approved_content_hash,
  held_at=NULL,
  updated_at=excluded.updated_at
WHERE briefing_editions.sent_at IS NULL;`;

if (process.argv.includes("--print-sql")) {
  process.stdout.write(statement);
  process.exit(0);
}

const sqlPath = join(tmpdir(), `l-proof-issue-03-${process.pid}.sql`);
try {
  writeFileSync(sqlPath, statement, { encoding: "utf8", mode: 0o600 });
  const wrangler = spawnSync(
    process.execPath,
    ["node_modules/wrangler/bin/wrangler.js", "d1", "execute", "DB", "--remote", "--config", "wrangler.jsonc", "--file", sqlPath],
    { cwd: process.cwd(), encoding: "utf8" },
  );
  if (wrangler.status !== 0) throw new Error(wrangler.stderr || wrangler.stdout || "D1 갱신 실패");
  console.log(JSON.stringify({
    edition: editionId,
    subject,
    slug,
    contentHash,
    status: "approved",
    publicationStatus: "scheduled",
    scheduledPublishAt,
    scheduledSendAt,
  }));
} finally {
  try { unlinkSync(sqlPath); } catch {}
}
