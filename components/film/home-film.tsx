"use client";

import { useEffect, useRef } from "react";
import { siteContent } from "@/content/site";

declare global {
  interface Window {
    __mountFilm?: (root: HTMLElement) => () => void;
  }
}

const issue = siteContent.filmIssue;
const FILM_BUNDLE = "/film/scene.js?v=14";

// The markup below is a complete page without JavaScript; the film only enhances it.
export function HomeFilm() {
  const story = useRef<HTMLElement>(null);

  // The bundle loads once per document; each visit to the page mounts its own film.
  useEffect(() => {
    let dispose: (() => void) | undefined;
    const mount = () => {
      const root = story.current?.closest<HTMLElement>(".film-page");
      if (root && window.__mountFilm && !dispose) dispose = window.__mountFilm(root);
    };
    let script = document.querySelector<HTMLScriptElement>("script[data-film-bundle]");
    if (!script) {
      script = document.createElement("script");
      script.src = FILM_BUNDLE;
      script.async = true;
      script.dataset.filmBundle = "";
      document.body.appendChild(script);
    }
    if (window.__mountFilm) mount();
    else script.addEventListener("load", mount, { once: true });
    const loading = script;
    return () => {
      loading.removeEventListener("load", mount);
      dispose?.();
    };
  }, []);

  return (
    <section
      id="story"
      ref={story}
      aria-label="쏟아지는 소식이 한 장의 브리핑이 되는 과정"
      data-film={JSON.stringify(issue)}
    >
      <div className="sticky">
        <div id="stage" aria-hidden="true" />
        <div className="copy copy-hero" data-from="-1" data-to="1.15">
          <p>
            사람이 검토하는 <strong>AI 브리핑</strong>
          </p>
          <h1>
            쏟아지는 소식에서,
            <br />
            <em>남길 것만.</em>
          </h1>
          <p className="hero-lead">월·목 아침 9시, 메일로 받는 무료 브리핑</p>
          <a className="hero-cta" href="#subscribe">
            무료로 받아보기 <span aria-hidden="true">↓</span>
          </a>
        </div>
        <div className="copy copy-left-low" data-from="5.5" data-to="7.75">
          <p>작성자 AI · 사실과 해석</p>
          <h2>
            사실만 남기고,
            <br />
            <em>해석을 더합니다.</em>
          </h2>
        </div>
        <div className="copy copy-left-low" data-from="8.25" data-to="10.1">
          <p>검수자 AI · 원고 검토</p>
          <h2>
            다른 AI의 시선으로,
            <br />
            <em>다시 읽습니다.</em>
          </h2>
        </div>
        <div className="copy copy-left-high" data-from="11.02" data-to="12.15">
          <p>이건하 · 최종 발행 승인</p>
          <h2>
            마지막 결정은,
            <br />
            <em>사람의 몫.</em>
          </h2>
        </div>
        <div className="delivery">
          <article className="mail">
            <div className="mail-meta">
              <span className="mail-symbol">L</span>
              <div>
                <b>L-Proof AI</b>
                <span>나에게</span>
              </div>
              <time>09:00</time>
            </div>
            <p className="mail-issue">AI BRIEFING &nbsp;/&nbsp; {issue.issue}</p>
            <h3>
              {issue.titleLines[0]}
              <br />
              {issue.titleLines[1]}
            </h3>
            <div className="mail-rule" />
            <p className="mail-excerpt">{issue.excerptLines.join(" ")}</p>
            <a className="mail-read" href={`/articles/${issue.slug}`}>
              오늘의 브리핑 읽기 <b>↗</b>
            </a>
            <span className="mail-stamp" aria-hidden="true" />
          </article>
          <div className="delivery-copy">
            <p>L-PROOF → YOUR INBOX</p>
            <h2>
              완성된 한 장,
              <br />
              <em>당신에게.</em>
            </h2>
          </div>
        </div>
        <span className="cue">
          아래로 <b aria-hidden="true">↓</b>
        </span>
        <a className="skip-film" href="#after-film">
          영상 건너뛰기
        </a>
        <nav className="rail" aria-label="제작 단계 이동">
          <button data-go="0" aria-label="1. 쏟아지는 소식" aria-current="step" />
          <button data-go="1" aria-label="2. 사실과 해석" />
          <button data-go="2" aria-label="3. 검수자 AI 원고 검토" />
          <button data-go="3" aria-label="4. 사람의 승인" />
          <button data-go="4" aria-label="5. 이메일 전달" />
        </nav>
        <button id="motion" aria-label="움직임 줄이기" aria-pressed="false">
          Ⅱ
        </button>
      </div>
    </section>
  );
}
