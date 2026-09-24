type WorkerEnv = Cloudflare.Env;

type EditionRow = {
  id: string;
  edition_number: number | null;
  slug: string | null;
  subject: string;
  preview_text: string;
  content_text: string;
  content_html: string;
  proof_level: number;
  tags: string;
  hero_image_url: string | null;
  content_hash: string;
  status: string;
  publication_status: string;
  review_due_at: string;
  scheduled_publish_at: string | null;
  published_at: string | null;
  scheduled_send_at: string;
  approval_token_hash: string;
  approved_content_hash: string | null;
};

const encoder = new TextEncoder();

function bytesToHex(bytes: ArrayBuffer) {
  return Array.from(new Uint8Array(bytes), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function sha256(value: string) {
  return bytesToHex(await crypto.subtle.digest("SHA-256", encoder.encode(value)));
}

type PublicationIdentity = {
  editionNumber: number | null;
  slug: string | null;
  previewText: string;
  proofLevel: number;
  tags: string[];
  heroImageUrl: string | null;
  scheduledPublishAt: string | null;
};

export async function contentHash(
  subject: string,
  text: string,
  html: string,
  publication?: PublicationIdentity,
) {
  const publicationPayload = publication ? JSON.stringify({
    editionNumber: publication.editionNumber,
    slug: publication.slug,
    previewText: publication.previewText,
    proofLevel: publication.proofLevel,
    tags: publication.tags,
    heroImageUrl: publication.heroImageUrl,
    scheduledPublishAt: publication.scheduledPublishAt,
  }) : "";
  return sha256(`${subject}\n${text}\n${html}\n${publicationPayload}`);
}

function parseTags(value: string) {
  try {
    const parsed = JSON.parse(value) as unknown;
    return Array.isArray(parsed) ? parsed.filter((tag): tag is string => typeof tag === "string") : [];
  } catch {
    return [];
  }
}

function identityFromEdition(edition: EditionRow): PublicationIdentity {
  return {
    editionNumber: edition.edition_number,
    slug: edition.slug,
    previewText: edition.preview_text,
    proofLevel: edition.proof_level,
    tags: parseTags(edition.tags),
    heroImageUrl: edition.hero_image_url,
    scheduledPublishAt: edition.scheduled_publish_at,
  };
}

function siteUrl(env: WorkerEnv) {
  return (env.SITE_URL || "https://l-proof-ai.xyz").replace(/\/$/, "");
}

function articleUrl(env: WorkerEnv, slug: string) {
  return `${siteUrl(env)}/articles/${encodeURIComponent(slug)}`;
}

function addWebVersionToEmail(html: string, url: string) {
  const notice = `<p style="margin:0 0 30px;padding:16px;background:#fff;border-top:3px solid #b33a2b;line-height:1.7">웹에서 읽기: <a href="${escapeHtml(url)}" style="color:#b33a2b;font-weight:700">${escapeHtml(url)}</a></p>`;
  return html.replace(/(<body[^>]*>)/i, `$1${notice}`);
}

export function brandedSender(value: string) {
  const address = value.match(/<([^<>]+)>/)?.[1]?.trim() ?? value.trim();
  return `L-Proof-AI <${address}>`;
}

export async function sendWithResend(
  env: WorkerEnv,
  input: { to: string; subject: string; text: string; html: string; idempotencyKey: string },
) {
  if (!env.RESEND_API_KEY || !env.EMAIL_FROM) throw new Error("Email provider configuration is incomplete");
  const recipient = input.to.trim();
  // Privacy invariant: a send request may contain exactly one raw mailbox.
  // Never accept CSV-style input, CC, or BCC for subscriber deliveries.
  if (!recipient || /[,;\r\n]/.test(recipient) || recipient.split("@").length !== 2) {
    throw new Error("Exactly one recipient email address is required");
  }
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
      "Idempotency-Key": input.idempotencyKey,
    },
    body: JSON.stringify({
      from: brandedSender(env.EMAIL_FROM),
      to: [recipient],
      subject: input.subject,
      text: input.text,
      html: input.html,
    }),
  });
  const body = await response.text();
  if (!response.ok) throw new Error(`Resend ${response.status}: ${body.slice(0, 180)}`);
  const payload = JSON.parse(body) as { id?: string };
  if (!payload.id) throw new Error("Resend response did not include an email id");
  return payload.id;
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[character] ?? character);
}

export async function saveAndSendReview(
  env: WorkerEnv,
  baseUrl: string,
  input: {
    id: string;
    editionNumber: number;
    slug: string;
    subject: string;
    previewText: string;
    contentText: string;
    contentHtml: string;
    proofLevel: number;
    tags: string[];
    heroImageUrl: string | null;
    reviewDueAt: string;
    scheduledPublishAt: string;
    scheduledSendAt: string;
  },
) {
  if (!env.OPERATOR_NOTIFICATION_EMAIL) throw new Error("Operator email is not configured");
  const token = `${crypto.randomUUID()}${crypto.randomUUID()}`.replace(/-/g, "");
  const tokenHash = await sha256(token);
  const hash = await contentHash(input.subject, input.contentText, input.contentHtml, {
    editionNumber: input.editionNumber,
    slug: input.slug,
    previewText: input.previewText,
    proofLevel: input.proofLevel,
    tags: input.tags,
    heroImageUrl: input.heroImageUrl,
    scheduledPublishAt: input.scheduledPublishAt,
  });
  const now = new Date().toISOString();
  await env.DB.prepare(
    `INSERT INTO briefing_editions
      (id, edition_number, slug, subject, preview_text, content_text, content_html,
       proof_level, tags, hero_image_url, content_hash, status, publication_status,
       review_due_at, scheduled_publish_at, scheduled_send_at, approval_token_hash,
       created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'review', 'unpublished', ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       edition_number = excluded.edition_number, slug = excluded.slug,
       subject = excluded.subject, preview_text = excluded.preview_text,
       content_text = excluded.content_text, content_html = excluded.content_html,
       proof_level = excluded.proof_level, tags = excluded.tags,
       hero_image_url = excluded.hero_image_url,
       content_hash = excluded.content_hash, status = 'review',
       publication_status = 'unpublished', publication_error = NULL,
       scheduled_publish_at = excluded.scheduled_publish_at, published_at = NULL,
       review_due_at = excluded.review_due_at, scheduled_send_at = excluded.scheduled_send_at,
       approval_token_hash = excluded.approval_token_hash, approved_at = NULL,
       approved_content_hash = NULL, held_at = NULL, updated_at = excluded.updated_at`,
  ).bind(
    input.id, input.editionNumber, input.slug, input.subject, input.previewText,
    input.contentText, input.contentHtml, input.proofLevel, JSON.stringify(input.tags),
    input.heroImageUrl, hash, input.reviewDueAt, input.scheduledPublishAt,
    input.scheduledSendAt, tokenHash, now, now,
  ).run();

  const approveUrl = `${baseUrl}/api/briefings/approve?edition=${encodeURIComponent(input.id)}&token=${encodeURIComponent(token)}`;
  const pendingSubscribers = await env.DB.prepare(
    `SELECT id, email, name, created_at FROM subscribers
     WHERE status = 'pending' AND unsubscribed_at IS NULL ORDER BY created_at ASC LIMIT 100`,
  ).all<{ id: string; email: string; name: string | null; created_at: string }>();
  const pendingText = pendingSubscribers.results.length === 0
    ? "신규 승인 대기 구독자: 없음"
    : ["신규 승인 대기 구독자", ...pendingSubscribers.results.map((subscriber) =>
      `- ${subscriber.email}${subscriber.name ? ` (${subscriber.name})` : ""}`)].join("\n");
  const pendingHtml = pendingSubscribers.results.length === 0
    ? `<p style="color:#667085">신규 승인 대기 구독자가 없습니다.</p>`
    : `<ul style="padding:0;list-style:none">${pendingSubscribers.results.map((subscriber) => {
      const base = `${baseUrl}/api/subscribers/review?edition=${encodeURIComponent(input.id)}&token=${encodeURIComponent(token)}&subscriber=${encodeURIComponent(subscriber.id)}`;
      return `<li style="padding:14px 0;border-bottom:1px solid #ddd"><strong>${escapeHtml(subscriber.email)}</strong>${subscriber.name ? ` · ${escapeHtml(subscriber.name)}` : ""}<br><a href="${escapeHtml(`${base}&action=approve`)}">승인</a> · <a href="${escapeHtml(`${base}&action=hold`)}">보류</a></li>`;
    }).join("")}</ul>`;
  const reviewText = [
    `L-Proof-AI 검토용 초안 · ${input.id}`,
    `예정 URL: ${articleUrl(env, input.slug)}`,
    `승인 마감: ${input.reviewDueAt}`,
    `웹 공개 예정: ${input.scheduledPublishAt}`,
    `발송 예정: ${input.scheduledSendAt}`,
    "",
    input.contentText,
    "",
    pendingText,
    "",
    "아래 링크에서 고정본을 최종 승인하세요.",
    approveUrl,
    "",
    "승인하지 않으면 자동으로 보류되며, 승인 뒤 원고가 바뀌면 다시 승인해야 합니다.",
  ].join("\n");
  const reviewHtml = `<!doctype html><html lang="ko"><body style="margin:0;background:#f4f1ea;color:#172033;font-family:Arial,'Noto Sans KR',sans-serif"><main style="max-width:700px;margin:0 auto;padding:40px 24px"><p style="color:#b33a2b;font-weight:700;letter-spacing:.12em">L-PROOF-AI · REVIEW</p><h1>${escapeHtml(input.subject)}</h1><p>예정 URL: <a href="${escapeHtml(articleUrl(env, input.slug))}">${escapeHtml(articleUrl(env, input.slug))}</a><br>승인 마감: ${escapeHtml(input.reviewDueAt)}<br>웹 공개 예정: ${escapeHtml(input.scheduledPublishAt)}<br>발송 예정: ${escapeHtml(input.scheduledSendAt)}</p><div style="margin:28px 0;padding:24px;background:white;border-top:3px solid #b33a2b">${input.contentHtml}</div><section style="margin:28px 0;padding:24px;background:#fff"><h2>신규 승인 대기 구독자</h2>${pendingHtml}</section><p><a href="${escapeHtml(approveUrl)}" style="display:inline-block;background:#b33a2b;color:white;text-decoration:none;padding:14px 22px;font-weight:700">웹 공개 및 발송 예약 승인</a></p><p style="color:#667085;font-size:13px;line-height:1.7">승인하지 않으면 자동으로 보류됩니다. 승인 뒤 원고가 변경되면 기존 승인은 무효가 됩니다.</p></main></body></html>`;
  const emailId = await sendWithResend(env, {
    to: env.OPERATOR_NOTIFICATION_EMAIL,
    subject: `[검토용 초안] ${input.subject}`,
    text: reviewText,
    html: reviewHtml,
    idempotencyKey: `briefing-review-${input.id}-${hash.slice(0, 16)}`,
  });
  await env.DB.prepare(
    "UPDATE briefing_editions SET review_email_id = ?, review_sent_at = ?, updated_at = ? WHERE id = ? AND content_hash = ?",
  ).bind(emailId, now, now, input.id, hash).run();
  return { emailId, contentHash: hash };
}

export async function approveEdition(env: WorkerEnv, editionId: string, token: string, now = new Date()) {
  const edition = await env.DB.prepare("SELECT * FROM briefing_editions WHERE id = ?")
    .bind(editionId)
    .first<EditionRow>();
  if (!edition) return { ok: false as const, reason: "not-found" as const };
  if (edition.status === "sent") return { ok: false as const, reason: "already-sent" as const };
  if (now.toISOString() > edition.review_due_at) return { ok: false as const, reason: "deadline-passed" as const };
  if ((await sha256(token)) !== edition.approval_token_hash) {
    return { ok: false as const, reason: "invalid-token" as const };
  }
  if (!edition.slug || !edition.scheduled_publish_at) {
    return { ok: false as const, reason: "publication-incomplete" as const };
  }
  const actualHash = await contentHash(
    edition.subject,
    edition.content_text,
    edition.content_html,
    identityFromEdition(edition),
  );
  if (actualHash !== edition.content_hash) return { ok: false as const, reason: "content-changed" as const };
  const approvedAt = now.toISOString();
  const result = await env.DB.prepare(
    `UPDATE briefing_editions
       SET status = 'approved', publication_status = 'scheduled', publication_error = NULL,
           approved_at = ?, approved_content_hash = ?, updated_at = ?
     WHERE id = ? AND status IN ('draft', 'review', 'held') AND content_hash = ?`,
  ).bind(approvedAt, actualHash, approvedAt, editionId, actualHash).run();
  return result.meta.changes === 1
    ? { ok: true as const, approvedAt }
    : { ok: false as const, reason: "state-conflict" as const };
}

export async function holdExpiredEditions(env: WorkerEnv, now = new Date()) {
  const timestamp = now.toISOString();
  return env.DB.prepare(
    `UPDATE briefing_editions
       SET status = 'held', publication_status = CASE
         WHEN publication_status = 'unpublished' THEN 'held' ELSE publication_status END,
         held_at = ?, updated_at = ?
     WHERE status IN ('draft', 'review') AND review_due_at <= ?`,
  ).bind(timestamp, timestamp, timestamp).run();
}

async function sendEdition(env: WorkerEnv, edition: EditionRow, now: Date) {
  if (edition.publication_status !== "published" || !edition.slug || !edition.published_at) {
    return { sent: 0, failed: 0, held: true, reason: "article-not-published" };
  }
  if (edition.approved_content_hash !== edition.content_hash) {
    await env.DB.prepare(
      "UPDATE briefing_editions SET status = 'held', held_at = ?, updated_at = ? WHERE id = ? AND status = 'approved'",
    ).bind(now.toISOString(), now.toISOString(), edition.id).run();
    return { sent: 0, failed: 0, held: true };
  }

  const claimed = await env.DB.prepare(
    `UPDATE briefing_editions SET status = 'sending', send_started_at = ?, updated_at = ?
     WHERE id = ? AND status = 'approved' AND approved_content_hash = content_hash`,
  ).bind(now.toISOString(), now.toISOString(), edition.id).run();
  if (claimed.meta.changes !== 1) return { sent: 0, failed: 0, held: false };

  const subscribers = await env.DB.prepare(
    `SELECT s.id, s.email FROM subscribers s
     WHERE s.status = 'approved' AND s.unsubscribed_at IS NULL
       AND NOT EXISTS (
         SELECT 1
         FROM briefing_deliveries d
         JOIN briefing_editions previous ON previous.id = d.edition_id
         WHERE d.subscriber_id = s.id
           AND previous.content_hash = ?
           AND d.status IN ('sent', 'delivered')
       )
     ORDER BY created_at ASC`,
  ).bind(edition.content_hash).all<{ id: string; email: string }>();
  let sent = 0;
  let failed = 0;
  for (const subscriber of subscribers.results) {
    const deliveryId = `${edition.id}:${subscriber.id}`;
    const createdAt = new Date().toISOString();
    const inserted = await env.DB.prepare(
      `INSERT INTO briefing_deliveries
        (id, edition_id, subscriber_id, recipient, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, 'pending', ?, ?)
       ON CONFLICT(edition_id, subscriber_id) DO NOTHING`,
    ).bind(deliveryId, edition.id, subscriber.id, subscriber.email, createdAt, createdAt).run();
    if (inserted.meta.changes !== 1) continue;
    try {
      const emailId = await sendWithResend(env, {
        to: subscriber.email,
        subject: edition.subject,
        text: `웹에서 읽기: ${articleUrl(env, edition.slug)}\n\n${edition.content_text}`,
        html: addWebVersionToEmail(edition.content_html, articleUrl(env, edition.slug)),
        idempotencyKey: `briefing-${deliveryId}`,
      });
      const deliveredAt = new Date().toISOString();
      await env.DB.batch([
        env.DB.prepare(
          `UPDATE briefing_deliveries SET status = 'sent', email_id = ?, sent_at = ?, updated_at = ? WHERE id = ?`,
        ).bind(emailId, deliveredAt, deliveredAt, deliveryId),
        env.DB.prepare("UPDATE subscribers SET last_sent_at = ? WHERE id = ?")
          .bind(deliveredAt, subscriber.id),
      ]);
      sent += 1;
    } catch (error) {
      const message = error instanceof Error ? error.message.slice(0, 300) : "Unknown send failure";
      await env.DB.prepare(
        "UPDATE briefing_deliveries SET status = 'failed', error = ?, updated_at = ? WHERE id = ?",
      ).bind(message, new Date().toISOString(), deliveryId).run();
      failed += 1;
    }
  }
  const finishedAt = new Date().toISOString();
  await env.DB.prepare(
    `UPDATE briefing_editions SET status = ?, sent_at = ?, updated_at = ? WHERE id = ? AND status = 'sending'`,
  ).bind(failed === 0 ? "sent" : "send_failed", finishedAt, finishedAt, edition.id).run();
  return { sent, failed, held: false };
}

export async function sendEditionNow(env: WorkerEnv, editionId: string, token: string, now = new Date()) {
  const edition = await env.DB.prepare("SELECT * FROM briefing_editions WHERE id = ?")
    .bind(editionId)
    .first<EditionRow>();
  if (!edition) return { ok: false as const, reason: "not-found" as const };
  if (edition.status !== "approved") return { ok: false as const, reason: "not-approved" as const };
  if (edition.scheduled_send_at > now.toISOString()) {
    return { ok: false as const, reason: "not-due" as const };
  }

  const [expectedHash, suppliedHash] = await Promise.all([
    Promise.resolve(edition.approval_token_hash),
    sha256(token),
  ]);
  let difference = expectedHash.length ^ suppliedHash.length;
  for (let index = 0; index < Math.min(expectedHash.length, suppliedHash.length); index += 1) {
    difference |= expectedHash.charCodeAt(index) ^ suppliedHash.charCodeAt(index);
  }
  if (difference !== 0) return { ok: false as const, reason: "invalid-token" as const };

  const actualHash = await contentHash(
    edition.subject,
    edition.content_text,
    edition.content_html,
    identityFromEdition(edition),
  );
  if (actualHash !== edition.content_hash || actualHash !== edition.approved_content_hash) {
    return { ok: false as const, reason: "content-changed" as const };
  }

  return { ok: true as const, ...(await sendEdition(env, edition, now)) };
}

export async function sendDueEditions(env: WorkerEnv, now = new Date()) {
  const editions = await env.DB.prepare(
    `SELECT * FROM briefing_editions
     WHERE status = 'approved' AND publication_status = 'published'
       AND published_at IS NOT NULL AND scheduled_send_at <= ?
     ORDER BY scheduled_send_at ASC`,
  ).bind(now.toISOString()).all<EditionRow>();
  const results = [];
  for (const edition of editions.results) results.push(await sendEdition(env, edition, now));
  return results;
}

export async function publishDueEditions(env: WorkerEnv, now = new Date()) {
  const timestamp = now.toISOString();
  const editions = await env.DB.prepare(
    `SELECT * FROM briefing_editions
     WHERE status = 'approved' AND publication_status = 'scheduled'
       AND scheduled_publish_at IS NOT NULL AND scheduled_publish_at <= ?
     ORDER BY scheduled_publish_at ASC`,
  ).bind(timestamp).all<EditionRow>();
  const results = [];
  for (const edition of editions.results) {
    if (!edition.slug) {
      await env.DB.prepare(
        `UPDATE briefing_editions SET publication_status = 'failed',
         publication_error = 'missing-slug', updated_at = ?
         WHERE id = ? AND publication_status = 'scheduled'`,
      ).bind(timestamp, edition.id).run();
      results.push({ id: edition.id, published: false, reason: "missing-slug" });
      continue;
    }
    const actualHash = await contentHash(
      edition.subject,
      edition.content_text,
      edition.content_html,
      identityFromEdition(edition),
    );
    if (actualHash !== edition.content_hash || actualHash !== edition.approved_content_hash) {
      await env.DB.prepare(
        `UPDATE briefing_editions SET status = 'held', publication_status = 'failed',
         publication_error = 'content-changed', held_at = ?, updated_at = ?
         WHERE id = ? AND publication_status = 'scheduled'`,
      ).bind(timestamp, timestamp, edition.id).run();
      results.push({ id: edition.id, published: false, reason: "content-changed" });
      continue;
    }
    const claimed = await env.DB.prepare(
      `UPDATE briefing_editions SET publication_status = 'published', published_at = ?,
       publication_error = NULL, updated_at = ?
       WHERE id = ? AND status = 'approved' AND publication_status = 'scheduled'
         AND approved_content_hash = content_hash`,
    ).bind(timestamp, timestamp, edition.id).run();
    results.push({ id: edition.id, published: claimed.meta.changes === 1 });
  }
  return results;
}

export async function runBriefingSchedule(env: WorkerEnv, now = new Date()) {
  await holdExpiredEditions(env, now);
  const published = await publishDueEditions(env, now);
  const deliveries = await sendDueEditions(env, now);
  return { published, deliveries };
}
