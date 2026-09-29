const encoder = new TextEncoder();

function bytesToHex(bytes: ArrayBuffer) {
  return Array.from(new Uint8Array(bytes), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function sha256Hex(value: string) {
  return bytesToHex(await crypto.subtle.digest("SHA-256", encoder.encode(value)));
}

async function hmacHex(secret: string, value: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return bytesToHex(await crypto.subtle.sign("HMAC", key, encoder.encode(value)));
}

function unsubscribePayload(subscriberId: string, normalizedEmail: string) {
  return `unsubscribe:v1:${subscriberId}:${normalizedEmail}`;
}

export function validSubscriberId(value: string) {
  return value.length >= 1 && value.length <= 128 && /^[A-Za-z0-9_-]+$/.test(value);
}

export function validUnsubscribeToken(value: string) {
  return /^[a-f0-9]{64}$/.test(value);
}

export async function createUnsubscribeToken(
  secret: string,
  subscriberId: string,
  normalizedEmail: string,
) {
  if (!secret) throw new Error("UNSUBSCRIBE_TOKEN_SECRET is not configured");
  return hmacHex(secret, unsubscribePayload(subscriberId, normalizedEmail));
}

export async function verifyUnsubscribeToken(
  secret: string,
  subscriberId: string,
  normalizedEmail: string,
  suppliedToken: string,
) {
  if (!secret || !validSubscriberId(subscriberId) || !validUnsubscribeToken(suppliedToken)) return false;
  const expected = await createUnsubscribeToken(secret, subscriberId, normalizedEmail);
  const expectedBytes = encoder.encode(expected);
  const suppliedBytes = encoder.encode(suppliedToken);
  if (expectedBytes.byteLength !== suppliedBytes.byteLength) return false;
  let difference = 0;
  for (let index = 0; index < expectedBytes.byteLength; index += 1) {
    difference |= expectedBytes[index] ^ suppliedBytes[index];
  }
  return difference === 0;
}

export function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[character] ?? character);
}
