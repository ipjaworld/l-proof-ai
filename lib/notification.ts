import { env } from "cloudflare:workers";

type NotificationRecord = {
  email: string;
  name?: string | null;
  interests: string[];
  createdAt: string;
  kind: "subscribe" | "unsubscribe";
};

export type NotificationResult = {
  status: "sent" | "not-configured" | "failed";
  error?: string;
};

export async function notifyOperator(record: NotificationRecord): Promise<NotificationResult> {
  const values = env as Cloudflare.Env;
  const apiKey = values.RESEND_API_KEY;
  const to = values.OPERATOR_NOTIFICATION_EMAIL;
  const from = values.EMAIL_FROM;

  if (!apiKey || !to || !from) {
    return { status: "not-configured", error: "Email provider configuration is incomplete" };
  }

  const action = record.kind === "subscribe" ? "새 구독 신청" : "구독 해지";
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject: `[L-Proof-AI] ${action}: ${record.email}`,
      text: [
        `처리: ${action}`,
        `이메일: ${record.email}`,
        `이름: ${record.name || "-"}`,
        `관심 분야: ${record.interests.join(", ") || "-"}`,
        `시간: ${record.createdAt}`,
        "",
        "구독자 상태는 Sites의 D1 subscribers 테이블에서 변경할 수 있어요.",
      ].join("\n"),
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    return { status: "failed", error: `Resend ${response.status}: ${detail.slice(0, 180)}` };
  }
  return { status: "sent" };
}
