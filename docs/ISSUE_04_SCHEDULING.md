# Issue 04 scheduling record

Verified on 2026-09-30 KST through the authenticated Cloudflare dashboard.

- Edition: `2026-10-01-thu`, issue 4, `define-agent-work-before-changing-models`.
- Title: 모델을 바꾸기 전에, 맡길 일을 나눠야 한다.
- Production database: `l-proof-ai-production` (the current Worker database, not the historical Sites database).
- Persisted status: `approved`; publication status: `scheduled`.
- Web publication: 2026-10-01 08:50 KST (`2026-09-30T23:50:00.000Z`).
- Email start: 2026-10-01 09:00 KST (`2026-10-01T00:00:00.000Z`); recipient slots span 09:00–09:05.
- Eligible recipients at verification: 41 approved, non-unsubscribed subscribers. Eligibility is checked again at execution.
- Content and approved snapshot hashes match: `d2a93b47e85d65e25085e2ca1bcac0050ed340e9cd2e24eb536a26ac009e9ee0`.
- Reader text and HTML contain neither editor notes nor fact-check records; production SQL checks returned zero occurrences.
- Deployed publication/send cron triggers were checked in the dashboard. Individual delivery rows currently number zero, as expected: the 09:00 server job creates the recipient sends/Resend schedules. Provider acceptance and actual delivery have not yet occurred or been verified.

## Authorized urgent exception

The user explicitly requested Computer Use scheduling tonight because normal API registration lacked local admin authentication. The approved reader-facing payload was inserted once through the Cloudflare D1 console, guarded against an existing ID, issue number, or slug. No existing edition or subscriber was changed. The publication gate and approved-content snapshot were preserved. Wrangler was not used.

The console rejected multiline input and then a newline-concatenation expression before a successful UTF-8 literal insert. A subsequent read verified the persisted status, timestamps, matching hashes, internal-note exclusion, eligible count, and delivery count. No duplicate retry followed success.

## High-priority follow-up

Connect normal `BRIEFING_ADMIN_SECRET` authentication securely and provide authenticated reservation/status verification so future issues use the production API → review email → approval flow without dashboard intervention. Keep secrets out of chat and Git. This remains an open priority, not completed automation. New project sessions should briefly remind the user, as specified in `AGENTS.md`.
