# L-Proof-AI 발송 에이전트 인수인계

## 데이터 원본

Cloudflare D1의 `subscribers` 테이블이 구독자 상태의 단일 원본입니다. 발송 대상은 반드시 `status = 'approved'`인 row로 제한합니다. `pending`, `rejected`, `unsubscribed`는 발송하지 않습니다.

권장 조회 필드: `id`, `email`, `name`, `interests`, `status`, `last_sent_at`. 관심 분야는 JSON 배열 문자열입니다.

## 상태 변경

- 승인: `status='approved'`, `approved_at=<ISO timestamp>`, `rejected_at=NULL`, `unsubscribed_at=NULL`
- 거절: `status='rejected'`, `rejected_at=<ISO timestamp>`
- 수신거부: `/unsubscribe` 또는 API가 `status='unsubscribed'`, `unsubscribed_at=<ISO timestamp>`로 변경
- 재신청: 수신거부 row를 새 row로 만들지 않고 `pending`으로 되돌림

운영 UI는 MVP 범위에서 제외됐습니다. 당분간 Cloudflare의 D1 console 또는 승인된 운영 스크립트에서 수정합니다. 변경 전후 row를 확인하고, 여러 row를 일괄 승인하지 않습니다.

## 발송 안전 규칙

1. dry run에서 수신자 수와 주소를 운영자가 확인합니다.
2. 실제 발송 직전에 `approved` 상태를 다시 조회합니다.
3. 한 번의 발송에 사용하는 snapshot과 edition id를 기록합니다.
4. 성공한 row만 `last_sent_at`으로 갱신합니다.
5. `unsubscribed` 주소는 어떤 이유로도 수동 추가하지 않습니다.
6. secret, 전체 구독자 목록, 원문 email은 로그나 Git에 남기지 않습니다.

## 콘텐츠 입력 계약

각 브리핑 항목은 제목, 실제 발표일, 검증 등급, 사실 요약, 개발자 영향, Lee’s Take, 이번 주 할 일, 원문 URL을 가집니다. 예시나 미확인 사실은 실제 발행 데이터로 사용하지 않습니다.

## Secrets

`RESEND_API_KEY`, `EMAIL_FROM`, `OPERATOR_NOTIFICATION_EMAIL`, `RATE_LIMIT_SALT`는 Sites runtime secrets에만 둡니다. `.env.example`에는 값 없이 키만 유지합니다. 브라우저 번들, repository, 업무 문서에 값을 복사하지 않습니다.

## 장애 처리

구독 저장과 운영 알림은 분리되어 있습니다. `notification_status`가 `failed` 또는 `not-configured`여도 신청 row는 남습니다. 운영자는 해당 상태를 조회해 별도로 확인하고, 알림 재시도 때문에 구독 row를 다시 만들지 않습니다.

Double opt-in은 MVP에서 비활성입니다. 도입 전까지 `email_verified_at`은 발송 조건이 아니며, 운영자 수동 승인 책임이 더 큽니다.
