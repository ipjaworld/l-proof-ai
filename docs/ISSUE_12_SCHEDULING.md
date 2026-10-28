# Issue 12 scheduling record

Verified 2026-10-28 KST through the user-authenticated Cloudflare dashboard.

## Approval and unchanged manuscript

After the full issue 12 v1 manuscript was shown, the user confirmed: “나는 이번호에 대해서 만족해 승인이야”. They then explicitly requested tomorrow Thursday's established web/email schedule, direct Cloudflare handling, and Git commit/push. This supersedes the earlier preparation-only limits for this exact edition.

- Source: `content/drafts/2026-10-29-v1.md`, retained without reader-facing edits.
- Reader SHA-256: `6c2ad5409c6d0222de918f3921ba0d3ec916d99473d19e5db41dbd1d731072ab`.
- Edition: `2026-10-29-thu`, number 12, slug `ai-at-the-approval-button`.
- Title/preview: AI가 승인 버튼 앞에 앉았다.
- Production content/approved hash: `8ebe0002cd2d42696cdd876b15236f021bdec71d74dc24643ce95f7c95f8d9c4`.
- Reader: 7,746 characters, HTML 10,823 characters, eight news sections plus interpretation, 15 links. Source equality, approved reader hash, internal-note exclusion and rendered HTML were checked.

## Persisted reservation

- State: `approved` / publication `scheduled`.
- Review deadline: 2026-10-29 06:00 KST.
- Web publication: 2026-10-29 08:50 KST (`2026-10-28T23:50:00.000Z`).
- Email window: 2026-10-29 09:00–09:05 KST, start `2026-10-29T00:00:00.000Z`.
- Exact database comparison of identity, subject, preview, text, HTML, tags, proof level, both hashes and three timestamps returned 1. Hero image is null. Published/sent timestamps remain null.
- Preflight: matching ID/number/slug 0; existing deliveries 0; pending subscribers 0; approved and non-unsubscribed 39. No subscriber status was changed.
- After registration deliveries remain 0. Recipient-specific Resend reservations will be created by the 09:00 server job, using then-eligible recipients. Provider acceptance and actual delivery have not yet occurred/been verified.

## Route and runtime

The user explicitly requested the dashboard exception. A guarded INSERT in the production D1 console created only the approved issue 12 snapshot after confirming no duplicate. No registration/review email or approval URL was used; the human approval is the chat confirmation. No secrets or subscriber addresses were extracted or committed. Secure normal admin API authentication remains a separate unfinished task.

Worker l-proof-ai is bound to DB l-proof-ai-production. Actual deployed triggers were read: `50 23 * * SUN,WED`, `0 21 * * SUN,WED`, `0 0 * * *`. The active deployment before this push was `fd532db4`, Ready, 100% traffic, associated with commit `372e5d7`.

Main pushes trigger Cloudflare Git builds according to the current README and observed deployment history. This user authorized the push. Only this edition's source, QA, manifest and reservation record are included; no application code or migration changes. The independently prepared execution-handoff document is left untouched and unstaged.

Ignored outputs `outputs/2026-10-29-thu/` contain reader previews, payload, preparation/comparison SQL, verification metadata and `reservation-verified.png`. The SQL/token hashes are not committed. Push/build outcome is reported in the task's final response after live verification.
