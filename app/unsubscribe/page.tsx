import Link from "next/link";
import { LStamp } from "@/components/l-stamp";
import { UnsubscribeForm } from "@/components/unsubscribe-form";

export default function UnsubscribePage() {
  return (
    <main className="legal-page">
      <Link className="legal-brand" href="/"><LStamp size="small" /> L-Proof-AI</Link>
      <article>
        <p className="legal-eyebrow">UNSUBSCRIBE</p>
        <h1>브리핑 수신거부</h1>
        <p>아래 이메일을 대기·승인 목록에서 수신거부 상태로 바꿉니다. 존재 여부와 관계없이 같은 완료 메시지를 보여드려요.</p>
        <UnsubscribeForm />
        <p className="legal-help">직접 처리되지 않으면 <a href="mailto:lproof073@gmail.com">lproof073@gmail.com</a>으로 알려주세요.</p>
      </article>
    </main>
  );
}
