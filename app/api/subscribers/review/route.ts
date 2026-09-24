import { NextResponse } from "next/server";
import { sha256 } from "@/lib/briefing-workflow";
import { getCloudflareEnv } from "@/lib/cloudflare-env";

function page(title: string, message: string, form = "", status = 200) {
  return new NextResponse(`<!doctype html><html lang="ko"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${title}</title><body style="margin:0;background:#f4f1ea;color:#172033;font-family:Arial,sans-serif"><main style="max-width:620px;margin:80px auto;padding:32px"><p style="color:#b33a2b;font-weight:700">L-PROOF-AI</p><h1>${title}</h1><p>${message}</p>${form}</main></body></html>`, { status, headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" } });
}

function clean(value: string) { return value.replace(/[&<>"']/g, ""); }

export async function GET(request: Request) {
  const url = new URL(request.url);
  const edition = url.searchParams.get("edition") ?? "";
  const token = url.searchParams.get("token") ?? "";
  const subscriber = url.searchParams.get("subscriber") ?? "";
  const action = url.searchParams.get("action") === "approve" ? "approve" : "hold";
  if (!edition || !token || !subscriber) return page("링크 오류", "승인 정보가 빠져 있습니다.", "", 400);
  const label = action === "approve" ? "구독 승인" : "계속 보류";
  return page(label, "이 구독자 상태를 변경하려면 확인 버튼을 눌러주세요.", `<form method="post"><input type="hidden" name="edition" value="${clean(edition)}"><input type="hidden" name="token" value="${clean(token)}"><input type="hidden" name="subscriber" value="${clean(subscriber)}"><input type="hidden" name="action" value="${action}"><button style="border:0;background:#b33a2b;color:white;padding:14px 22px;font-weight:700">${label}</button></form>`);
}

export async function POST(request: Request) {
  const form = await request.formData();
  const editionId = String(form.get("edition") ?? "");
  const token = String(form.get("token") ?? "");
  const subscriberId = String(form.get("subscriber") ?? "");
  const action = form.get("action") === "approve" ? "approve" : "hold";
  const values = getCloudflareEnv();
  const edition = await values.DB.prepare("SELECT approval_token_hash, review_due_at FROM briefing_editions WHERE id = ?").bind(editionId).first<{ approval_token_hash: string; review_due_at: string }>();
  if (!edition || await sha256(token) !== edition.approval_token_hash) return page("처리 불가", "링크가 유효하지 않습니다.", "", 403);
  if (new Date().toISOString() > edition.review_due_at) return page("처리 불가", "승인 마감이 지났습니다.", "", 409);
  const now = new Date().toISOString();
  if (action === "approve") {
    await values.DB.prepare("UPDATE subscribers SET status='approved', approved_at=?, rejected_at=NULL WHERE id=? AND status='pending'").bind(now, subscriberId).run();
  }
  return page(action === "approve" ? "구독 승인 완료" : "보류 유지", action === "approve" ? "다음 발송부터 개별 메일을 받습니다." : "현재 pending 상태를 유지합니다.");
}
