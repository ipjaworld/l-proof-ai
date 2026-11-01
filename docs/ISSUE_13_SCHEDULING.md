# 13호 등록·예약 작업 기록

## 사용자 승인과 대상

- 사용자 승인: 2026-11-01 대화에서 13호 v1.1 독자용 원고 전체를 제시한 뒤, 사용자가 “오케이. 이거 승인할게. 등록, 예약 해줘”라고 지시했다.
- 승인 원고: `content/drafts/2026-11-02.md`, `draft_version: v1.1-private`.
- 원고 파일 SHA-256: `b68dc800463fdb636471fec91fc6c12e9d46bbcd2c5d8c80e21d7e45d37eb018`. 준비 시 재계산 결과 일치.
- 이번 승인에 해당하는 정규 일정: 2026-11-02 월요일 검토 마감 06:00, 웹 공개 08:50, 이메일 개별 분산 발송 09:00~09:05 KST.

## 준비된 고정본

- manifest: `content/editions/2026-11-02-mon.json`. ID `2026-11-02-mon`, 회차 13, slug `revising-delegated-ai-work`.
- `node scripts/prepare-briefing.mjs content/editions/2026-11-02-mon.json outputs/2026-11-02-mon` 실행 완료.
- 생성 결과: `outputs/2026-11-02-mon/reader.md`, `reader.html`, `payload.json`.
- 준비 payload 파일 SHA-256: `fe023a0bf60cd34185964fde3cc4d871be5a74c9f2f35127e7bbaeae2db3eefa`.
- `lib/briefing-workflow.ts`의 `contentHash`와 같은 입력 순서로 계산한 production content hash: `78830854b92eb0ffaaf0289dbd6e102763672d9c52607fffeb877255ff527fdb`.
- 검증: reader 내용이 승인 원고의 독자용 부분과 정확히 일치, HTML과 payload 일치, 출처 링크 7개의 href 순서 일치, 뉴스 4개와 해석 포함, frontmatter·내부 메모·구독자 내용 제외, 검토 마감 미래 시각.
- 브라우저에서 로컬 `file:` HTML을 열어 보는 작업은 Browser Use URL 정책이 거부했다. 다른 브라우저 경로로 우회하지 않았다. 따라서 시각적 렌더링 검수 완료로 기록하지 않는다.

## Production 등록·검증

- 공개 API에서 최신 글은 12호로 보였고, 운영자 Gmail에서 13호 검토 메일도 검색되지 않았다. 둘 다 비공개 예약 부재의 근거로 사용하지 않았다.
- 로컬에 `BRIEFING_ADMIN_SECRET` 인증 연결이 없어 정상 API 경로를 사용할 수 없었다. 사용자가 Codex 내장 브라우저의 Cloudflare 대시보드 경로를 명시해 이번 회차에 한해 직접 등록했다. 비밀 값은 읽거나 기록하지 않았다.
- 로그인한 Cloudflare production D1 `l-proof-ai-production` 콘솔에서 ID·13호·slug 중복 0건을 확인했다. 승인 대상이 아닌 구독자 상태는 변경하지 않았다.
- 등록 전 읽기 전용 조회: 승인 구독자 39명, 대기 1명, 구독 해지 2명. 이 회차 기존 delivery 0건. 실제 발송 대상은 발송 시점의 승인·미해지 상태로 결정된다.
- 2026-11-01 KST, `briefing_editions`에 승인된 13호 원고와 HTML, 해시, 세 시각을 중복 방지 조건으로 1회 등록했다. 상태는 `approved` / `scheduled`.
- 재조회: ID `2026-11-02-mon`, 회차 13, slug `revising-delegated-ai-work`, 두 해시 모두 `78830854b92eb0ffaaf0289dbd6e102763672d9c52607fffeb877255ff527fdb`, 독자 원고 3,874자, HTML 5,499자. `published_at`, `sent_at`은 아직 NULL.
- 승인된 원고와 HTML, 제목·미리보기·태그·해시·시각 등 저장된 스냅샷을 대조하는 읽기 전용 SQL의 `exact_snapshot_match`가 `1`이었다. 검토 마감 `2026-11-01T21:00:00.000Z`(11/02 06:00 KST), 웹 공개 `2026-11-01T23:50:00.000Z`(08:50 KST), 발송 시작 `2026-11-02T00:00:00.000Z`(09:00 KST).
- 운영 Worker `l-proof-ai` production 설정에서 D1 바인딩 `l-proof-ai-production`, Cron 11/01 21:00 UTC(검토 마감), 23:50 UTC(웹 공개), 11/02 00:00 UTC(발송)를 확인했다. 현재 배포는 트래픽 100%로 표시됐다.
- 검증 화면: `outputs/2026-11-02-mon/cloudflare-exact-match.png` (Git 제외). 등록 SQL·대조 SQL과 실행 보조 파일도 `outputs/`에만 둔다.

**상태: production 승인 예약 완료. 08:50 웹 공개와 09:00 수신자별 Resend 예약은 Cron 실행 전이라 아직 발생하지 않았다.**

## 후속 확인

1. 11/02 08:50 KST 이후 공개 피드와 정규 글 URL, `published_at`을 확인한다.
2. 11/02 09:00 KST 이후 개별 `briefing_deliveries`와 Resend 예약 ID·실패 여부를 확인한다. 등록 당시 39명은 사전 조회치이며 발송 대상 확정치가 아니다.
3. 별도 자동화 개선 작업에서 `BRIEFING_ADMIN_SECRET`을 안전한 로컬/런타임 비밀 저장소에 연결하고, Computer Use 없이 정상 API로 등록·예약·상태 조회를 수행하는 경로를 마련한다. 이번 대시보드 직접 등록을 일상 절차로 일반화하지 않는다.
