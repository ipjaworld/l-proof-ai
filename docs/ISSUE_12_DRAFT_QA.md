# 12호 비공개 초안 검수 기록

기준: 2026-10-28 KST. 검토용 원고 `content/drafts/2026-10-29-v1.md`, 버전 `v1-private`. 발행 후보일 2026-10-29. 사용자 최종 승인 전이며 발행·등록·예약·메일·커밋·푸시를 하지 않았다.

## 범위와 보존

- 정본 make-l-proof-draft 스킬, POSITIONING, AGENTS 및 9~11호의 주제·주장을 비교했다. 11호 reader 본문과 출처를 확인하고 기존 9·10호 제목/주제도 대조했다.
- 공개 피드의 최신 회차 11호, 운영 D1의 12호 이상 행 0건, 로컬 draft 최신 10월 26일. 기존 파일을 덮지 않고 날짜와 v1이 들어간 새 파일을 만들었다.
- 연구 범위는 10월 23~28일 전체이며 10월 28일 10:45 KST까지 확인한 자료를 사용했다. 24~25일을 포함한 검색에서 포함할 만큼 확인된 추가 발표를 찾지 못했으며, 소식이 전혀 없었다고 단정하지 않는다. 28일 남은 시간의 발표는 미포함이다.
- Anthropic, OpenAI, Google, GitHub, Vercel, Cursor, Cloudflare 및 Hugging Face 공개 자료를 탐색했다. 검색 결과의 최근 댓글 날짜를 발표일로 간주하지 않았다.
- 운영 조회는 Cloudflare 대시보드의 SELECT만 사용했다. 정상 API 인증 경로는 여전히 연결하지 않았다. 실수로 초기에 예약 진행이라고 안내했으나 기존 11호 완료 기록을 확인한 뒤 비공개 초안 범위로 바로잡았고 운영 변경은 전혀 하지 않았다.
- 작업 시작 시 Git clean, `main...origin/main` 동기 상태. 11호의 기존 커밋 973f548은 이미 히스토리에 있다. 현재 작업으로 Git 작업을 수행하지 않았다.

## 원문 대조

| 소재 | 확인한 변화와 제한 | 1차 자료 |
| --- | --- | --- |
| Copilot Assisted permissions | 10/26 GA. CLI·앱·VS Code. 기존 deny 유지, eligible ask는 모델 승인 가능. 비대화 실행의 미승인 요청 거부. 검토 모델은 대화 모델과 같을 수도 있음 | [출시](https://github.blog/changelog/2026-10-26-github-copilot-assisted-permissions-generally-available/) · [공식 문서](https://docs.github.com/en/copilot/concepts/customizations/allowing-safe-commands) |
| Vercel 계획별 권한 | 10/23 설계 설명이며 새 출시라고 표현하지 않음. 읽기 조사, 추가 scope 승인, 활성 계획 검사, 특정 배포보다 넓을 수 있는 권한 | [설계 설명](https://vercel.com/blog/how-vercel-agent-accesses-production-safely) |
| Terra | 10/26 rollout; Work·Codex와 Chat 구분. 회사 자체 평가, 표준 가격·캐시 쓰기·272K 초과 가산 구분 | [발표](https://openai.com/index/introducing-gpt-6-1-terra/) · [사양](https://developers.openai.com/api/docs/models/gpt-6.1-terra) · [릴리스](https://openai.com/products/release-notes/) |
| Cloudflare GLM-5.3 | 10/26 보고서, 8/27~9/9 영향 기간, 9/9 복구. 155 responses, 681280 초과, 공급자 조사 결과 한정 | [공식 보고서](https://blog.cloudflare.com/kv-cache-exposure-remediation/) |
| Anthropic 보안 연구 | 10/27 발표, 미출시 내부 모델. 5개 공격 경로, 검사 방식의 추가 발견 기여도와 공통 검증 | [연구 보고서](https://www.anthropic.com/research/discovering-vulnerabilities-with-claude) |
| Vercel AI Traffic | 10/27. 크롤러·사용자 요청에 따른 assistant retrieval·Markdown·오류 지표. CLI Plus 조건. 인용/구매 증거 아님 | [발표](https://vercel.com/changelog/ai-traffic-insights-now-available-in-vercel-observability) · [문서](https://vercel.com/docs/observability/insights#ai-traffic) |
| Robotics ER 2 | 10/27 Cloud 공개 프리뷰, 모델 최초 발표와 구별. 영상 해석과 도구 연결, preview global 조건 | [발표](https://cloud.google.com/blog/products/ai-machine-learning/gemini-robotics-embodied-reasoning-2-is-now-available-on-google-cloud) · [문서](https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/gemini/gemini-robotics-er) |
| Copilot 서버 인증 | 10/27 public preview. 조직 앱 신원, 조직 과금, 1시간 토큰. Actions 내장 토큰 경로 구분 | [발표](https://github.blog/changelog/2026-10-27-github-copilot-supports-server-to-server-authentication/) · [문서](https://docs.github.com/en/copilot/how-tos/copilot-sdk/auth/server-to-server-tokens) |

## 소재 판단과 제외

- 승인/권한 두 기사는 11호의 승인 피로를 반복하는 대신 새 제품 기능과 명시된 자격증명 한계로 확장한다. Terra는 독립적인 가격/성능/이용 범위 변화, Cloudflare는 입력 격리 실패의 공개 근거, AI Traffic은 웹 개발자의 새로운 관찰 지표, Robotics는 Cloud 접근성 변화로 선정했다.
- Anthropic은 공격 세부 절차가 아니라 미출시 모델 및 검사 다양성의 의미를 다뤘다. 서버 인증은 한 시간 만료와 조직 귀속이 실무적으로 중요하지만 짧은 발표라 더 작은 기사로 유지했다.
- [HarnessAgent 이미지 입력](https://vercel.com/changelog/harness-agent-image-inputs): 10/27 기능 확인. 유용하지만 이번 호의 모델·운영 변화보다 정보량이 작아 제외. 모든 adapter에서 이미지 성능이 동일하다는 의미가 아님.
- [Copilot Teams](https://github.blog/changelog/2026-10-23-turn-notifications-into-code-with-github-copilot-in-teams/): 10/23 통합 앱 및 기존 앱 11/16 종료 확인. 독립 가치 있지만 이번에는 승인/인증의 더 큰 변경을 우선했다. 이전에 보도해서 제외한 것은 아님.
- [Decisions GA](https://community.openai.com/t/decisions-api-is-now-generally-available-with-new-updates/1408934): 검색 목록 10/26은 최근 댓글일. 원게시물은 10/22 표기이며 GPT-Live 연동은 9호와 중복. 새로운 캐시/JSON/400질문은 후속 후보이나 이번 호 미포함. 검색 목록 날짜로 새 발표라 쓰지 않았다.
- [Vercel Spend Management CLI](https://vercel.com/changelog/vercel-cli-adds-spend-management): 10/23. 예산 설정만으로 사용을 막지 않고 pause는 production을 중단한다는 차이를 확인했지만 이번 편에는 제외했다.
- [Vercel MCP feedback](https://vercel.com/changelog/send-feedback-from-vercel-mcp): 사용자 요청 시 전송하는 작은 변경으로 제외.
- [Google TPU/Oracle](https://cloud.google.com/blog/products/infrastructure/bringing-google-tpus-to-oracle-cloud-infrastructure): 10/27 발표이나 제공 시작 2027년 계획. 현재 도입 소식으로 쓰지 않았다.
- [Argon 활용 사례](https://blog.google/products-and-platforms/products/gemini/gemini-4-argon-builders/): 10/23 게시이나 모델 출시는 이미 8호. 새 독립 평가가 아니라 사례 소개여서 제외.
- Kimi K3.1 Pro 10/23 Gateway, OpenAI Google Cloud, Duet: 11호와 사건/주장 중복. Cursor는 조회된 changelog 최신 10/16, release notes 10/22로 범위 밖. 알려진 소식을 억지로 재포장하지 않았다.
- [A5](https://huggingface.co/blog/KYLN24/introducing-a5): 작성자의 제품 소개로 확인되지만 실제 범위·운영 조건에 대한 추가 검증 부족, 이전 호 proactive agent 논의 대비 새 검증 근거 부족으로 보류.
- Oracle ChatGPT 협력은 검색 후보까지만 확인했다. 구체적인 제공 시점/범위 검증이 충분하지 않아 본문 미포함.

## 자체 비판적 검수

별도 에이전트나 외부 ReChecker를 실행했다고 주장하지 않는다. 작성자가 자료를 다시 대조하고 문장·논리를 분리해 점검했다.

1. 도입의 '다른 모델'을 '모델'로 고쳤다. 같은 모델을 쓰는 예외가 있어 단정할 수 없었다.
2. 미래의 마감 시각을 쓰지 않도록 실제 조사 종료 시각 10:45 KST로 바로잡았다.
3. 날짜만 있는 발표는 날짜만 유지. 사고일/보고서일, 모델 최초 소개/Cloud 프리뷰, GA/public preview를 분리했다.
4. 명시적 금지와 ask의 차이를 유지하고 무인 실행에서 자동으로 무조건 통과하는 것처럼 읽히지 않게 했다.
5. 뉴스 모두를 승인 문제로 연결하지 않았다. 마지막 해석은 승인 요청/실행 결과의 구분에 한정하고 로봇·트래픽·가격 기사에 같은 교훈을 붙이지 않았다.
6. 로그 외부 전송은 '가령'으로 시작한 설명용 가정이다. 실제 Copilot 사고로 제시하지 않았다. L-Proof의 견해를 사용자 개인에게 귀속하지 않았다.
7. AI 봇 요청을 인용/매출로, status=sent를 수신함 도착으로 바꾸지 않았다.
8. 관용적 '흥미롭습니다/중요한 이유입니다' 안내 문장, 과도한 수식어, 모든 소제목 통일을 피했다. 승인 버튼이라는 제목은 비유이며 본문에서 자동 분류/승인 동작을 바로 설명한다.

## 검증 한계 및 남은 판단

- 공식 발표·문서 확인 수준(03). 제품별 재현, 독립 벤치마크, 취약점 공격 검증은 하지 않았다.
- 문서 최신 상태를 확인했으나 일부 제한은 발표 후 갱신됐을 수 있다. 발표일과 조회 시점 문서의 조건을 혼동하지 않는다.
- 28일 오전 이후 발표를 추가할지는 사용자의 다음 검토 때 결정한다. 현재 완성된 원고를 확인하는 데 추가 조사는 필수가 아니다.
- 원고는 비공개 검토 상태이며 사용자 최종 승인만 남는다. 이번 작업은 최종 승인을 요청하거나 예약 시각을 활성화하는 단계가 아니다.
- 안전한 로컬 미리보기는 outputs/issue12-private-v1/reader.html. 외부 리소스나 스크립트 없이 본문만 렌더링한다. 해당 폴더만 loopback HTTP로 잠시 제공하고 검증 후 종료한다. 앱 서버/Worker/cron은 실행하지 않는다.

## 로컬 검증 결과

- 본문 7746자, 뉴스 8개, 출처 링크 15개. Markdown 링크와 HTML href가 순서까지 일치했다.
- reader 본문에 frontmatter·편집자 메모·운영 집계가 포함되지 않음을 확인했다. HTML은 외부 스크립트·이미지·iframe 없이 생성했다.
- 브라우저에서 모든 기사와 결론의 DOM을 읽고 스크린샷으로 한글·문단·링크 표시를 확인했다.
- readerText SHA-256: `6c2ad5409c6d0222de918f3921ba0d3ec916d99473d19e5db41dbd1d731072ab`. 승인 해시가 아닌 비공개 검토용 본문 식별값이다.
