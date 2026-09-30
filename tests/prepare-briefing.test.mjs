import test from 'node:test';
import assert from 'node:assert/strict';
import { prepare, readerText, render } from '../scripts/prepare-briefing.mjs';

test('internal notes and frontmatter never enter reader output', () => {
  const text = readerText('---\nstatus: draft\n---\n# Title\nPublic\n## 편집자 메모 — 검토가 필요한 부분\nPRIVATE\n## 팩트체크·중복 제거 기록\nPRIVATE2');
  assert.equal(text, '# Title\nPublic');
  assert.equal(readerText('# Title\nPublic\n## 팩트체크·중복 제거 기록\nPRIVATE'), '# Title\nPublic');
});

test('HTML preserves comparison table and conclusion, escapes raw HTML', () => {
  const html = render('# Title\n\n| A | B |\n| --- | --- |\n| **yes** | `code` |\n\n# 이번 호의 결론\n\n<script>bad</script>');
  assert.match(html, /<table/);
  assert.match(html, /<strong>yes<\/strong>/);
  assert.match(html, /<h2[^>]*>이번 호의 결론<\/h2>/);
  assert.doesNotMatch(html, /<script>/);
  assert.match(html, /&lt;script&gt;/);
});

test('preparation converts KST schedule and rejects invalid order', () => {
  const m = { id: '2026-10-01-thu', editionNumber: 4, slug: 'test-issue', reviewDueAt: '2026-10-01T06:00:00+09:00', scheduledPublishAt: '2026-10-01T08:50:00+09:00', scheduledSendAt: '2026-10-01T09:00:00+09:00' };
  const p = prepare(m, '# Title\n\nPublic');
  assert.equal(p.scheduledPublishAt, '2026-09-30T23:50:00.000Z');
  assert.equal(p.scheduledSendAt, '2026-10-01T00:00:00.000Z');
  assert.throws(() => prepare({ ...m, scheduledSendAt: m.reviewDueAt }, '# Title'));
});
