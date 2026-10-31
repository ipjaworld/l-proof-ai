import type { Metadata } from "next";
import Link from "next/link";
import { FilmFooter, FilmHeader } from "@/components/film/film-chrome";
import { siteContent } from "@/content/site";
import "../film.css";

export const metadata: Metadata = {
  title: "About — L-Proof-AI",
  description: "프론트엔드 개발자가 직접 엄선한 AI 소식과 판단을, 주 2회 브리핑으로 보내드립니다.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  const { operator, loop, proofLevels, editions, editorialPrinciples, whyL } = siteContent;
  return (
    <main className="film-page about-page">
      <FilmHeader subscribeHref="/#signup-title" />
      <div className="desk">
        <section className="about-hero" aria-labelledby="about-title">
          <p className="eyebrow">ABOUT</p>
          <h1 id="about-title">
            이 브리핑은
            <br />
            <em>누가 확인하나요?</em>
          </h1>
          <p>프론트엔드 개발자가 직접 엄선한 AI 소식과 판단을, 주 2회 브리핑으로 보내드립니다.</p>
        </section>

        <section className="about-sheet about-person" aria-labelledby="person-title">
          <div>
            <p className="sheet-label">THE PERSON IN THE LOOP</p>
            <h2 id="person-title">{operator.name}</h2>
            <p className="about-role">{operator.role}</p>
            <p className="about-body">{operator.introduction}</p>
          </div>
          <dl>
            {operator.now.map((item) => (
              <div key={item.label}>
                <dt>{item.label}</dt>
                <dd>{item.value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="about-section" aria-labelledby="process-title">
          <h2 id="process-title">
            마지막 판단은
            <br />
            <em>사람의 몫입니다.</em>
          </h2>
          <p className="about-lead">{loop.intro}</p>
          <ol className="about-steps">
            {loop.steps.map((step, index) => (
              <li key={step.label} className={step.owner === "사람" ? "is-human" : undefined}>
                <span>0{index + 1}</span>
                <b>{step.label}</b>
                <small>{step.owner}</small>
              </li>
            ))}
          </ol>
        </section>

        <section className="about-sheet about-proof" aria-labelledby="proof-title">
          <div>
            <p className="sheet-label">PROOF LEVEL</p>
            <h2 id="proof-title">어디까지 확인했는지 표시해요.</h2>
            <p className="about-body">
              모든 소식을 직접 테스트하지는 않아요. 항목마다 확인한 범위를 선의 형태와 글자로 함께 남겨요.
            </p>
          </div>
          <ol>
            {proofLevels.map((level, index) => (
              <li key={level.label}>
                <span className={`proof-sample proof-sample-${level.style}${level.stamped ? " proof-sample-stamped" : ""}`} aria-hidden="true" />
                <span>0{index + 1}</span>
                <b>{level.label}</b>
              </li>
            ))}
          </ol>
        </section>

        <section className="about-section" aria-labelledby="editions-title">
          <h2 id="editions-title">
            월요일엔 맥락을,
            <br />
            <em>목요일엔 변화를.</em>
          </h2>
          <div className="about-editions">
            {editions.map((edition) => (
              <article className="about-sheet" key={edition.title}>
                <p className="sheet-label">{edition.day}</p>
                <h3>{edition.title}</h3>
                <p className="about-body">{edition.description}</p>
                <ul>
                  {edition.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section className="about-sheet about-principles" aria-labelledby="principles-title">
          <div>
            <p className="sheet-label">EDITORIAL PRINCIPLES</p>
            <h2 id="principles-title">지키는 편집 원칙</h2>
          </div>
          <ol>
            {editorialPrinciples.map((principle, index) => (
              <li key={principle}>
                <span>0{index + 1}</span>
                {principle}
              </li>
            ))}
          </ol>
        </section>

        <section className="about-section about-why" aria-labelledby="why-title">
          <h2 id="why-title">왜 L인가요</h2>
          {whyL.map((item) => (
            <p key={item.title}>
              <b>{item.title}</b> {item.text}
            </p>
          ))}
          <Link className="invitation-link" href="/#signup-title" prefetch={false}>
            브리핑 받아보기 <span aria-hidden="true">↗</span>
          </Link>
        </section>

        <FilmFooter />
      </div>
    </main>
  );
}
