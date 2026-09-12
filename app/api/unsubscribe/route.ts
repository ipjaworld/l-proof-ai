import { NextResponse } from "next/server";
import {
  consumeBudget,
  enforceRateLimit,
  requestKey,
  setNotificationResult,
  unsubscribeSubscriber,
} from "@/db/subscribers";
import { notifyOperator } from "@/lib/notification";
import { readFormJson } from "@/lib/request";
import { unsubscribeSchema } from "@/lib/validation";

const success = () =>
  NextResponse.json({
    ok: true,
    message: "구독 해지 요청을 처리했어요. 같은 주소로 다시 신청하면 검토 대기 상태로 돌아갑니다.",
  });

export async function POST(request: Request) {
  try {
    const body = await readFormJson(request);
    if (typeof body?.website === "string" && body.website.length > 0) return success();
    const parsed = unsubscribeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, message: "이메일 주소를 다시 확인해주세요." },
        { status: 400 },
      );
    }

    await enforceRateLimit(await requestKey(request, "unsubscribe"));
    const subscriber = await unsubscribeSubscriber(parsed.data.email);
    if (subscriber) {
      const withinNotificationBudget = await consumeBudget(
        "global:operator-notification",
        25,
        24 * 60 * 60_000,
      );
      if (!withinNotificationBudget) {
        await setNotificationResult(
          subscriber.id,
          "deferred",
          "Daily operator notification budget reached",
        );
        return success();
      }
      const notification = await notifyOperator({
        id: subscriber.id,
        email: subscriber.email,
        name: subscriber.name,
        interests: JSON.parse(subscriber.interests) as string[],
        createdAt: new Date().toISOString(),
        kind: "unsubscribe",
      });
      await setNotificationResult(subscriber.id, notification.status, notification.error);
    }
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
        { ok: false, message: "요청이 잠시 몰렸어요. 10분 뒤 다시 시도해주세요." },
        { status: 429 },
      );
    }
    console.error("unsubscribe_failed", error);
    return NextResponse.json(
      { ok: false, message: "처리하지 못했어요. lproof073@gmail.com으로 해지를 요청해주세요." },
      { status: 500 },
    );
  }
}
