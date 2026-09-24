import { NextResponse } from "next/server";
import { getCloudflareEnv } from "@/lib/cloudflare-env";
import { saveAndSendReview, sha256 } from "@/lib/briefing-workflow";

const maxBodyBytes = 512_000;

async function authorized(request: Request, secret: string | undefined) {
  const authorization = request.headers.get("authorization") ?? "";
  const supplied = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
  if (!secret || !supplied) return false;
  const [expectedHash, suppliedHash] = await Promise.all([sha256(secret), sha256(supplied)]);
  let difference = 0;
  for (let index = 0; index < expectedHash.length; index += 1) {
    difference |= expectedHash.charCodeAt(index) ^ suppliedHash.charCodeAt(index);
  }
  return difference === 0;
}

export async function POST(request: Request) {
  const values = getCloudflareEnv();
  if (!(await authorized(request, values.BRIEFING_ADMIN_SECRET))) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const length = Number(request.headers.get("content-length") ?? 0);
  if (length > maxBodyBytes) return NextResponse.json({ ok: false }, { status: 413 });
  const body = await request.json() as Record<string, unknown>;
  const required = [
    "id", "slug", "subject", "previewText", "contentText", "contentHtml",
    "reviewDueAt", "scheduledPublishAt", "scheduledSendAt",
  ] as const;
  if (required.some((key) => typeof body[key] !== "string" || String(body[key]).trim() === "")) {
    return NextResponse.json({ ok: false, error: "invalid-payload" }, { status: 400 });
  }
  const editionNumber = Number(body.editionNumber);
  const proofLevel = Number(body.proofLevel ?? 3);
  const slug = String(body.slug);
  const tags = Array.isArray(body.tags)
    ? body.tags.filter((tag): tag is string => typeof tag === "string").map((tag) => tag.trim()).filter(Boolean)
    : [];
  if (!Number.isInteger(editionNumber) || editionNumber < 1 || editionNumber > 9999) {
    return NextResponse.json({ ok: false, error: "invalid-edition-number" }, { status: 400 });
  }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug.length > 120) {
    return NextResponse.json({ ok: false, error: "invalid-slug" }, { status: 400 });
  }
  if (!Number.isInteger(proofLevel) || proofLevel < 1 || proofLevel > 4 || tags.length > 10) {
    return NextResponse.json({ ok: false, error: "invalid-article-metadata" }, { status: 400 });
  }
  const reviewDue = new Date(String(body.reviewDueAt));
  const scheduledPublish = new Date(String(body.scheduledPublishAt));
  const scheduled = new Date(String(body.scheduledSendAt));
  if (
    !Number.isFinite(reviewDue.getTime()) || !Number.isFinite(scheduledPublish.getTime()) ||
    !Number.isFinite(scheduled.getTime()) || reviewDue >= scheduledPublish || scheduledPublish >= scheduled
  ) {
    return NextResponse.json({ ok: false, error: "invalid-schedule" }, { status: 400 });
  }
  const result = await saveAndSendReview(values, new URL(request.url).origin, {
    id: String(body.id),
    editionNumber,
    slug,
    subject: String(body.subject),
    previewText: String(body.previewText),
    contentText: String(body.contentText),
    contentHtml: String(body.contentHtml),
    proofLevel,
    tags,
    heroImageUrl: typeof body.heroImageUrl === "string" && body.heroImageUrl.trim()
      ? body.heroImageUrl.trim()
      : null,
    reviewDueAt: reviewDue.toISOString(),
    scheduledPublishAt: scheduledPublish.toISOString(),
    scheduledSendAt: scheduled.toISOString(),
  });
  return NextResponse.json({ ok: true, ...result });
}
