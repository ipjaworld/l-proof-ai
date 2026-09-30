---
name: schedule-l-proof-edition
description: Prepare and commit a reader-facing L-Proof-AI edition, register it through the production briefing API, approve an authorized snapshot, and verify publication and staggered email scheduling. Use when the user requests L-Proof publication or delivery scheduling.
---

# Schedule L-Proof edition

Use the L-Proof repository, normally `D:/2026_project/l-proof-ai`. Read `README.md` (pipeline and automation), `docs/BRIEFING_DELIVERY_SAFETY.md`, and the current briefing API/workflow before executing. The repository copy of this skill is `skills/schedule-l-proof-edition/SKILL.md`.

## Authorization and normal route

- Scheduling requires a user request for publication/delivery; drafting alone is insufficient. A request to schedule the reviewed edition authorizes the normal registration, operator review email, and edition approval steps. Do not ask for the same approval again. It does not authorize approving new subscribers.
- Use the production `POST /api/briefings`, the resulting operator review email, and `/api/briefings/approve`. Never use Wrangler, direct D1 writes, or the historical `schedule-third-edition.mjs` / import / send-now scripts in the normal flow. When the user explicitly requests urgent scheduling through the authenticated Cloudflare dashboard, use that UI without Wrangler: inspect existing rows, insert only the authorized edition with the exact production content hash and approval snapshot, preserve the publication gate, and read back all state/times/hash plus internal-note exclusion. Do not overwrite an existing/sent edition or approve subscribers. Record this exception and the unresolved API authentication work.
- Obtain `BRIEFING_ADMIN_SECRET` from the user's configured secret environment. Never print it, put it in command arguments, or commit it. If absent, ask where the authorized environment is and complete preparation and the commit meanwhile. Do not replace production secrets or use an older Sites DB as a fallback.
- Production is `https://l-proof-ai.xyz` as verified in repository configuration. `.openai/hosting.json` may describe the older Sites deployment; verify its schema and origin before using it as evidence.

## Prepare the exact edition

1. Resolve the issue date in Asia/Seoul. Default to the next regular Monday/Thursday when the conversation makes that intent clear; state the exact date. Use 06:00 review deadline, 08:50 publication, 09:00 delivery start, and 09:05 delivery end, unless the user overrides. Never schedule a past time silently.
2. Inspect the public article feed and any available authenticated edition state. Reuse the edition ID on recovery; do not create duplicate issues. A public feed cannot prove that no unpublished reservation exists.
3. Create a manifest in `content/editions/` with edition identity, source draft, and the three explicit timestamps. Run `node scripts/prepare-briefing.mjs <manifest> <output-directory>`.
4. The generated `reader.md`, `reader.html`, and `payload.json` must exclude frontmatter, editor notes, fact-check/deduplication records, and any operator/subscriber information. Keep source notes for internal review. Inspect table rendering, links, four news sections, and conclusion. Keep the public meaning of the approved text unchanged.
5. Validate preparation and compare the generated payload with the reviewed source. Commit the requested source, manifest, skill, and helper changes with explicit paths. Never commit secrets, approval tokens, subscriber addresses, or unrelated changes. Do not claim Git commit as production registration. Push only if requested or required by an explicitly authorized deployment.

## Register and approve

1. Before registration, reconcile any previous attempt using authenticated state or its operator review email. The current POST upserts and resets approval; retrying after an uncertain response can invalidate an existing approval token. Never blindly retry.
2. Submit the prepared payload using `node scripts/register-briefing.mjs <payload.json>` in the authenticated environment. This sends an operator review email. Inspect the returned content hash and review email ID without exposing private credentials.
3. Read the actual review email via an authorized mailbox/session. Check edition, reader-facing content, date, and times. Use its approval link and POST confirmation when the user's scheduling request authorizes approval. If mailbox access is missing, ask the user for the normal approval step or access; never fabricate a token or write approval directly to D1.
4. Verify the approval response and, where available, authenticated persisted state: `approved`, publication `scheduled`, matching content/approved hashes, and the exact publication/send timestamps. Do not change content after approval without re-registering and re-approving.

## Verify the schedule honestly

- Current production code publishes on the 08:50 cron and creates recipient deliveries at the 09:00 cron. Individual Resend reservations do not exist immediately after edition approval. Report these as separate stages.
- Verify deployed cron configuration when accessible, not merely local config. At publication time verify the canonical article URL and public feed. At send time check individual delivery records/provider email IDs and failures if the user requested continued monitoring and a supported scheduler is available.
- Only currently approved, non-unsubscribed recipients are eligible. Each email has exactly one recipient, no CC/BCC, a delivery row and idempotency key. Preserve the five-minute slot rule: for N > 1, start + round(300000 * index / (N - 1)); for N = 1, start. Actual delivery arrival is not guaranteed by scheduling.
- Distinguish intended schedule, persisted approved schedule, provider acceptance, and delivered status. If verification is unavailable, state exactly which stage remains unverified. Do not bypass the publication gate to create early email reservations.

## Report

Return the commit hash, reader preview path, edition/date/times in KST, registration and approval evidence, and provider scheduling status. Identify any blocker precisely. Keep recipient lists and approval URLs out of Git and ordinary summaries.
