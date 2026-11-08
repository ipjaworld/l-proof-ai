# 15호 승인·예약 작업 기록

## 사용자 승인과 고정본

- 사용자는 2026-11-08 대화에서 독자용 최종 원고 전체와 회차·일정·해시를 확인한 뒤 “응 이 정도의 수정만 하고 승인한거로 할게”, “예약까지 진행하자”라고 지시했다. 이어 “클라우드 플레어 내장 브라우저에서 진행해줘”라고 이번 회차의 대시보드 경로를 명시했다.
- 승인 원고: `content/drafts/2026-11-09.md`, `draft_version: v1.1-private`. 원고 SHA-256 `754b42502a8629c7387c160f148f0236c6df6281e94a0c0d507b93632e207acf`.
- manifest: `content/editions/2026-11-09-mon.json`. ID `2026-11-09-mon`, 회차 15, slug `when-agents-follow-todos`.
- 독자용 산출물: `outputs/2026-11-09-mon/reader.md`, `reader.html`, `payload.json`. payload SHA-256 `41c8d835eebd1a7a5c6b1ceef5712e28348c38afa459cac6dc1cae7cc460df08`. production content hash `35312ee81e93999b4a3271ab03561be870b66d581581bcc39e7eea12404b8e18`.
- 준비 검증: 독자용 본문과 HTML이 payload와 일치, 출처 링크 8개의 href 순서 일치, 내부 메모 제외. 승인 원고와 manifest의 로컬 커밋은 `6d323f0`이다. 이 커밋을 원고 승인이나 운영 등록의 근거로 사용하지 않았다.

## Production 등록·조회

- 정상 `BRIEFING_ADMIN_SECRET` 인증 경로가 로컬 환경에 연결되지 않아, 사용자가 명시한 Cloudflare 내장 브라우저의 production D1 `l-proof-ai-production` 콘솔에서 이번 회차를 처리했다. Wrangler와 원격 D1 CLI는 사용하지 않았다. 비밀 값은 읽거나 기록하지 않았다. 정상 API 인증·운영 경로 개선은 미완료 후속 과제다.
- 등록 직전 ID·회차·slug 중복 조회는 0건이었다. 중복 방지 조건을 포함한 INSERT를 1회 실행했다. 구독자 승인 상태는 변경하지 않았다.
- 저장된 행은 `status=approved`, `publication_status=scheduled`, `content_hash=approved_content_hash=35312ee81e93999b4a3271ab03561be870b66d581581bcc39e7eea12404b8e18`이다. 전체 본문·HTML·제목·미리보기·태그·해시·승인 및 예약 시각을 저장된 행과 비교한 읽기 전용 SQL에서 `exact_snapshot_match=1`을 확인했다.
- `review_due_at=2026-11-08T21:00:00.000Z` (11/09 06:00 KST), `scheduled_publish_at=2026-11-08T23:50:00.000Z` (11/09 08:50 KST), `scheduled_send_at=2026-11-09T00:00:00.000Z` (11/09 09:00 KST). 확인 시점의 `published_at`과 `sent_at`은 NULL이었다.
- 운영 Worker `l-proof-ai` production 대시보드에서 cron 세 개 `0 21 * * SUN,WED`, `50 23 * * SUN,WED`, `0 0 * * *`를 확인했다. 각각 월·목 06:00 KST 검토, 08:50 KST 공개, 매일 09:00 KST 발송 검사에 해당한다. 정확한 수신자별 Resend 개별 예약은 09:00 cron에서 생성되므로 현재 생성·전달 완료로 보고하지 않는다.
- 대시보드 검증 탭은 `exact_snapshot_match=1` 결과가 보이는 상태로 내장 브라우저에 남겼다. SQL 입력·검증 자료는 Git 제외 `outputs/`에만 있다.

**상태: 15호 production 원고 승인 예약 완료. 웹 공개, 수신자별 09:00~09:05 KST Resend 예약, 실제 전달은 실행 뒤 별도 확인 대상.**

## 실행 뒤 확인

1. 11/09 08:50 KST 이후 정규 글 URL·공개 피드와 `published_at`을 확인한다.
2. 11/09 09:00 KST 이후 `briefing_deliveries`의 수신자별 예약 ID·실패 상태를 확인한다. 등록 전 구독자 수는 발송 시점의 확정 수신자 수가 아니다.
3. 정상 API 인증·등록·예약 상태 조회를 Computer Use 없이 수행할 경로를 별도 자동화 개선 작업에서 마련한다. 이번 대시보드 예외를 일상 운영 경로로 일반화하지 않는다.
