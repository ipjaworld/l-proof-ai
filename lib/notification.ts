import { getCloudflareEnv } from "@/lib/cloudflare-env";

type NotificationRecord = {
  id: string;
  email: string;
  name?: string | null;
  interests: string[];
  createdAt: string;
  kind: "subscribe" | "unsubscribe";
};

export type NotificationResult = {
  status: "sent" | "not-configured" | "failed" | "deferred";
  error?: string;
  emailId?: string;
};

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[character];
  });
}

function brandedSender(value: string) {
  const bracketedAddress = value.match(/<([^<>]+)>/)?.[1];
  const address = (bracketedAddress ?? value).trim();
  return `L-Proof-AI <${address}>`;
}

export async function notifyOperator(record: NotificationRecord): Promise<NotificationResult> {
  const values = getCloudflareEnv();
  const apiKey = values.RESEND_API_KEY;
  const to = values.OPERATOR_NOTIFICATION_EMAIL;
  const from = values.EMAIL_FROM;

  if (!apiKey || !to || !from) {
    return { status: "not-configured", error: "Email provider configuration is incomplete" };
  }

  const action = record.kind === "subscribe" ? "새 구독 신청" : "구독 해지";
  const subject = `[L-Proof-AI] ${action}`;
  const text = [
    `처리: ${action}`,
    `신청 ID: ${record.id}`,
    `이메일: ${record.email}`,
    `이름: ${record.name || "-"}`,
    `관심 분야: ${record.interests.join(", ") || "-"}`,
    `시간: ${record.createdAt}`,
    "",
    "운영 명령:",
    `npm run subscribers -- approve ${record.email}`,
    `npm run subscribers -- reject ${record.email}`,
    "",
    "승인 전에는 브리핑 발송 대상에 포함되지 않아요.",
  ].join("\n");
  const html = `<!doctype html>
<html lang="ko">
  <body style="margin:0;background:#f4f1ea;color:#172033;font-family:Arial,'Noto Sans KR',sans-serif">
    <main style="max-width:640px;margin:0 auto;padding:40px 24px">
      <div style="border-top:4px solid #b33a2b;background:#fff;padding:28px;border-bottom:1px solid #d8d2c8">
        <p style="margin:0 0 8px;color:#b33a2b;font-size:12px;font-weight:700;letter-spacing:.12em">L-PROOF-AI · OPERATOR NOTICE</p>
        <h1 style="margin:0 0 24px;font-size:26px">${escapeHtml(action)}</h1>
        <table role="presentation" style="width:100%;border-collapse:collapse;font-size:14px;line-height:1.7">
          <tr><th align="left" style="width:110px;padding:6px 0;color:#667085">신청 ID</th><td>${escapeHtml(record.id)}</td></tr>
          <tr><th align="left" style="padding:6px 0;color:#667085">이메일</th><td>${escapeHtml(record.email)}</td></tr>
          <tr><th align="left" style="padding:6px 0;color:#667085">이름</th><td>${escapeHtml(record.name || "-")}</td></tr>
          <tr><th align="left" style="padding:6px 0;color:#667085">관심 분야</th><td>${escapeHtml(record.interests.join(", ") || "-")}</td></tr>
          <tr><th align="left" style="padding:6px 0;color:#667085">시간</th><td>${escapeHtml(record.createdAt)}</td></tr>
        </table>
        <div style="margin-top:24px;padding:16px;background:#f7f7f5;border:1px solid #e2e0dc;font-family:ui-monospace,monospace;font-size:12px;line-height:1.7">
          <div>npm run subscribers -- approve ${escapeHtml(record.email)}</div>
          <div>npm run subscribers -- reject ${escapeHtml(record.email)}</div>
        </div>
        <p style="margin:20px 0 0;color:#667085;font-size:13px">승인 전에는 브리핑 발송 대상에 포함되지 않습니다.</p>
      </div>
    </main>
  </body>
</html>`;
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "Idempotency-Key": `operator-${record.kind}-${record.id}`,
    },
    body: JSON.stringify({
      from: brandedSender(from),
      to: [to],
      subject,
      text,
      html,
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    return { status: "failed", error: `Resend ${response.status}: ${detail.slice(0, 180)}` };
  }
  const payload = (await response.json()) as { id?: string };
  if (!payload.id) return { status: "failed", error: "Resend response did not include an email id" };
  return { status: "sent", emailId: payload.id };
}
