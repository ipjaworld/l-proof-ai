---
name: make-l-proof-draft
description: Research and edit Korean L-Proof-AI newsletters with primary sources, independent news selection, and clearly attributed L-Proof analysis. Use only when explicitly invoked or asked to make an L-Proof draft; follow the requested research, review, or revision stage.
disable-model-invocation: true
---

# Make L-Proof Draft

Create a reviewable newsletter that helps readers see what was worth noticing this week. Preserve factual accuracy and an identifiable editorial perspective without turning the issue into a research report. Drafting does not authorize subscriber approval, edition registration, publication, or email delivery.

## Locate the project and establish the task

Prefer the current repository when it contains `docs/HANDOFF_SENDING_AGENT.md` and `lib/briefing-workflow.ts`; otherwise locate the saved L-Proof-AI project or `D:/2026_project/l-proof-ai`.

Read applicable `AGENTS.md`, `docs/POSITIONING.md`, and relevant recent editions. For subscriber or publication operations also read `docs/HANDOFF_SENDING_AGENT.md` and `docs/BRIEFING_DELIVERY_SAFETY.md`. Current user instructions take priority over legacy templates such as mandatory `Lee's Take` sections.

Match the requested stage:

- **New draft or re-research:** research and select news before choosing a unifying interpretation. If asked to rebuild, treat the existing draft as reference material, not a structure to preserve.
- **Editorial review only:** use the latest user-supplied manuscript as the baseline. Quote exact sentences, explain the reading or reasoning problem, and offer replacements. Distinguish high-priority corrections from optional taste changes. Do not edit when the user asks to approve candidates first.
- **Apply approved changes:** use that same baseline and the accepted candidates. Make only necessary adjacent joins or deduplication; preserve the rest of the polished wording. Do not replace it with an older repository draft. “반영해서 보여줘” authorizes those edits; show the complete revised reader-facing manuscript, not just a link.

A wording-only review does not automatically require fresh research, subscriber queries, or publication operations. Do not claim to have reverified sources during an editing-only pass.

## Research and select news

- Default to approximately the latest six calendar days including the drafting date, in Asia/Seoul unless specified otherwise. State the exact range and drafting cutoff. Research the full window even when it overlaps the previous issue.
- Search broadly across AI development, coding agents, infrastructure, models, and developer tools. Verify included factual claims against primary sources: official announcements, changelogs, documentation, repository releases, papers, or recorded direct tests.
- Check the underlying event date separately from the page publication date. Distinguish an original study from a later follow-up or availability change. Do not assign a KST release time to a date-only source.
- Compare with published editions and drafts covering the window. Deduplicate by underlying event and claims, not merely company, product, title, or URL. A material new release, changed availability or pricing, correction, or new evidence can justify revisiting a topic; explain the change.
- Choose each item for its own news value before connecting it to the others. Do not discard worthwhile unrelated news merely to make every item support a theme. Do not force a quota: a short news week should produce fewer or shorter items.
- Keep a brief internal record of selection, exclusions, duplicate events, and unresolved claims. Do not modify earlier editions as part of deduplication.

Use proof levels consistently:

- `01 · 전망·루머`: forecast or unconfirmed report; normally exclude as news.
- `02 · 보도 기반`: reporting without direct primary confirmation.
- `03 · 공식 확인`: primary-source confirmation, not independent reproduction.
- `04 · 직접 테스트`: primary confirmation plus actual reproduction with recorded evidence.

Proof levels describe factual verification. L-Proof's analysis or forecast does not become officially confirmed because it appears beside level 03 news. Never invent dates, features, metrics, quotes, URLs, tests, or firsthand experience. Label synthetic examples, controlled experiments, and explanatory hypotheticals accurately.

## Compose the newsletter

Write in Korean. The preferred shape is an opening, independently useful news items, then a distinct `L-Proof의 해석` section. Adapt lengths and headings to the material; this is not a fixed form or item count.

### Opening and news

- Open with a concrete scene, useful question, or observation from the selected material. Let the title reflect the issue rather than a thesis imposed before research.
- Give readers the new information, relevant date, conditions, limits, and primary links. Cite sources beside the claims. Introduce a common proof level once when it applies to all items; flag exceptions individually. Explain its meaning for new readers (official-source confirmation, not independent testing), rather than relying on a number alone.
- Let a small amount of editorial perspective explain why an item was selected. A concrete failure case, practical question, or unusual method can do this without a separate opinion block.
- Avoid repeating `발표 → 동작 설명 → 한계 → 교훈` for every item, or mandatory `사실 요약 / 개발자에게 중요한 점 / Lee's Take / 이번 주 해볼 일` subheadings. News should read as news, not a checklist or manual.
- Give short announcements only as much space as their information warrants. Do not pad them with generic implications or compulsory reader homework.

### L-Proof's interpretation

- Attribute AI-assisted interpretation to **L-Proof**, not Lee or the user. Do not invent “저는”, “저라면”, personal experience, or `Lee's Take`. Attribute personal views to Lee only when he actually supplies them.
- Build on observations already introduced in the news so this does not read like an unrelated essay. Prefer a few developed questions over many tidy lesson headings; do not enforce a fixed number.
- Go beyond safe restatements such as “검증도 비용이 든다.” Explain a mechanism, tradeoff, or consequence: extra checks can share the same blind spot, so more checks need not mean independent evidence.
- Distinguish what the sources establish from L-Proof's conditional inference. A few announcements do not prove an industry-wide trend. Consider countervailing costs, alternative explanations, and evidence that would change the conclusion when relevant.
- Seek a sharper observation, not stronger unsupported certainty. End with a specific unresolved question or outcome worth watching rather than a grand, generic conclusion.

## Editorial QA before presenting

Assess observable prose and reasoning, not whether a sentence was supposedly written by AI. A natural voice comes from specific observations and varied rhythm, not invented anecdotes or forced informality.

Check these recurring problems in context:

1. **Repeated announcements before the point:** “결과를 보여주는 방식도 흥미롭습니다”, “또 하나 알아둘 점이 있습니다”, “흥미롭게 느낀 부분은 여기입니다.” Keep useful transitions, but remove repeated lead-ins when the observation can begin directly.
2. **Abstract or overqualified wording:** make the actor and action clear. “이 선택을 설정 가능한 기능으로 만든 사례입니다” can become “어떤 답을 다른 모델에게 다시 물을지 개발자가 조건을 정할 수 있습니다.” Preserve technical conditions and uncertainty that matter.
3. **Needlessly nested questions:** “어디까지 확인해야 다음 단계로 넘어가도 된다고 볼 수 있을까요” can become “무엇을 확인하면 다음 단계로 넘어가도 될까요?”
4. **False logical bridges:** a recorded pass does not establish that every stage did its job. If the example concerns a shared missing input, address that blind spot, not suddenly conflicting judgments. Introduce a hypothetical before describing it.
5. **Over-segmented paragraphs and duplicate explanations:** join sentences describing one sequence when helpful. Keep deliberate pauses; do not merge everything into dense paragraphs or re-explain a point already clear.
6. **Generic or inflated endings:** “안전장치를 넘어 실제 운영 부담을 줄였다고 말할 수 있을 것 같습니다” may add little after concrete questions. “L-Proof는 다음 발표에서 이 두 질문에 대한 답을 보고 싶습니다” can be enough. These examples illustrate decisions, not stock phrases to reuse every issue.

After edits, compare the actual saved file against the baseline and accepted changes. Check partial replacements, lost punctuation or emphasis, duplicate paragraphs, changed attribution, and missing links. When describing only part of an API or product, make that scope clear rather than implying an exhaustive list. Use file-safe editing; do not embed Korean smart quotes in fragile shell string replacements. Read back affected passages rather than assuming successful execution means correct prose.

When producing reader HTML or a publishing payload, inspect the rendered result, verify actual source-link hrefs (not just labels), and verify that its content matches the final text submitted for confirmation or already approved. Exclude frontmatter and sections headed `편집자 메모`, `팩트체크`, or other internal records. Never include subscriber information in reader content.

## Pending subscribers for a full drafting request

Cloudflare's current production database is the source of truth. Follow current project instructions for read-only access; prefer an authenticated operational API when available. If authentication remains unconnected and project instructions specify the logged-in Cloudflare dashboard, use Computer Use. Do not hard-code Wrangler as the required route or treat a historical Sites database as production.

Report the pending count. When nonzero, show relevant signup details privately to the operator only as needed for review; never save addresses in a draft or Git-tracked file. Do not treat missing access as zero pending. Subscriber review does not authorize approval, rejection, or contact. A prose-only follow-up does not require repeating this query.

## Deliver and hand off

Current operating decision (2026-10-11): use explicit final manuscript confirmation in this chat, enforced by these skill rules. Passkey enrollment and server/permission-level verification of a human approver are deferred until the user requests them again. Do not describe this procedural gate as server-enforced human authentication. Preserve the already authorized issue 7 reservation (2026-10-12-mon) unchanged.

- For a new draft, show the complete reader-facing draft, a short separate fact-check/selection note, and the pending-subscriber result or precise access limitation. Save internal notes beneath clearly marked `발행 본문 제외` headings.
- For review-only requests, show actionable revision candidates. For approved revisions, show the complete revised reader-facing text and its saved location when applicable.
- Report only actions actually taken. For a full drafting run, make clear that publication/subscriber approval and scheduling have not been performed by that run. Do not append a false “not scheduled” statement to later work on an already scheduled edition.
- When asked to prepare publication or scheduling, follow `schedule-l-proof-edition` and prepare the reviewable artifacts first. Show the complete final reader-facing manuscript, exact edition/date/times in KST, and a version identifier or content hash. Report **준비 완료 · 최종 원고 컨펌 대기** until the user explicitly approves that displayed version for publication and delivery.
- A broad instruction such as “기존 방식대로 진행”, “푸시랑 예약까지 준비”, or “발송 직전까지 세팅” is preparation authorization, not final manuscript approval. “반영해서 보여줘” approves editing only. Login access, GitHub push authorization, previous-issue approval, and the agent's own quality assessment do not substitute for approval of the final version.
- After the final manuscript has been shown, “이 원고로 발송 승인” or an unambiguous “이번 호는 이렇게 보내” authorizes that exact version. Carry out the authorized scheduling flow without asking for the same approval again. Subscriber approval remains separate.
- Before final confirmation, do not invoke an approval endpoint/link, set production approval fields, enable automatic publication/delivery, or create provider reservations. A future reservation already authorizes an eventual send; it is not merely preparation. The Cloudflare dashboard is subject to the same rule.
- If reader-facing content or the agreed schedule changes after confirmation, show the changed final version and obtain renewed confirmation before activating its schedule. Never transfer an old approval/hash to revised content or leave an obsolete approved snapshot eligible to send while replacing it. Do not re-ask when the approved version and schedule have not changed.
- Content changes after production approval require a new approved snapshot. Distinguish an approved edition schedule from recipient-level provider reservations, which the current server workflow creates at send time. Do not report actual delivery before verifying it.

## Boundaries

- Do not integrate with or depend on HETRICH data for drafting.
- Do not send draft or subscriber email, register an edition, or change subscriber status merely because this skill ran.
- Preserve one-recipient delivery; never use multi-address messages, CC, or BCC for subscribers.
- Keep secrets, approval tokens, and unrelated subscriber data out of chat, drafts, and Git.
