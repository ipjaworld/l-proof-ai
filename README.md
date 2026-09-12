# L-Proof-AI

AI가 모으고 사람이 증명하는, 개발자를 위한 주 2회 검증 브리핑 랜딩 MVP입니다. Gate 1과 Gate 2 승인을 거쳐 전체 랜딩과 `Submit → Store → Notify` 흐름을 production에 공개했습니다.

## Local development

```bash
npm install
npm run dev
```

기본 주소는 `http://localhost:5173`입니다. D1을 처음 준비할 때는 build 이후 다음 명령으로 migration을 적용합니다.

```bash
npm run build
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_lproof_subscribers.sql
```

## Architecture

- Vinext / React / TypeScript
- Cloudflare Sites runtime
- Cloudflare D1: `subscribers`, `request_limits`
- Resend HTTP API: 신규 신청 및 해지 운영자 알림
- Web form과 WebMCP `request_lproof_briefing` 도구가 같은 `/api/subscribe` 경로 사용

브라우저에는 email provider secret이 전달되지 않습니다. API는 이메일을 소문자로 정규화하고 unique index와 upsert로 중복 row를 막습니다. 허니팟, 8KB 요청 제한, IP 기준 10분당 5회 제한을 적용합니다. 접수는 하루 200건, 운영자 이메일은 하루 25건으로 절대 상한을 두어 분산 요청이 발생해도 외부 이메일 비용이 급증하지 않게 했습니다.

운영자 알림이 `failed`, `not-configured`, `deferred`인 신청자는 10분이 지난 뒤 재신청하면 알림을 다시 시도합니다. 이미 `sent`인 신청자는 정보를 갱신하되 같은 알림을 반복 발송하지 않습니다. 알림 실패와 일일 상한 도달은 신청 저장 결과를 되돌리지 않습니다.

## Subscriber lifecycle

`pending → approved | rejected | unsubscribed`

운영자는 D1의 `subscribers.status`를 바꾸고 해당 시각 필드(`approved_at`, `rejected_at`, `unsubscribed_at`)를 함께 기록합니다. 발송 에이전트는 `status = 'approved'`인 row만 읽어야 합니다. `email_verified_at`은 향후 double opt-in을 도입할 때 사용하며 MVP에서는 비어 있습니다.

## Environment

`.env.example`에는 키 이름만 있습니다. 실제 값은 로컬 비추적 환경 또는 Sites runtime secret에만 설정합니다.

- `RESEND_API_KEY`
- `OPERATOR_NOTIFICATION_EMAIL`
- `EMAIL_FROM` — 검증된 Resend sender
- `RATE_LIMIT_SALT`
- `SITE_URL`

## Content and routes

- 랜딩 콘텐츠: `content/site.ts`
- 개인정보 처리방침: `/privacy`
- 수신거부: `/unsubscribe`
- OG image: `public/og.png` (1200×630)

실제 운영자 사진과 현재 프로젝트·도구·실험 항목은 명세대로 placeholder로 남겨 두었습니다. 실제 정보를 확인한 뒤 교체해야 합니다.

## Checks

```bash
npm run lint
npx tsc --noEmit
npm run build
```

운영·발송 인수인계는 `docs/HANDOFF_SENDING_AGENT.md`, 검증 항목은 `docs/QA_CHECKLIST.md`를 참고합니다.

20명 이하의 초기 운영에서는 관리자 화면 대신 최소 운영 스크립트를 사용합니다.

```bash
npm run subscribers -- status
npm run subscribers -- pending
npm run subscribers -- approve person@example.com
npm run subscribers -- reject person@example.com
npm run subscribers -- recipients
```

실제 브리핑 발송은 자동화하지 않았습니다. `recipients`로 승인된 수신자를 확인한 뒤 운영자가 별도로 발송합니다.

## Deployment

Production URL은 `https://l-proof-ai.xyz`입니다. GitHub `main` push를 기준으로 Cloudflare Workers가 build와 deploy를 실행하고 D1 migration을 적용합니다. `RESEND_API_KEY`는 Cloudflare secret으로, 발신·수신 주소와 rate-limit salt는 server-side variable 또는 secret으로 관리합니다.
