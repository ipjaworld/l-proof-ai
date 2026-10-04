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
