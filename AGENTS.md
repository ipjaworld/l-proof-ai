<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## 우선 후속 과제: 브리핑 예약 자동화

- 사용자는 이 저장소의 새 세션에서도 예약 자동화 개선이 높은 우선순위임을 짧게 알려주길 요청했다. 아직 미완료라면 작업 시작 시 한 번 상기하되, 당장 요청한 작업을 방해하거나 자동으로 범위를 확대하지 않는다.
- 정상 운영의 `BRIEFING_ADMIN_SECRET` 인증 연결과 예약 상태 조회/검증을 개선해야 한다. 서버 cron은 있으나 로컬 등록 인증이 없어 대시보드 작업에 의존했다. 비밀 값은 채팅·Git에 남기지 않는다.
- 2026-10-05 사용자 추가 지시: 자동화 개선의 완료 범위에는 **Computer Use 없이 Cloudflare를 사용할 수 있는 인증·운영 경로 구성**까지 포함한다. 대기 구독자 읽기 전용 조회, 정상 API를 통한 원고 등록·예약, 예약 상태 조회·검증을 대시보드 조작 없이 수행할 수 있어야 한다. 개선 작업은 다음 작업일 우선 과제로 두고, 그전 대기 구독자 조회는 로그인된 Cloudflare 대시보드를 Computer Use로 확인한다. 인증정보는 안전한 로컬/런타임 비밀 저장소로 관리하며 채팅·Git에 기록하지 않는다.
- Wrangler와 원격 D1 직접 변경은 일상 발행 경로로 사용하지 않는다. 사용자가 명시적으로 대시보드 처리를 요청한 긴급 회차만 해당 경로를 사용하고 기록한다.
- 발행은 KST 월·목 08:50 웹 공개, 09:00~09:05 수신자별 개별 분산 발송이다. 원고 승인 예약과 09:00에 생성되는 Resend 개별 예약을 구분해 보고한다.
- 이번 4호 처리 기록은 `docs/ISSUE_04_SCHEDULING.md`, 재사용 절차는 `skills/schedule-l-proof-edition/SKILL.md`를 확인한다. 자동화 개선 완료 후 이 우선 과제 표기를 갱신한다.
- 스킬 정본은 `skills/` 아래에 있다. 스킬을 고치면 설치 사본(`make-l-proof-draft` → `~/.agents/skills`, `schedule-l-proof-edition` → `~/.codex/skills`)과 해시가 같은지 확인한다.

<!-- BEGIN:hetrich-wiki-codex -->
## Codex의 HETRICH Wiki 조회

- 개발·스튜디오 작업 시작 시 `hetrich-wiki` MCP의 `wiki_brief(target="studio")`와 `wiki_brief(target="l-proof")`로 현재 상태와 유효 결정을 확인한다. target이 studio이면 한 번만 호출한다.
- 프로젝트 상태의 원본은 해당 저장소의 STATE·DECISIONS 등 정본 문서다. Wiki는 프로젝트 간 맥락과 결정의 색인이므로 필요한 원본 확인과 기존 인수인계 갱신 규칙을 유지한다.
- 필요한 근거는 `wiki_search`와 `wiki_get`으로 확인한다. 승인 상태, 근거 유형, 기준일과 대체된 결정을 구분하고 불일치를 임의로 확정하지 않는다.
- 재사용할 지식·결정 후보는 해당 MCP의 `wiki_propose`로 제안하며, 제안을 임의로 확정 사실로 승격하지 않는다. 제안 후 `wiki_validate` 결과를 확인한다.
- 토큰 절감 자체를 목표로 정보를 생략하지 않는다. 측정은 큰 변경 뒤 정확도 회귀 확인용으로 사용한다.
- MCP를 사용할 수 없으면 연결 실패를 알리고 `D:/2026_project/hetrich-wiki/hw.cmd` CLI를 사용할 수 있다. CLI에는 개발 작업 `--profile codex`, 취업 작업 `--profile codex-career`를 명시한다. 조회하지 않은 내용을 조회한 것으로 보고하지 않는다.
<!-- END:hetrich-wiki-codex -->
