# Gate 2 QA checklist

- [x] 전체 S0–S8 콘텐츠와 placeholder 구분
- [x] `/privacy`, `/unsubscribe`
- [x] 유효 신청 저장 및 명시적 동의 시각 기록
- [x] 대소문자 이메일 중복 신청이 한 row로 유지
- [x] 허니팟 입력은 저장하지 않고 일반 성공 응답
- [x] 잘못된 이메일·동의 누락 오류
- [x] 동일 client identity 10분당 5회 rate limit
- [x] 해지 후 `unsubscribed` 및 처리 시각 기록
- [x] 알림 미설정 상태가 row에 기록되고 신청 저장은 유지
- [x] WebMCP와 화면 form이 같은 API 계약 사용
- [x] lint, TypeScript, production build
- [x] 브라우저에서 전체 랜딩·법적 페이지·접근 가능한 입력 요소 확인
- [ ] Resend 실제 API 성공 — production secret 필요
- [ ] 운영자 inbox 실제 도착 — production sender/domain 필요
- [x] remote D1 migration 및 production E2E
- [x] production 공개
