# Issue 08 scheduling record

Verified on 2026-10-14 KST through the user-authenticated Cloudflare dashboard.

## Authorization and final editorial QA

The user explicitly requested applying issue 8 feedback, checking the revised manuscript critically, and sending it if that review found no blocking problem. They explicitly requested Computer Use through the established Cloudflare workflow. This conditional authorization applies only to this revised issue and its Thursday schedule; it does not remove the final-confirmation rule for future editions.

The condition was satisfied before reservation: primary-source recheck and critical reread passed. Three sentences in the L-Proof analysis changed: the previous-issue transition, the sentence about recording search scope, and a clarification from time savings to fewer search repetitions. Opening, closing, section order, subheadings, and reported numbers were preserved. No skill or server-code changes were made for this edition.

Official checks covered Google pricing and ADK measurements, LightOn's ColGrep results and uncertainty (browser source table), Liquid AI specifications and benchmark limits, Cursor availability and marketplace scope, and GitHub's limited Enterprise preview. Published measurements are not represented as independently reproduced tests.

## Exact snapshot and schedule

- Edition: `2026-10-15-thu`, issue 8, source v2.
- Slug: `the-morning-after-ai-worked-all-night`.
- Title: AI가 밤새 일한 다음 날.
- Production database: `l-proof-ai-production`.
- Persisted approval: `approved`; publication: `scheduled`.
- Review deadline: 2026-10-15 06:00 KST.
- Web publication: 2026-10-15 08:50 KST (`2026-10-14T23:50:00.000Z`).
- Email start: 2026-10-15 09:00 KST (`2026-10-15T00:00:00.000Z`), individual slots through 09:05.
- Content/approved hash: `36f02e7a82a720429b75623a53809e99fe0bfa6138e9f3181b190fe5c6782c17`.
- Prepared reader text: 5096 characters; HTML: 7491 characters. Five news sections plus L-Proof analysis, nine real source hyperlinks, no tables or internal notes. Browser rendering inspected.
- Readback exact snapshot comparison returned 1 for subject, text, HTML, identity metadata, content and approval hashes, and publication/send times. `published_at` and `sent_at` remained null.
- Preflight at 22:39:40 KST: no existing issue 8 reservation, 0 pending subscribers, 41 eligible approved/non-unsubscribed recipients. Post-registration readback again returned pending 0, eligible 41.
- Delivery records: 0, expected before the 09:00 server job. Individual provider reservations, provider acceptance, and actual delivery have not yet occurred or been verified. Eligibility is selected again at send time.

## Execution route and production checks

Used the explicitly authorized Cloudflare dashboard exception. Insert was guarded against duplicate ID, edition number, or slug. Existing editions and subscribers were not modified. No immediate send or early publication occurred. Normal API registration and its operator review email were not used.

The deployed Worker was bound to the production database. Its dashboard showed cron triggers `50 23 * * SUN,WED` (Mon/Thu 08:50 KST), `0 21 * * SUN,WED` (Mon/Thu 06:00 KST), and `0 0 * * *` (daily 09:00 KST). Git integration automatically builds main-branch pushes; this change includes only this edition's source, manifest, and record, without application code.

Secure local admin API authentication and dashboard-free subscriber/schedule verification remain the outstanding automation task. No new credential or server-level human authentication was introduced.

Local preview, payload, verification metadata and screenshot evidence are under ignored `outputs/2026-10-15-thu/`. No subscriber addresses, secrets or approval URLs are committed. Reservation evidence: `reservation-verified.png`.