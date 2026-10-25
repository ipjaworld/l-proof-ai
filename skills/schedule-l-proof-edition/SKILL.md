---
name: schedule-l-proof-edition
description: Prepare and commit a reader-facing L-Proof-AI edition, register it through the production briefing API, approve an authorized snapshot, and verify publication and staggered email scheduling. Use when the user requests L-Proof publication or delivery scheduling.
---

# Schedule L-Proof edition

Use the L-Proof repository, normally `D:/2026_project/l-proof-ai`. Read `README.md` (pipeline and automation), `docs/BRIEFING_DELIVERY_SAFETY.md`, and the current briefing API/workflow before executing. The repository copy of this skill is `skills/schedule-l-proof-edition/SKILL.md`.

## Final manuscript confirmation gate

Current operating decision (2026-10-11): use explicit final manuscript confirmation in this chat, enforced by these skill rules. Passkey enrollment and server/permission-level verification of a human approver are deferred until the user requests them again. Do not describe this procedural gate as server-enforced human authentication. Preserve the already authorized issue 7 reservation (2026-10-12-mon) unchanged.

There are two distinct permissions: preparing an edition, and activating publication/delivery of its final version. Complete authorized preparation before asking for the final confirmation.

- Before confirmation, research, edit, fact-check, render previews, inspect subscribers and existing schedules read-only, and prepare a local manifest/payload with proposed KST times. Commit/push only when authorized; a Git push is not manuscript approval. Check connected automation before pushing so an unapproved draft cannot become publishable through Git.
- Show the complete final reader-facing manuscript, its version identifier or production content hash, the issue/date, and proposed publication/send times. End preparation with **준비 완료 · 최종 원고 컨펌 대기** and ask whether to publish/send this exact version. Explain that this gate is the user's L-Proof editorial rule recorded in this skill, not missing authorization for preparation.
- “기존 방식대로 진행”, “푸시랑 예약까지 준비”, “발송 직전까지 세팅”, dashboard login, previous-issue approval, and the agent's quality judgment do not approve a newly written or revised manuscript. “반영해서 보여줘” authorizes editing, not publication.
- Explicit confirmation after the final version is shown (for example, “이 원고로 발송 승인” or an unambiguous “이번 호는 이렇게 보내”) authorizes that version and its agreed schedule. Record the human confirmation and corresponding edition/hash internally. Do not ask again for unchanged, already-approved content and timing.
- Until that confirmation, do not call an approval endpoint/link, set `status=approved`, `approved_at`, or `approved_content_hash`, arm `publication_status=scheduled`, create Resend reservations, publish, or send subscriber email. A future automated send is already activated by an approved reservation; waiting for the scheduled time is not an approval gate.
- Reader-facing edits or schedule changes after confirmation require showing the revised version and renewed confirmation before activating it. Never copy an old approval to a new hash. Before replacing an already scheduled version, ensure the obsolete snapshot cannot send; reconcile its state and use the supported hold/review flow. A formatting-only conversion that preserves the confirmed content can proceed after verifying the rendering.
- Keep subscriber approval separate. This skill does not authorize approving new subscribers.

## Normal route and dashboard exception

- Prefer local preparation until final confirmation. An explicitly requested operator review email may be registered through `POST /api/briefings` before confirmation only after verifying that it remains `review`/`unpublished` and cannot publish or send to subscribers. Describe it as a review copy, not an approved reservation. Never blindly re-register an existing approved edition.
- After final confirmation, use production `POST /api/briefings`, the resulting operator review email, and `/api/briefings/approve`. Use the actual approval link; never fabricate a token. Normal operations must not use Wrangler, direct D1 writes, or historical import/send-now scripts.
- If the user explicitly requests the Cloudflare dashboard exception, it changes only the execution route. Final manuscript confirmation is still required before any approved/scheduled row is written. Inspect existing rows, preserve the exact approved snapshot/hash and publication gate, guard against duplicate ID/issue/slug, and read back state, times, hash, and internal-note exclusion. Never overwrite an existing/sent edition or approve subscribers. Record the exception and unresolved API authentication work.
- Obtain `BRIEFING_ADMIN_SECRET` from the user's configured secret environment. Never print it, put it in command arguments, or commit it. If absent, complete preparation first and ask for the authorized environment only when required. Do not replace production secrets or use an older Sites DB as a fallback.
- Production is `https://l-proof-ai.xyz` as verified in repository configuration. `.openai/hosting.json` may describe the older Sites deployment; verify its schema and origin before using it as evidence.

## Prepare the exact edition

1. Resolve the issue date in Asia/Seoul. Default to the next regular Monday/Thursday when the conversation makes that intent clear; state the exact date. Use 06:00 review deadline, 08:50 publication, 09:00 delivery start, and 09:05 delivery end, unless the user overrides. Never schedule a past time silently.
2. Inspect the public article feed and any available authenticated edition state. Reuse the edition ID on recovery; do not create duplicate issues. A public feed cannot prove that no unpublished reservation exists.
3. Create a manifest in `content/editions/` with edition identity, source draft, and the three explicit timestamps. Run `node scripts/prepare-briefing.mjs <manifest> <output-directory>`.
4. The generated `reader.md`, `reader.html`, and `payload.json` must exclude frontmatter, editor notes, fact-check/deduplication records, and any operator/subscriber information. Keep source notes for internal review. Inspect table rendering, actual source-link hrefs, every included news section, and conclusion. Keep the public meaning of the approved text unchanged.
5. Validate preparation and compare the generated payload with the reviewed source. Commit the requested source, manifest, skill, and helper changes with explicit paths. Never commit secrets, approval tokens, subscriber addresses, or unrelated changes. Do not claim Git commit as production registration. Push only if requested or required by an explicitly authorized deployment.

## Register and approve

Enter this stage only after the final manuscript confirmation gate above is satisfied (except an explicitly requested unapproved operator review copy). Recompute the payload hash and compare it with the confirmed version before activation.

1. Before registration, reconcile any previous attempt using authenticated state or its operator review email. The current POST upserts and resets approval; retrying after an uncertain response can invalidate an existing approval token. Never blindly retry.
2. Submit the prepared payload using `node scripts/register-briefing.mjs <payload.json>` in the authenticated environment. This sends an operator review email. Inspect the returned content hash and review email ID without exposing private credentials.
3. Read the actual review email via an authorized mailbox/session. Check edition, reader-facing content, date, and times. Use its approval link and POST confirmation only when the user has explicitly confirmed the displayed final manuscript and schedule. If mailbox access is missing, ask the user for the normal approval step or access; never fabricate a token or write approval directly to D1.
4. Verify the approval response and, where available, authenticated persisted state: `approved`, publication `scheduled`, matching content/approved hashes, and the exact publication/send timestamps. If content changes, obtain renewed human confirmation before re-registering and re-approving; repeating the technical approval call alone is not human confirmation.

## Verify the schedule honestly

- Current production code publishes on the 08:50 cron and creates recipient deliveries at the 09:00 cron. Individual Resend reservations do not exist immediately after edition approval. Report these as separate stages.
- Verify deployed cron configuration when accessible, not merely local config. At publication time verify the canonical article URL and public feed. At send time check individual delivery records/provider email IDs and failures if the user requested continued monitoring and a supported scheduler is available.
- Only currently approved, non-unsubscribed recipients are eligible. Each email has exactly one recipient, no CC/BCC, a delivery row and idempotency key. Preserve the five-minute slot rule: for N > 1, start + round(300000 * index / (N - 1)); for N = 1, start. Actual delivery arrival is not guaranteed by scheduling.
- Distinguish intended schedule, persisted approved schedule, provider acceptance, and delivered status. If verification is unavailable, state exactly which stage remains unverified. Do not bypass the publication gate to create early email reservations.

## Report

Distinguish preparation complete / awaiting final manuscript confirmation / registered for review / approved schedule / provider reservations / delivered. Return the commit hash when present, reader preview path, edition/date/times in KST, human confirmation and snapshot evidence, registration state, and provider scheduling status. Do not report a local manifest or review-only registration as a completed reservation. Identify any blocker precisely. Keep recipient lists and approval URLs out of Git and ordinary summaries.
