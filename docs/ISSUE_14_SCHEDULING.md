# 14호 승인·예약 작업 기록

## 사용자 승인과 고정본

- 사용자는 2026-11-05 대화에서 14호 독자용 원고 전체를 본 뒤 “응 승인할게 아직 시간 있으니까 원래 예약 하던대로 하자”라고 지시했다.
- 승인 원고: `content/drafts/2026-11-05.md`, `draft_version: v1-private`. 원고 SHA-256 `351997574768a1b7bacee5a8bd5fbfcae780852e460b8d52151bcdd42ee0a3a8`.
- manifest: `content/editions/2026-11-05-thu.json`. ID `2026-11-05-thu`, 회차 14, slug `git-and-review-after-coding-agents`.
- 원고 승인 시각은 정규 06:00 검토 마감을 지난 뒤였다. 이번 회차 검토 마감은 08:40 KST로 잡았고, 정규 웹 공개 08:50 KST 및 이메일 발송 시작 09:00 KST는 유지했다. 수신자별 Resend 예약 범위는 09:00~09:05 KST.
- `scripts/prepare-briefing.mjs`로 독자용 `reader.md`, `reader.html`, `payload.json`을 `outputs/2026-11-05-thu/`에 생성했다. payload SHA-256 `c5e686f4cb9e31f755cd85ad071962043a3b5e867a95b3ef8fe4bcef3cc1e251`.
- `lib/briefing-workflow.ts`와 같은 입력 순서로 계산한 production content hash는 `8e9cc316b3d0639f625254b4a77807ad06fc39fbe7fe6cb15f16948667b001e9`.
- 준비 검증: payload가 승인 원고의 독자용 부분과 일치, reader와 HTML이 payload와 일치, 출처 링크 8개의 href 순서 일치, 내부 편집자 메모와 팩트체크 기록 제외. 독자 원고 3,739자, HTML 5,294자.

## Production 등록·조회

- 로컬 프로세스와 Git 제외 `.dev.vars`에 `BRIEFING_ADMIN_SECRET` 연결이 없었다. 사용자의 기존 Cloudflare 브라우저 방식 지시를 따라 로그인된 대시보드에서 이번 14호를 직접 처리했다. 비밀 값은 읽거나 기록하지 않았다. 정상 API 인증 경로 개선은 별도 미완료 과제다.
- production D1 `l-proof-ai-production` 콘솔에서 등록 직전 ID·회차·slug 중복 0건을 두 번 확인했다. 등록 전 승인·미해지 구독자 39명, 승인 대기 2명, 이 회차 delivery 0건. 구독자 상태를 바꾸지 않았다.
- 중복 방지 조건을 포함한 INSERT를 1회 실행했다. 저장된 14호는 `status=approved`, `publication_status=scheduled`, 두 콘텐츠 해시가 위 production hash와 같다.
- 전체 원고·HTML·제목·미리보기·태그·해시·세 시각을 저장된 행과 대조하는 읽기 전용 SQL에서 `exact_snapshot_match=1`을 확인했다. `review_due_at=2026-11-04T23:40:00.000Z`, `scheduled_publish_at=2026-11-04T23:50:00.000Z`, `scheduled_send_at=2026-11-05T00:00:00.000Z`. 등록 직후 `published_at`과 `sent_at`은 NULL이었다.
- 운영 Worker `l-proof-ai` production 설정에서 이 D1 바인딩과 11/04 23:50 UTC 공개 Cron, 11/05 00:00 UTC 발송 Cron의 다음 실행 시각을 확인했다. 06:00 KST 검토 Cron의 다음 실행은 이번 승인 이전에 이미 지나 있었다.
- 대시보드 검증 화면은 `outputs/2026-11-05-thu/cloudflare-exact-match.png`에 보관했다. SQL 입력과 검증 자료도 Git 제외 `outputs/`에만 둔다.

**상태: 14호 production 승인 예약 완료. 웹 공개와 Resend 수신자별 개별 예약·실제 전달은 아직 별도 검증 대상.**

## 실행 뒤 확인

1. 11/05 08:50 KST 이후 공개 피드·정규 글 URL과 `published_at` 확인.
2. 11/05 09:00 KST 이후 `briefing_deliveries`의 개별 Resend 예약 ID와 실패 상태 확인. 등록 전 39명은 사전 조회치이며 발송 시점의 확정 수신자 수가 아니다.
3. 정상 API 인증·등록·예약 조회를 Computer Use 없이 수행할 경로를 후속 자동화 작업에서 마련한다. 이번 D1 대시보드 예외 경로를 일상 운영 경로로 일반화하지 않는다.
