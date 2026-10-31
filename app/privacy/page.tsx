import Link from "next/link";
import { LStamp } from "@/components/l-stamp";
import { SitePageTracker } from "@/components/view-count";

export default function PrivacyPage() {
  return (
    <main className="legal-page">
      <SitePageTracker page="privacy" />
      <Link className="legal-brand" href="/"><LStamp size="small" /> L-Proof-AI</Link>
      <article>
        <p className="legal-eyebrow">PRIVACY · 2026.10.31</p>
        <h1>개인정보 처리방침</h1>
        <p>L-Proof-AI는 브리핑 신청 검토와 발송, 수신거부 처리를 위해 필요한 정보만 다룹니다.</p>
        <section><h2>수집 항목과 목적</h2><p>필수 항목은 이메일과 동의 시각입니다. 이름·관심 분야·유입 정보는 선택 항목입니다. 신청 확인, 구독자 관리, 브리핑 발송, 운영 개선에 사용합니다.</p></section>
        <section><h2>보관과 삭제</h2><p>수신거부 후에는 발송에서 제외하며, 중복 신청과 수신거부 이력을 안전하게 처리하기 위해 상태와 처리 시각을 보관합니다. 삭제를 요청하면 법적 보관 의무가 없는 범위에서 지체 없이 삭제합니다.</p></section>
        <section><h2>처리 시스템</h2><p>Cloudflare Workers에서 웹 서비스를 운영하고 Cloudflare D1에 신청 정보를 저장합니다. 운영 알림은 Resend를 통해 발송하며, 발송에 필요한 인증 정보는 서버 환경에서만 관리합니다.</p></section>
        <section><h2>광고와 쿠키</h2><p>L-Proof-AI는 아티클 페이지에 Google AdSense 광고를 게재할 수 있습니다. 홈페이지와 구독 화면에는 광고를 게재하지 않습니다.</p><p>Google을 포함한 제3자 광고 사업자는 쿠키를 사용해, 방문자가 이 사이트나 다른 웹사이트를 이전에 방문한 기록을 바탕으로 광고를 제공합니다. Google은 광고 쿠키를 통해 Google과 파트너사가 이 사이트와 인터넷의 다른 사이트 방문 기록을 바탕으로 광고를 제공할 수 있게 합니다.</p><p>광고가 표시되는 페이지를 방문하면 페이지 주소와 IP 주소가 Google에 자동으로 전송되고, Google이 브라우저에 쿠키를 저장하거나 읽을 수 있습니다. 이 정보의 사용과 보유 기간은 <a href="https://policies.google.com/privacy?hl=ko">Google 개인정보처리방침</a>과 <a href="https://policies.google.com/technologies/partner-sites?hl=ko">Google의 파트너 사이트 정보 사용 방식</a>을 따릅니다. L-Proof-AI는 구독 신청 시 받은 이메일과 이름을 광고 사업자에게 제공하지 않습니다.</p></section>
        <section><h2>맞춤 광고를 거부하는 방법</h2><p><a href="https://www.google.com/settings/ads">Google 광고 설정</a>에서 맞춤 광고를 끌 수 있습니다. 제3자 광고 사업자의 맞춤 광고용 쿠키는 <a href="https://www.aboutads.info/choices/">aboutads.info</a>에서 거부할 수 있습니다. 브라우저 설정에서 쿠키를 차단하거나 삭제할 수도 있지만, Google 맞춤 광고는 광고 설정에서 꺼야 중단됩니다.</p></section>
        <section><h2>권리와 문의</h2><p>열람·정정·삭제·수신거부를 요청할 수 있습니다. 수신거부는 <Link href="/unsubscribe">전용 페이지</Link>에서 직접 처리하거나 <a href="mailto:this_is_laugh@naver.com">this_is_laugh@naver.com</a>으로 문의해주세요.</p></section>
      </article>
    </main>
  );
}
