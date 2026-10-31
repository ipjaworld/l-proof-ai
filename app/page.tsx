import { FilmArchive } from "@/components/film/film-archive";
import { FilmFooter, FilmHeader } from "@/components/film/film-chrome";
import { HomeFilm } from "@/components/film/home-film";
import { SignupForm } from "@/components/signup-form";
import { siteContent } from "@/content/site";
import { getCloudflareEnv } from "@/lib/cloudflare-env";
import "./film.css";

export const dynamic = "force-dynamic";

export default async function Home() {
  const turnstileSiteKey = getCloudflareEnv().TURNSTILE_SITE_KEY ?? "";
  return (
    <main className="film-page">
      <a className="film-skip" href="#subscribe">연출을 건너뛰고 구독하기</a>
      <FilmHeader subscribeHref="#subscribe" />
      <HomeFilm />

      <section id="after-film" className="invite" aria-labelledby="invitation-title">
        <p className="eyebrow reveal">월·목 아침 9시 · 무료</p>
        <h2 id="invitation-title" className="reveal">
          확인을 거친 소식만,
          <br />
          아침 메일함으로.
        </h2>
        <p className="invite-lead reveal">코딩 에이전트와 LLM, AGI 소식을 원문부터 확인해 보내드려요.</p>
        <a className="invitation-link reveal" href="#subscribe">
          한 장 받아보기 <span aria-hidden="true">↓</span>
        </a>
      </section>

      <div className="desk">
        <FilmArchive />
        <section id="subscribe" className="signup-section" aria-labelledby="signup-title">
          <div className="signup-copy reveal">
            <p className="eyebrow">무료 · 언제든 수신 취소</p>
            <h2 id="signup-title">
              메일함에 남길
              <br />
              <em>이유가 있는 이야기.</em>
            </h2>
            <p>월요일과 목요일, 아침 9시에 만나요.</p>
          </div>
          <div className="signup-sheet reveal">
            <p className="signup-sheet-title">브리핑 받아보기</p>
            <SignupForm turnstileSiteKey={turnstileSiteKey} />
            <p className="signup-sheet-note">{siteContent.hero.footnote}</p>
          </div>
        </section>
        <FilmFooter note="영상의 교정 표시와 승인 장면은 제작 흐름을 표현한 연출이에요." />
      </div>
    </main>
  );
}
