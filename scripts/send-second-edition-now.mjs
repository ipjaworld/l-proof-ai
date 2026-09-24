import { createHash, randomBytes } from "node:crypto";
import { readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { isAbsolute, join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import process from "node:process";
import "./sites-env.mjs";

const sourceArg = process.argv[2];
if (!sourceArg) throw new Error("첨부 원고 경로가 필요합니다.");
const sendEmail = process.argv.includes("--send-email");
const sourcePath = isAbsolute(sourceArg) ? sourceArg : resolve(sourceArg);
const raw = readFileSync(sourcePath, "utf8").replace(/^\uFEFF/, "").trim();
const titleMatch = raw.match(/^#\s+(.+)$/m);
if (!titleMatch) throw new Error("원고의 첫 번째 H1 제목을 찾지 못했습니다.");

const editionId = "2026-09-24-thu";
const editionNumber = 2;
const slug = "personal-agent-product-structure";
const subject = titleMatch[1].trim();
const articleUrl = `https://l-proof-ai.xyz/articles/${slug}`;
const webNotice = `이메일로 보기 불편하신 분은 [여기에서 확인해주세요](${articleUrl}).`;
const titleLineEnd = raw.indexOf("\n", titleMatch.index);
const contentText = `${raw.slice(0, titleLineEnd).trimEnd()}\n\n${webNotice}\n\n${raw.slice(titleLineEnd).trimStart()}`;
const previewText = "모델보다 중요한 것은 에이전트의 권한, 실행 환경, 지속 상태와 사람의 승인선입니다.";

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
      const style = tag === "h2" ? "margin:38px 0 16px;font-size:24px;line-height:1.4" : "margin:28px 0 12px;font-size:18px;line-height:1.5";
      blocks.push(`<${tag} style="${style}">${inlineMarkdown(heading[2])}</${tag}>`);
      continue;
    }
    const item = trimmed.match(/^\*\s+(.+)$/);
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

const articleHtml = renderMarkdown(raw);
const contentHtml = `<!doctype html><html lang="ko"><body style="margin:0;background:#f4f1ea;color:#172033;font-family:Arial,'Noto Sans KR',sans-serif"><main style="max-width:700px;margin:0 auto;padding:40px 24px"><p style="color:#b33a2b;font-weight:700;letter-spacing:.12em">L-PROOF-AI · ISSUE 02</p><h1 style="font-size:32px;line-height:1.3;margin:0 0 18px">${escapeHtml(subject)}</h1><p style="margin:0 0 30px;padding:16px;background:#fff;border-top:3px solid #b33a2b;line-height:1.7">이메일로 보기 불편하신 분은 <a href="${articleUrl}" style="color:#b33a2b;font-weight:700">여기에서 확인해주세요</a>.</p>${articleHtml}<hr style="border:0;border-top:1px solid #c9c1b5;margin:34px 0"><p style="font-size:12px;color:#667085;line-height:1.7">L-Proof-AI · 문의: this_is_laugh@naver.com</p></main></body></html>`;
const proofLevel = 3;
const tags = ["agents", "product", "architecture"];
const token = randomBytes(32).toString("hex");
const tokenHash = createHash("sha256").update(token).digest("hex");
const now = new Date().toISOString();
const scheduledSendAt = sendEmail ? now : "2999-01-01T00:00:00.000Z";
const publicationIdentity = JSON.stringify({
  editionNumber, slug, previewText, proofLevel, tags,
  heroImageUrl: null, scheduledPublishAt: now,
});
const contentHash = createHash("sha256").update(`${subject}\n${contentText}\n${contentHtml}\n${publicationIdentity}`).digest("hex");
const sql = (value) => `'${String(value).replaceAll("'", "''")}'`;
const statement = `INSERT INTO briefing_editions (
  id, edition_number, slug, subject, preview_text, content_text, content_html,
  proof_level, tags, hero_image_url, content_hash, status, publication_status,
  review_due_at, scheduled_publish_at, published_at, scheduled_send_at,
  approval_token_hash, approved_at, approved_content_hash, created_at, updated_at
) VALUES (
  ${sql(editionId)}, ${editionNumber}, ${sql(slug)}, ${sql(subject)}, ${sql(previewText)},
  ${sql(contentText)}, ${sql(contentHtml)}, ${proofLevel}, ${sql(JSON.stringify(tags))}, NULL,
  ${sql(contentHash)}, 'approved', 'published', ${sql(now)}, ${sql(now)}, ${sql(now)},
  ${sql(scheduledSendAt)}, ${sql(tokenHash)}, ${sql(now)}, ${sql(contentHash)}, ${sql(now)}, ${sql(now)}
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
  status=CASE WHEN briefing_editions.sent_at IS NULL THEN 'approved' ELSE briefing_editions.status END,
  publication_status='published',
  publication_error=NULL,
  scheduled_publish_at=excluded.scheduled_publish_at,
  published_at=COALESCE(briefing_editions.published_at, excluded.published_at),
  scheduled_send_at=CASE WHEN briefing_editions.sent_at IS NULL THEN excluded.scheduled_send_at ELSE briefing_editions.scheduled_send_at END,
  approval_token_hash=excluded.approval_token_hash,
  approved_at=excluded.approved_at,
  approved_content_hash=excluded.approved_content_hash,
  held_at=NULL,
  updated_at=excluded.updated_at;
`;

const sqlPath = join(tmpdir(), `l-proof-issue-02-${process.pid}.sql`);
try {
  writeFileSync(sqlPath, statement, { encoding: "utf8", mode: 0o600 });
  const wrangler = spawnSync(process.execPath, ["node_modules/wrangler/bin/wrangler.js", "d1", "execute", "DB", "--remote", "--config", "wrangler.jsonc", "--file", sqlPath], { cwd: process.cwd(), encoding: "utf8" });
  if (wrangler.status !== 0) throw new Error(wrangler.stderr || wrangler.stdout || "D1 갱신 실패");
  let delivery = { emailSent: false };
  if (sendEmail) {
    const response = await fetch("https://l-proof-ai.xyz/api/briefings/send", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ edition: editionId, token }),
    });
    const result = await response.json();
    if (!response.ok || !result.ok) throw new Error(`즉시 발송 실패: ${response.status} ${JSON.stringify(result)}`);
    delivery = { emailSent: true, ...result };
  }
  console.log(JSON.stringify({ edition: editionId, subject, contentHash, articleUrl, ...delivery }));
} finally {
  try { unlinkSync(sqlPath); } catch {}
}
