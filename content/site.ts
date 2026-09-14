export const siteContent = {
  hero: {
    description:
      "코딩 에이전트와 LLM, AGI 소식을 원문부터 확인해요. 중요한 도구는 직접 써보고, 제 판단과 이번 주에 해볼 일까지 더해 월요일과 목요일 아침에 보내드려요.",
    footnote:
      "무료로 보내드려요. 신청 내용을 직접 확인한 뒤 발송하며, 언제든 수신을 취소할 수 있어요.",
  },
  proofLevels: [
    { label: "전망·루머", style: "dotted", stamped: false },
    { label: "보도 기반", style: "dashed", stamped: false },
    { label: "공식 확인", style: "solid", stamped: false },
    { label: "직접 테스트", style: "solid", stamped: true },
  ],
  noise: {
    headlines: [
      "모든 벤치마크 1위",
      "개발자 일자리는 끝났다",
      "이 프롬프트 하나면 끝",
      "AGI, 올해 안에 온다",
      "모든 벤치마크 1위",
      "생산성이 열 배가 됐다",
    ],
    copy: [
      "하루에도 몇 번씩 ‘모든 걸 바꿀’ 발표가 나와요.",
      "같은 소식은 열 개의 기사로 복제되고, 루머는 사실처럼 퍼져요.",
      "그중 이번 주 개발자의 작업을 실제로 바꾸는 건 몇 개뿐이에요.",
    ],
  },
  loop: {
    intro: "AI를 배제하지 않아요. 대신 사람이 직접 확인하고 판단해야 할 지점을 분명히 둬요.",
    steps: [
      { label: "모으기", owner: "AI" },
      { label: "원문 확인", owner: "AI + 사람" },
      { label: "교차검증", owner: "AI + 사람" },
      { label: "직접 써보기", owner: "사람" },
      { label: "판단", owner: "사람" },
    ],
  },
  brief: {
    title: "로컬 작업을 나누는 새 실행 방식",
    date: "발표일 · [예시] 2026.09.08",
    summary:
      "하나의 코딩 작업을 작은 단위로 나눠 동시에 검토하는 가상의 사례로, 브리핑 한 항목이 어떻게 구성되는지 보여드려요.",
    impact:
      "병렬 실행 자체보다 작업 경계와 결과 검증 방식이 실제 개발 시간을 줄이는지 확인해야 해요.",
    take: "결과가 빠른 것보다 누가 무엇을 검증했는지 남는 작업 방식이 더 오래갑니다. 판단이 틀렸다면 그 과정까지 기록해요.",
    action:
      "이번 주에는 독립적인 작업 하나만 분리해보고, 병합 전 확인 항목을 세 줄로 적어보세요.",
    ignore: "측정 조건 없이 ‘생산성이 열 배가 됐다’고 말하는 주장",
  },
  whyL: [
    { title: "L은 Loop예요.", text: "확인하고, 다시 확인하는 반복." },
    { title: "그리고 L은 Lee예요.", text: "그 루프 안에는 사람이 있어요." },
  ],
  operator: {
    name: "이건하",
    role: "현직 프론트엔드 개발자 · 1인 운영",
    photoPlaceholder: "[PLACEHOLDER: 운영자 실제 사진]",
    introduction:
      "이 브리핑은 AI가 자동으로 골라 보내는 뉴스가 아니에요. 안녕하세요, 이건하입니다. 현직 프론트엔드 개발자로, AI 도구를 활용해 직접 서비스를 만들어요. 여러 코딩 에이전트의 역할을 나누고, 서로 다른 모델의 답을 교차검증한 뒤, 마지막 결과는 실제 브라우저에서 다시 확인합니다. L-Proof-AI의 브리핑도 같은 원칙으로 만들어요 — AI가 모은 소식을 제가 직접 원문까지 확인하고, 제 판단을 코멘트로 남긴 것만 보내드립니다.",
    now: [
      { label: "만드는 것", value: "[PLACEHOLDER: 현재 만드는 프로젝트]" },
      { label: "쓰는 도구", value: "[PLACEHOLDER: 현재 사용하는 도구]" },
      { label: "최근 실험", value: "[PLACEHOLDER: 최근 실험]" },
      { label: "관심사", value: "코딩 에이전트의 실제 작업 품질" },
    ],
  },
  editions: [
    {
      day: "MONDAY · 09:00",
      title: "Main Briefing",
      description: "목요일부터 일요일까지의 주요 이슈, 검증 결과, 개발자 영향, 제 판단과 이번 주 할 일을 묶어요.",
      items: ["주요 이슈 5~10개", "항목별 검증 등급", "Lee’s Take", "무시해도 되는 것"],
    },
    {
      day: "THURSDAY · 09:00",
      title: "Quick Signal",
      description: "월요일부터 수요일 사이에 바뀐 것 중, 실제로 다시 볼 가치가 있는 신호만 짧게 보내요.",
      items: ["변화 요약", "원문 확인 경로", "바로 해볼 일"],
    },
  ],
  editorialPrinciples: [
    "공식 발표·릴리스 노트·논문을 먼저 확인해요.",
    "날짜를 확인할 수 없는 소식은 싣지 않아요.",
    "루머·전망·확인된 사실을 한 문장 안에서 섞지 않아요.",
    "이슈가 적은 주에는 억지로 개수를 채우지 않아요.",
  ],
  flags: {
    showQuarterlyRescore: false,
  },
  links: {
    contact: "mailto:lproof073@gmail.com",
    repository: null,
  },
} as const;
