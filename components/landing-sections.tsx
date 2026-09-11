import { LStamp } from "@/components/l-stamp";
import { SignupForm } from "@/components/signup-form";
import { siteContent } from "@/content/site";

export function LoopSection() {
  return (
    <section className="loop-section" aria-labelledby="loop-title">
      <div className="section-heading">
        <p>검증은 한 번의 필터가 아니라</p>
        <h2 id="loop-title">사람에게 돌아오는<br />하나의 loop예요.</h2>
        <p className="section-intro">{siteContent.loop.intro}</p>
      </div>
      <ol className="loop-track">
        {siteContent.loop.steps.map((step, index) => (
          <li key={step.label}>
            <span className="loop-index">{String(index + 1).padStart(2, "0")}</span>
            <div>
              <strong>{step.label}</strong>
              <span>{step.owner}</span>
            </div>
            {index < siteContent.loop.steps.length - 1 ? <span className="loop-connector" aria-hidden="true" /> : null}
          </li>
        ))}
        <LStamp size="large" className="loop-stamp" />
      </ol>
    </section>
  );
}

export function BriefAnatomySection() {
  const brief = siteContent.brief;
  return (
    <section className="brief-section" aria-labelledby="brief-title">
      <div className="section-heading narrow">
        <p>브리핑 한 항목의 구조</p>
        <h2 id="brief-title">요약에서 끝나지 않아요.</h2>
      </div>
      <div className="brief-layout">
        <aside className="brief-annotations left" aria-label="왼쪽 주석">
          <p><span>실제 발표일</span>날짜가 확인되지 않으면 싣지 않아요.</p>
          <p><span>검증 등급</span>선의 형태와 텍스트로 함께 표시해요.</p>
          <p><span>개발자 영향</span>내 작업에서 무엇이 달라지는지 봐요.</p>
        </aside>
        <article className="brief-paper">
          <div className="brief-paper-top">
            <span className="example-label">예시</span>
            <span>{brief.date}</span>
          </div>
          <div className="brief-proof">
            <span className="proof-line proof-line-solid" aria-hidden="true" />
            <span>직접 테스트</span>
            <LStamp size="micro" />
          </div>
          <h3>{brief.title}</h3>
          <p>{brief.summary}</p>
          <div className="brief-block">
            <span>개발자 영향</span>
            <p>{brief.impact}</p>
          </div>
          <blockquote>
            <span>Lee’s Take</span>
            “{brief.take}”
          </blockquote>
          <div className="brief-action">
            <span>이번 주 할 일</span>
            <code>{brief.action}</code>
          </div>
          <p className="brief-original"><span>원문</span> 실제 발행호에서는 확인한 원문으로 연결해요.</p>
        </article>
        <aside className="brief-annotations right" aria-label="오른쪽 주석">
          <p><span>Lee’s Take</span>사실과 제 판단을 타이포그래피로 분리해요.</p>
          <p><span>이번 주 할 일</span>읽은 뒤 바로 실행할 수 있게 적어요.</p>
          <p><span>원문</span>모든 항목에 확인 경로를 남겨요.</p>
        </aside>
      </div>
      <div className="ignore-note">
        <span>무시해도 되는 것</span>
        <p>{brief.ignore}</p>
      </div>
    </section>
  );
}

export function WhyLSection() {
  return (
    <section className="why-section" aria-labelledby="why-title">
      <h2 id="why-title" className="sr-only">왜 L인가요</h2>
      <div className="why-mark">
        <LStamp size="large" />
        <span>PROOF IS A LOOP</span>
      </div>
      <div className="why-copy">
        {siteContent.whyL.map((item) => (
          <div key={item.title}>
            <h3>{item.title}</h3>
            <p>{item.text}</p>
          </div>
        ))}
        <blockquote>AI가 모으고,<br />사람이 증명합니다.</blockquote>
      </div>
    </section>
  );
}

export function PersonSection() {
  const operator = siteContent.operator;
  return (
    <section className="person-section" aria-labelledby="person-title">
      <div className="person-photo" role="img" aria-label="운영자 실제 사진 자리">
        <LStamp size="large" />
        <span>{operator.photoPlaceholder}</span>
      </div>
      <div className="person-copy">
        <p className="person-label">THE PERSON IN THE LOOP</p>
        <h2 id="person-title">{operator.name}</h2>
        <p className="person-role">{operator.role}</p>
        <p className="person-intro">{operator.introduction}</p>
        <dl className="person-now">
          {operator.now.map((item) => (
            <div key={item.label}>
              <dt>{item.label}</dt>
              <dd>{item.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

export function ReceiveSection() {
  return (
    <section className="receive-section" aria-labelledby="receive-title">
      <div className="section-heading">
        <p>받게 되는 것</p>
        <h2 id="receive-title">월요일엔 맥락을,<br />목요일엔 변화를.</h2>
      </div>
      <div className="edition-grid">
        {siteContent.editions.map((edition) => (
          <article key={edition.day}>
            <p className="edition-day">{edition.day}</p>
            <h3>{edition.title}</h3>
            <p>{edition.description}</p>
            <ul>{edition.items.map((item) => <li key={item}>{item}</li>)}</ul>
          </article>
        ))}
      </div>
      <div className="principles">
        <h3>제가 지키는 편집 원칙</h3>
        <ol>
          {siteContent.editorialPrinciples.map((principle, index) => (
            <li key={principle}><span>{String(index + 1).padStart(2, "0")}</span>{principle}</li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function FinalSignupSection() {
  return (
    <section className="final-signup" aria-labelledby="signup-title">
      <div>
        <p>다음 월요일 · 오전 9시</p>
        <h2 id="signup-title">월요일 아침,<br />확인된 것만 받아보세요.</h2>
      </div>
      <div>
        <SignupForm placement="footer" />
        <p className="form-footnote">{siteContent.hero.footnote}</p>
      </div>
    </section>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-brand"><LStamp size="small" /><strong>L-Proof-AI</strong></div>
      <nav aria-label="푸터">
        <a href={siteContent.links.contact}>문의</a>
        <a href="/privacy">개인정보 처리방침</a>
        <a href="/unsubscribe">수신거부</a>
        <span>GitHub repository · private</span>
      </nav>
      <p>© 2026 L-Proof-AI · 이건하</p>
    </footer>
  );
}
