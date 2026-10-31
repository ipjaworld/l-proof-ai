import assert from "node:assert/strict";
import test from "node:test";
import { interpretationHeading } from "../lib/article-markdown.ts";

test("interpretation heading is read from markdown articles", () => {
  const text = "## 소식\n\n본문\n\n## L-Proof의 해석\n\n### 승인 창이 줄면\n\n내용";
  assert.equal(interpretationHeading(text), "승인 창이 줄면");
});

test("interpretation heading is read from plain text articles", () => {
  assert.equal(interpretationHeading("소식\r\nL-Proof의 해석\r\n승인 창이 줄면\r\n내용"), "승인 창이 줄면");
});

test("articles without an interpretation section have no heading", () => {
  assert.equal(interpretationHeading("## 소식\n\n‘L-Proof의 해석’은 별도의 판단입니다."), null);
});
