# Issue 06 scheduling record

Verified on 2026-10-07 KST through the authenticated Cloudflare dashboard, at the user's explicit request to use Computer Use.

- Edition: `2026-10-08-thu`, issue 6, `work-remains-after-ai-answers`.
- Title: AI가 답한 뒤에도 할 일이 남는다.
- Source: `content/drafts/2026-10-07.md`; manifest: `content/editions/2026-10-08-thu.json`.
- Local reader preview: `outputs/2026-10-08-thu/reader.html` (generated, Git-ignored).
- Production database: `l-proof-ai-production`, bound to production Worker `l-proof-ai` at `l-proof-ai.xyz`.
- Before registration: no issue 6 reservation; issue 5 was sent/published. Pending subscribers: 0. Approved, non-unsubscribed recipients: 41. No subscribers changed.
- Persisted status: `approved`; publication status: `scheduled`.
- Approval snapshot timestamp: `2026-10-07T12:32:07.293Z`.
- Review deadline: 2026-10-08 06:00 KST (`2026-10-07T21:00:00.000Z`).
- Web publication: 2026-10-08 08:50 KST (`2026-10-07T23:50:00.000Z`).
- Email start: 2026-10-08 09:00 KST (`2026-10-08T00:00:00.000Z`), individual slots through 09:05 KST.
- Production content and approved snapshot hashes both match the prepared payload: `ed7215d5235d503248edc3d9fc38331b32585631431b83df3d6987915af54744`.
- SQL equality checks against the exact prepared text and HTML both returned 1. Text length: 5,036 characters; HTML: 9,442. Internal-note checks returned 0.
- Deployed cron triggers verified in the production Worker dashboard: `50 23 * * SUN,WED`, `0 21 * * SUN,WED`, `0 0 * * *`.
- Individual delivery records: 0, as expected before the 09:00 server job. Provider reservations/acceptance and actual delivery have not yet occurred or been verified. Eligibility is checked again at execution.

## Authorized dashboard exception

Normal registration credentials were absent from the execution environment. The user explicitly instructed use of the Cloudflare dashboard. One guarded insert created only this authorized edition and preserved the production content hash, approval snapshot, scheduled publication gate, and send time. No API review email was sent under this exception. No existing edition was overwritten; Wrangler and remote CLI writes were not used.

The reader preview check caught a malformed local sentence left by the prior wording replacement. It was restored to the exact text shown to and approved by the user before the production insert. The final prepared reader content was checked in the browser; the preparation tests passed (3/3).

Normal API authentication and dashboard-free subscriber/status operations remain an outstanding automation priority. No production secrets were changed or recorded.
