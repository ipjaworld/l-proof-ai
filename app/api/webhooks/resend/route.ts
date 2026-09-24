import { NextResponse } from "next/server";
import { getCloudflareEnv } from "@/lib/cloudflare-env";

const trackedEvents = new Set([
  "email.delivered",
  "email.bounced",
  "email.complained",
]);

type ResendEvent = {
  type: string;
  created_at: string;
  data?: {
    email_id?: string;
    to?: string[];
  };
};

function decodeWebhookSecret(value: string) {
  const encoded = value.startsWith("whsec_") ? value.slice(6) : value;
  const normalized = encoded.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  return Uint8Array.from(atob(padded), (character) => character.charCodeAt(0));
}

function encodeBase64(bytes: ArrayBuffer) {
  const data = new Uint8Array(bytes);
  let binary = "";
  for (const byte of data) binary += String.fromCharCode(byte);
  return btoa(binary);
}

async function verifySignature(request: Request, payload: string, secret: string) {
  const id = request.headers.get("svix-id");
  const timestamp = request.headers.get("svix-timestamp");
  const signatures = request.headers.get("svix-signature");
  if (!id || !timestamp || !signatures) return null;

  const timestampSeconds = Number(timestamp);
  if (!Number.isFinite(timestampSeconds) || Math.abs(Date.now() / 1000 - timestampSeconds) > 300) {
    return null;
  }

  const key = await crypto.subtle.importKey(
    "raw",
    decodeWebhookSecret(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signed = new TextEncoder().encode(`${id}.${timestamp}.${payload}`);
  const expected = `v1,${encodeBase64(await crypto.subtle.sign("HMAC", key, signed))}`;
  const valid = signatures.split(" ").some((signature) => signature === expected);
  return valid ? id : null;
}

export async function POST(request: Request) {
  const values = getCloudflareEnv();
  if (!values.RESEND_WEBHOOK_SECRET || !values.DB) {
    return NextResponse.json({ ok: false }, { status: 503 });
  }

  const rawPayload = await request.text();
  const eventId = await verifySignature(request, rawPayload, values.RESEND_WEBHOOK_SECRET);
  if (!eventId) return NextResponse.json({ ok: false }, { status: 400 });

  let event: ResendEvent;
  try {
    event = JSON.parse(rawPayload) as ResendEvent;
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  if (!trackedEvents.has(event.type)) return NextResponse.json({ ok: true });
  const emailId = event.data?.email_id;
  if (!emailId || !event.created_at) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const receivedAt = new Date().toISOString();
  const recipient = event.data?.to?.[0] ?? null;
  await values.DB.batch([
    values.DB.prepare(
      `INSERT INTO email_delivery_events
        ("id", "email_id", "type", "recipient", "event_created_at", "received_at", "payload")
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT("id") DO NOTHING`,
    ).bind(eventId, emailId, event.type, recipient, event.created_at, receivedAt, rawPayload),
    values.DB.prepare(
      `UPDATE subscribers SET
         "notification_delivery_status" = ?,
         "notification_delivered_at" = CASE WHEN ? = 'email.delivered' THEN ? ELSE "notification_delivered_at" END,
         "notification_bounced_at" = CASE WHEN ? = 'email.bounced' THEN ? ELSE "notification_bounced_at" END,
         "notification_complained_at" = CASE WHEN ? = 'email.complained' THEN ? ELSE "notification_complained_at" END,
         "notification_event_updated_at" = ?
       WHERE "notification_email_id" = ?`,
    ).bind(
      event.type.slice("email.".length),
      event.type,
      event.created_at,
      event.type,
      event.created_at,
      event.type,
      event.created_at,
      receivedAt,
      emailId,
    ),
    values.DB.prepare(
      `UPDATE briefing_deliveries SET
         "status" = ?,
         "error" = CASE WHEN ? IN ('email.bounced', 'email.complained') THEN ? ELSE "error" END,
         "updated_at" = ?
       WHERE "email_id" = ?`,
    ).bind(
      event.type.slice("email.".length),
      event.type,
      event.type,
      receivedAt,
      emailId,
    ),
  ]);

  return NextResponse.json({ ok: true });
}
