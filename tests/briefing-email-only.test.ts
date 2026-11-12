import assert from "node:assert/strict";
import test from "node:test";
import { prepare } from "../scripts/prepare-briefing.mjs";
import { insertWebLinkAfterEmailIntro, splitEmailOnlyText } from "../lib/briefing-content.ts";

test("late-delivery notice stays in the email snapshot and out of the web article", () => {
  const manifest = {
    id: "test-issue",
    source: "test.md",
    editionNumber: 16,
    slug: "test-issue",
    previewText: "A preview",
    proofLevel: 3,
    tags: [],
    heroImageUrl: null,
    emailIntro: "정시에 보내드리지 못했습니다.\n\n죄송합니다.",
    reviewDueAt: "2026-11-12T10:00:00Z",
    scheduledPublishAt: "2026-11-12T10:05:00Z",
    scheduledSendAt: "2026-11-12T10:10:00Z",
  };
  const source = "---\nstatus: draft\n---\n# 제목\n\n본문입니다.\n\n## 편집자 메모\n내부 기록";
  const { payload, articleText, webHtml } = prepare(manifest, source);
  const parts = splitEmailOnlyText(payload.contentText);
  assert.equal(articleText, "# 제목\n\n본문입니다.");
  assert.equal(parts.article, articleText);
  assert.equal(parts.intro, "정시에 보내드리지 못했습니다.\n\n죄송합니다.\n\n---");
  assert.doesNotMatch(webHtml, /죄송합니다|email-only|내부 기록/);
  assert.match(payload.contentHtml, /죄송합니다/);
  const emailHtml = insertWebLinkAfterEmailIntro(payload.contentHtml, "<p>웹에서 읽기</p>");
  assert.ok(emailHtml.indexOf("죄송합니다") < emailHtml.indexOf("웹에서 읽기"));
  assert.ok(emailHtml.indexOf("웹에서 읽기") < emailHtml.indexOf("L-PROOF-AI · ISSUE 16"));
});
