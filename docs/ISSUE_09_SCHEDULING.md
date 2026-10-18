# Issue 09 scheduling record

Verified on 2026-10-18 KST through the user-authenticated Cloudflare dashboard.

## Human confirmation

The user explicitly approved the complete issue 9 v3.1 manuscript: “이 v3.1 원고로 9호 발행 승인할게”, and requested pending-subscriber inspection and the existing Monday publication/delivery schedule. The approved reader text was preserved. HTML-only formatting converted the GitHub conditions into a blockquote and list; no reader-facing wording changed.

## Exact snapshot and schedule

- Edition: `2026-10-19-mon`, issue 9, source v3.1.
- Slug: `ai-waits-for-a-human-answer`.
- Title: AI는 사람의 답을 기다린다.
- Database: `l-proof-ai-production`.
- Persisted approval: `approved`; publication: `scheduled`.
- Approval timestamp: `2026-10-18T12:06:07.509Z`.
- Review deadline: 2026-10-19 06:00 KST.
- Web publication: 2026-10-19 08:50 KST (`2026-10-18T23:50:00.000Z`).
- Email start: 2026-10-19 09:00 KST (`2026-10-19T00:00:00.000Z`), individual slots through 09:05.
- Content and approved hash: `2661fa0b2241789a4cfbcfe7cd0bc4b41910871fdc7318d93bdfdc711b2f105e`.
- Reader text: 7360 characters; HTML: 10557 characters. Six news sections and L-Proof analysis, 18 actual source hyperlinks, no internal notes. Browser rendering inspected.
- Exact persisted snapshot comparison returned 1 for the subject, text, HTML, identity metadata, content/approval hashes and publication/send times. `published_at` and `sent_at` were null.
- Preflight at 21:05:16 KST found no existing issue 9 reservation, 0 pending subscribers and 41 approved, non-unsubscribed recipients. Post-registration readback again confirmed pending 0 and eligible 41.
- Delivery records: 0, expected before the 09:00 server job. Individual Resend reservations and actual delivery are not yet verified; eligibility is selected again at send time.

## Execution and runtime checks

Used the established user-authorized Cloudflare dashboard exception because local normal API authentication was unavailable. A single insert was guarded against duplicate ID, issue number or slug. Existing editions and subscribers were not changed. No immediate publication or send occurred. Normal API registration and its operator review email were not used.

The deployed Worker was bound to the production database and showed all three cron triggers: `50 23 * * SUN,WED` (Mon/Thu 08:50 KST), `0 21 * * SUN,WED` (Mon/Thu 06:00 KST), and `0 0 * * *` (daily 09:00 KST). Active deployment at verification was `54233a7d`, ready at 100% traffic. No application code or runtime configuration changed for this reservation.

Secure local admin API authentication and dashboard-free subscriber/schedule verification remain outstanding. Chat confirmation remains the human approval procedure; no server-level human authentication was added.

The source, manifest and this record are retained in Git. Ignored local outputs under `outputs/2026-10-19-mon/` contain the reader preview, payload, exact-comparison query, verification metadata and `reservation-verified.png`. No subscriber addresses, secrets or approval URLs are committed.
