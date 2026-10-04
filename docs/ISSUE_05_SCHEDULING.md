# Issue 05 scheduling record

Verified on 2026-10-05 KST through the authenticated Cloudflare dashboard.

- Edition: `2026-10-05-mon`, issue 5, `what-remains-when-models-change`.
- Title: 모델을 바꿔도 남는 것은 무엇인가.
- Final user-edited manuscript preserved without prose changes; preparation commit: `36e01f7`.
- Source: `content/drafts/2026-10-05.md`; manifest: `content/editions/2026-10-05-mon.json`.
- Local reader preview: `outputs/issue-05/reader.html` (generated, ignored by Git).
- Production database: `l-proof-ai-production`.
- Persisted status: `approved`; publication status: `scheduled`.
- Approval snapshot timestamp: `2026-10-04T15:54:48.811Z` (2026-10-05 00:54:48 KST).
- Review deadline: 2026-10-05 06:00 KST (`2026-10-04T21:00:00.000Z`).
- Web publication: 2026-10-05 08:50 KST (`2026-10-04T23:50:00.000Z`).
- Email start: 2026-10-05 09:00 KST (`2026-10-05T00:00:00.000Z`); recipient slots span 09:00–09:05 KST.
- Eligible recipients at verification: 41 approved, non-unsubscribed subscribers; pending: 0. Eligibility is checked again at execution. No subscribers were changed.
- Content and approved snapshot hashes: `a8d4368a42be64361e7a60731471cee1768d07c08714be1207b51539c02e8632`.
- Production readback confirmed text length 7,163 and HTML length 13,615. Exact equality against the prepared text, HTML, and publication metadata returned 1 for all three checks. Internal-note checks returned 0.
- Existing ID/issue-number/slug conflicts were 0 before insertion. The previous issue was already `sent` / `published`.
- Deployed production Worker `l-proof-ai` showed cron triggers `50 23 * * SUN,WED`, `0 21 * * SUN,WED`, and `0 0 * * *` in the dashboard. Its DB binding points to this production database.
- Individual delivery rows: 0 at verification, as expected. The 09:00 server job creates individual Resend sends/reservations, after the publication gate passes. Provider acceptance and actual delivery have not yet occurred or been verified.

## Authorized dashboard exception

The user explicitly authorized: “이번 회차는 대시보드로 예약 진행”. Normal API registration lacked local `BRIEFING_ADMIN_SECRET` authentication. The reviewed final payload was inserted once via Computer Use in the Cloudflare D1 console, with a guard against an existing ID, issue number, or slug. JSON extraction preserved literal newlines and punctuation. The production content-hash algorithm and approved snapshot were used, with publication still gated until 08:50. No existing edition was overwritten; no Wrangler or direct remote CLI writes were used. No operator review email was generated in this exception flow.

## Outstanding automation work

The user deferred automation improvements to the next work session. Completion includes securely connecting normal API authentication and making pending-subscriber lookup, edition registration/approval, and persisted schedule verification possible without Computer Use. Keep secrets out of chat and Git. This remains unfinished and is recorded in `AGENTS.md`; the current reservation is complete independently of that follow-up.
