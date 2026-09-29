import Link from "next/link";
import { LStamp } from "@/components/l-stamp";
import { UnsubscribeForm } from "@/components/unsubscribe-form";

export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ subscriber?: string; token?: string }>;
}) {
  const { subscriber = "", token = "" } = await searchParams;
  const hasSignedLink = /^[A-Za-z0-9_-]{1,128}$/.test(subscriber) && /^[a-f0-9]{64}$/.test(token);
  return (
    <main className="legal-page">
      <Link className="legal-brand" href="/"><LStamp size="small" /> L-Proof-AI</Link>
      <article>
        <p className="legal-eyebrow">UNSUBSCRIBE</p>
        <h1>브리핑 수신거부</h1>
        {hasSignedLink ? (
          <>
            <p>아래 확인 버튼을 눌러야 수신거부가 완료됩니다. 링크 조회만으로는 구독 상태가 바뀌지 않습니다.</p>
            <UnsubscribeForm subscriber={subscriber} token={token} />
          </>
        ) : (
          <p>최신 브리핑에 포함된 수신거부 링크를 사용해주세요. 이전 메일만 가지고 있거나 링크를 사용할 수 없다면 아래 주소로 요청해 주세요.</p>
        )}
        <p className="legal-help"><a href="mailto:this_is_laugh@naver.com?subject=L-Proof-AI%20구독%20해지%20요청">this_is_laugh@naver.com</a>으로 해지를 요청할 수 있습니다.</p>
      </article>
    </main>
  );
}
