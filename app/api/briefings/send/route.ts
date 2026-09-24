import { NextResponse } from "next/server";
import { sendEditionNow } from "@/lib/briefing-workflow";
import { getCloudflareEnv } from "@/lib/cloudflare-env";

export async function POST(request: Request) {
  const body = await request.json() as Record<string, unknown>;
  const edition = typeof body.edition === "string" ? body.edition : "";
  const token = typeof body.token === "string" ? body.token : "";
  if (!edition || !token) {
    return NextResponse.json({ ok: false, reason: "invalid-payload" }, { status: 400 });
  }

  const result = await sendEditionNow(getCloudflareEnv(), edition, token);
  return NextResponse.json(result, { status: result.ok ? 200 : 409 });
}
