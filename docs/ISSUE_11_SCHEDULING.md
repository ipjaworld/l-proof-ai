# Issue 11 scheduling record

Verified on 2026-10-25 KST through the user-authenticated Cloudflare dashboard.

## Human confirmation

After the full v1 manuscript and the ReChecker/final editorial review with exact replacement proposals, the user said: “좋아 승인할게. 예약발송과 깃커밋 푸쉬까지 진행해줘.” They additionally requested direct Cloudflare handling. This approves issue 11 with the proposed limited corrections and the established Monday schedule. No additional substantive edits were introduced.

The v1.1-approved source incorporates the three proposed analysis corrections, the opening call wording, and a nearby Google security-options source link. The prior chat-only typo was already correct in the saved source.

## Exact snapshot and schedule

- Edition: `2026-10-26-mon`, issue 11.
- Slug: `when-ai-speaks-first`.
- Title: AI가 먼저 말을 걸 때.
- Database: `l-proof-ai-production`.
- Persisted state: `approved`; publication: `scheduled`.
- Review deadline: 2026-10-26 06:00 KST.
- Web publication: 2026-10-26 08:50 KST (`2026-10-25T23:50:00.000Z`).
- Email start: 2026-10-26 09:00 KST (`2026-10-26T00:00:00.000Z`), individual slots through 09:05 KST.
- Content and approved hash: `e359fb65efcab6f480215c89177f541f22e833297c9d629a75540f81e55f7b2e`.
- Reader text: 7652 characters; HTML: 10510 characters. Seven news sections and L-Proof analysis, 16 source links, no internal editorial notes. Reader HTML rendered and inspected in the browser.
- Persisted exact comparison returned 1 for text, HTML, subject, identity metadata, both content hashes and publication/send times. `published_at` and `sent_at` were null.
- Preflight at 2026-10-25 23:43:17 KST: pending 0, approved and non-unsubscribed 41, matching edition ID/number/slug 0.
- Delivery rows remain 0, as expected before the scheduled 09:00 server run. Resend recipient reservations and actual delivery are not yet verified. Recipients are selected again at send time.

## Execution and runtime checks

The user explicitly requested the Cloudflare dashboard exception. Local normal API authentication remained unavailable. A guarded insert created only this approved edition; no existing edition or subscriber was modified. The normal registration API and its operator review email were not used. The chat confirmation is the human approval procedure, not server-enforced human authentication.

The deployed Worker was bound to the production D1 database. All three cron triggers were present: `50 23 * * SUN,WED`, `0 21 * * SUN,WED`, and `0 0 * * *`. Active deployment before the Git push was `54233a7d`, ready at 100% traffic. No runtime settings were edited.

Cloudflare's connected Git build configuration was enabled for main with include path `*`, build command `npm run build`, and deploy command `npm run deploy:cloudflare`. This differs from the README's statement that main pushes do not automatically deploy. The user-authorized push can therefore start a Cloudflare build. The pending local commits for issues 9 and 10, and this issue's changes, contain only manuscripts, manifests and scheduling records; no application code changes are included. Unrelated working-tree changes to AGENTS.md, docs/POSITIONING.md and the scheduling skill are excluded from this commit.

Secure local admin API authentication and dashboard-free registration/state verification remain outstanding. Ignored outputs under `outputs/2026-10-26-mon/` retain reader previews, the payload, comparison query, verification metadata and `reservation-verified.png`. No subscriber addresses, credentials or approval links are committed.
