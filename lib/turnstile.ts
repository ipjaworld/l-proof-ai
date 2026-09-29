type TurnstileResponse = {
  success?: boolean;
  hostname?: string;
  action?: string;
  "error-codes"?: string[];
};

export async function verifyTurnstile(
  secret: string | undefined,
  token: string,
  remoteIp: string | null,
  expectedHostname: string,
  fetcher: typeof fetch = fetch,
) {
  if (!secret) return { ok: false as const, reason: "not-configured" as const };
  const body = new URLSearchParams({ secret, response: token });
  if (remoteIp) body.set("remoteip", remoteIp);
  try {
    const response = await fetcher("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body,
    });
    if (!response.ok) return { ok: false as const, reason: "verification-unavailable" as const };
    const result = await response.json() as TurnstileResponse;
    return result.success && result.action === "subscribe" && result.hostname === expectedHostname
      ? { ok: true as const }
      : { ok: false as const, reason: "rejected" as const };
  } catch {
    return { ok: false as const, reason: "verification-unavailable" as const };
  }
}
