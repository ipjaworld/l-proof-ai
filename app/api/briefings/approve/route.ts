import { NextResponse } from "next/server";
import { approveEdition } from "@/lib/briefing-workflow";
import { getCloudflareEnv } from "@/lib/cloudflare-env";

function page(title: string, message: string, status = 200) {
  return new NextResponse(
    `<!doctype html><html lang="ko"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${title}</title><body style="margin:0;background:#f4f1ea;color:#172033;font-family:Arial,'Noto Sans KR',sans-serif"><main style="max-width:620px;margin:80px auto;padding:32px"><p style="color:#b33a2b;font-weight:700;letter-spacing:.12em">L-PROOF-AI</p><h1>${title}</h1><p style="font-size:17px;line-height:1.7">${message}</p></main></body></html>`,
    { status, headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" } },
  );
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const edition = url.searchParams.get("edition") ?? "";
  const token = url.searchParams.get("token") ?? "";
  if (!edition || !token) return page("승인 링크 오류", "승인 정보가 빠져 있습니다.", 400);
  return page(
    "웹 공개 및 발송 예약 승인",
    `<strong>${edition}</strong> 원고를 승인하면 예약 시각에 웹에 먼저 공개되고, 공개 완료 후 구독자 발송이 진행됩니다.<form method="post" style="margin-top:28px"><input type="hidden" name="edition" value="${edition.replace(/[&<>\"]/g, "")}"><input type="hidden" name="token" value="${token.replace(/[&<>\"]/g, "")}"><button style="border:0;background:#b33a2b;color:#fff;padding:14px 22px;font-size:16px;font-weight:700;cursor:pointer">웹 공개 및 발송 예약 승인</button></form>`,
  );
}

export async function POST(request: Request) {
  const form = await request.formData();
  const edition = String(form.get("edition") ?? "");
  const token = String(form.get("token") ?? "");
  const result = await approveEdition(getCloudflareEnv(), edition, token);
  if (result.ok) return page("승인 완료", "고정본이 승인되었습니다. 웹 공개 후 승인된 구독자에게만 발송됩니다.");
  const messages: Record<string, string> = {
    "deadline-passed": "오전 6시 승인 마감이 지나 이번 발송은 보류되었습니다.",
    "content-changed": "검토 후 내용이 변경되어 기존 승인이 무효화되었습니다.",
    "already-sent": "이미 발송이 끝난 원고입니다.",
    "publication-incomplete": "slug 또는 웹 공개 일정이 없어 승인할 수 없습니다.",
  };
  return page("승인 처리 불가", messages[result.reason] ?? "링크가 유효하지 않거나 이미 처리되었습니다.", 409);
}
