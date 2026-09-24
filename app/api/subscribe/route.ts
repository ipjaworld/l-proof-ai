import { NextResponse } from "next/server";
import {
  cleanupOldRateLimits,
  consumeBudget,
  enforceRateLimit,
  hasBudget,
  requestKey,
  upsertSubscriber,
} from "@/db/subscribers";
import { readFormJson } from "@/lib/request";
import { subscribeSchema } from "@/lib/validation";

const success = () =>
  NextResponse.json({
    ok: true,
    message: "브리핑 신청이 접수됐어요. 제가 확인한 뒤 첫 브리핑을 보내드릴게요.",
  });

export async function POST(request: Request) {
  try {
    const body = await readFormJson(request);
    if (typeof body?.website === "string" && body.website.length > 0) return success();
    const parsed = subscribeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, message: "이메일과 필수 동의 항목을 다시 확인해주세요." },
        { status: 400 },
      );
    }

    if (!(await hasBudget("global:subscribe", 200, 24 * 60 * 60_000))) return success();
    await enforceRateLimit(await requestKey(request, "subscribe"));
    const withinDailyIntake = await consumeBudget("global:subscribe", 200, 24 * 60 * 60_000);
    if (!withinDailyIntake) return success();
    await upsertSubscriber(parsed.data);
    if (Math.random() < 0.05) await cleanupOldRateLimits();
    return success();
  } catch (error) {
    if (error instanceof Error && ["PAYLOAD_TOO_LARGE", "INVALID_JSON"].includes(error.message)) {
      return NextResponse.json(
        { ok: false, message: "요청 형식을 확인해주세요." },
        { status: error.message === "PAYLOAD_TOO_LARGE" ? 413 : 400 },
      );
    }
    if (error instanceof Error && error.message === "RATE_LIMITED") {
      return NextResponse.json(
        { ok: false, message: "신청이 잠시 몰렸어요. 10분 뒤 다시 시도해주세요." },
        { status: 429 },
      );
    }
    console.error("subscription_failed", error);
    return NextResponse.json(
      { ok: false, message: "신청을 저장하지 못했어요. 잠시 뒤 다시 시도하거나 this_is_laugh@naver.com으로 알려주세요." },
      { status: 500 },
    );
  }
}
