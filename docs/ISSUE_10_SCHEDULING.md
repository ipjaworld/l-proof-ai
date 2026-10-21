# Issue 10 scheduling record

Verified on 2026-10-21 KST through the user-authenticated Cloudflare dashboard.

## Human confirmation

The user explicitly approved the final manuscript: “이 최종 원고로 10호 발행 승인할게” and requested pending-subscriber inspection and the existing Thursday publication/delivery schedule. The source retains its v1 metadata and contains exactly the five approved sentence revisions. No additional reader-facing edits were made during scheduling.

## Exact snapshot and schedule

- Edition: `2026-10-22-thu`, issue 10.
- Slug: `choosing-what-ai-should-remember`.
- Title: AI에게 남길 경험을 고르는 일.
- Database: `l-proof-ai-production`.
- Persisted approval: `approved`; publication: `scheduled`.
- Review deadline: 2026-10-22 06:00 KST.
- Web publication: 2026-10-22 08:50 KST (`2026-10-21T23:50:00.000Z`).
- Email start: 2026-10-22 09:00 KST (`2026-10-22T00:00:00.000Z`), individual slots through 09:05.
- Content and approved hash: `644db059d453f9e0da70e712dd19d61950ec6df9f91fa70bd01169147ef0e986`.
- Reader text: 6971 characters; HTML: 9934 characters. Six news sections and L-Proof analysis, 14 source hyperlinks, no internal notes. Browser rendering inspected.
- Exact persisted snapshot comparison returned 1 for the subject, text, HTML, identity metadata, content/approval hashes and publication/send times. `published_at` and `sent_at` were null.
- Preflight at 20:05:27 KST found no existing issue 10 reservation, 0 pending subscribers and 41 approved, non-unsubscribed recipients. Post-registration readback again confirmed pending 0 and eligible 41.
- Delivery records: 0, expected before the 09:00 server job. Individual Resend reservations and actual delivery are not yet verified; eligibility is selected again at send time.

## Execution and runtime checks

Used the established user-authorized Cloudflare dashboard exception because local normal API authentication was unavailable. A single insert was guarded against duplicate ID, issue number or slug. Existing editions and subscribers were not changed. No immediate publication or send occurred. Normal API registration and its operator review email were not used.

The deployed Worker was bound to the production database and showed all three cron triggers: `50 23 * * SUN,WED` (Mon/Thu 08:50 KST), `0 21 * * SUN,WED` (Mon/Thu 06:00 KST), and `0 0 * * *` (daily 09:00 KST). Active deployment was `54233a7d`, ready at 100% traffic. No application code or runtime configuration changed.

Secure local admin API authentication and dashboard-free subscriber/schedule verification remain outstanding. Chat confirmation remains the human approval procedure; no server-level human authentication was added.

The source, manifest and this record are retained in a local Git commit. No push or deployment was performed for this reservation. Ignored outputs under `outputs/2026-10-22-thu/` contain the reader preview, payload, exact-comparison query, verification metadata and `reservation-verified.png`. No subscriber addresses, secrets or approval URLs are committed.
