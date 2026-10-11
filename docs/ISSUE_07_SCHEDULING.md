# Issue 07 scheduling record

Verified on 2026-10-11 KST through the user-authenticated Cloudflare dashboard.

- Edition: `2026-10-12-mon`, issue 7, `ai-gets-a-company-email`.
- Title: AI에게 회사 이메일이 생겼다.
- Source commit: `ebb008d`, pushed to `origin/main`.
- Production database: `l-proof-ai-production`.
- Persisted approval: `approved`; publication: `scheduled`.
- Review deadline: 2026-10-12 06:00 KST.
- Web publication: 2026-10-12 08:50 KST (`2026-10-11T23:50:00.000Z`).
- Email start: 2026-10-12 09:00 KST (`2026-10-12T00:00:00.000Z`), with individual slots through 09:05.
- Pending subscribers: 0. Eligible approved and non-unsubscribed recipients: 41 at verification. No subscriber status changed.
- Content/approved hash: `b5ad38b5aef6e632975f65ba167d5aa8cf7b5f595a36d9b04c3e81423f1cd5a7`.
- Persisted text length 4967 and HTML length 8037 match the prepared snapshot. Internal-note check returned 0; snapshot match returned 1.
- Reader preparation verified source equality, internal-note exclusion, one rendered table, six source links, and five news sections plus L-Proof analysis. Browser preview inspected.
- Delivery records: 0, expected before the 09:00 server job. Individual Resend reservations, provider acceptance, and delivery have not yet occurred or been verified.

## Authorized dashboard exception

The user requested Computer Use through Cloudflare and the established GitHub push/scheduling workflow. The user completed login. The new edition was inserted once using the dashboard console, guarded against an existing ID, issue number, or slug. Read-back confirmed approval, timestamps, snapshot hash, and publication gate. Existing editions and subscribers were not changed. No Wrangler, immediate send, early publication, or application deployment was invoked.

Normal API registration/review email was not used for this dashboard exception. Secure local admin API authentication and dashboard-free read-only status/subscriber access remain the outstanding automation task.

Local previews, verification metadata, and screenshot evidence are under the ignored `outputs/2026-10-12-mon/` directory. No subscriber addresses or approval tokens are committed.

## Deployed scheduler and connected build

The dashboard showed three deployed cron triggers: `50 23 * * SUN,WED` (Mon/Thu 08:50 KST), `0 21 * * SUN,WED` (Mon/Thu 06:00 KST), and `0 0 * * *` (daily 09:00 KST). The production Worker is bound to the production D1 database.

Unlike the README's manual-only deployment description, the current Cloudflare Git integration started a build when `ebb008d` was pushed. No manual deploy action was taken. Reservation persistence was verified independently of the build.
