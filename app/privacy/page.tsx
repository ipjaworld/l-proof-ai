import Link from "next/link";
import { LStamp } from "@/components/l-stamp";

export default function PrivacyPage() {
  return (
    <main className="legal-page">
      <Link className="legal-brand" href="/"><LStamp size="small" /> L-Proof-AI</Link>
      <article>
        <p className="legal-eyebrow">PRIVACY · 2026.09.12</p>
        <h1>개인정보 처리방침</h1>
        <p>L-Proof-AI는 브리핑 신청 검토와 발송, 수신거부 처리를 위해 필요한 정보만 다룹니다.</p>
        <section><h2>수집 항목과 목적</h2><p>필수 항목은 이메일과 동의 시각입니다. 이름·관심 분야·유입 정보는 선택 항목입니다. 신청 확인, 구독자 관리, 브리핑 발송, 운영 개선에 사용합니다.</p></section>
        <section><h2>보관과 삭제</h2><p>수신거부 후에는 발송에서 제외하며, 중복 신청과 수신거부 이력을 안전하게 처리하기 위해 상태와 처리 시각을 보관합니다. 삭제를 요청하면 법적 보관 의무가 없는 범위에서 지체 없이 삭제합니다.</p></section>
        <section><h2>처리 시스템</h2><p>Cloudflare Workers에서 웹 서비스를 운영하고 Cloudflare D1에 신청 정보를 저장합니다. 운영 알림은 Resend를 통해 발송하며, 발송에 필요한 인증 정보는 서버 환경에서만 관리합니다.</p></section>
        <section><h2>권리와 문의</h2><p>열람·정정·삭제·수신거부를 요청할 수 있습니다. 수신거부는 <Link href="/unsubscribe">전용 페이지</Link>에서 직접 처리하거나 <a href="mailto:this_is_laugh@naver.com">this_is_laugh@naver.com</a>으로 문의해주세요.</p></section>
      </article>
    </main>
  );
}
