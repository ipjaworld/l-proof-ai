import { NoiseAtNight } from "@/components/noise-at-night";
import { SignupForm } from "@/components/signup-form";
import { LStamp } from "@/components/l-stamp";
import { siteContent } from "@/content/site";
import {
  BriefAnatomySection,
  FinalSignupSection,
  LoopSection,
  PersonSection,
  ReceiveSection,
  SiteFooter,
  WhyLSection,
} from "@/components/landing-sections";

export default function Home() {
  return (
    <main>
      <section className="hero" aria-labelledby="hero-title">
        <header className="site-header">
          <a className="brand" href="#top" aria-label="L-Proof-AI 홈">
            <LStamp size="small" />
            <span>L-Proof-AI</span>
          </a>
          <p className="issue-time">MON · THU / 09:00</p>
        </header>

        <div className="hero-grid" id="top">
          <div className="hero-copy">
            <div className="correction" aria-label="과장된 소식을 검증해 행동으로 바꾸는 과정">
              <span className="correction-before">개발자는 이제 필요 없다</span>
              <span className="correction-rule" aria-hidden="true" />
              <span className="correction-after">이번 주 개발자가 해볼 일은 이것</span>
              <LStamp size="tiny" className="correction-stamp" />
            </div>

            <p className="hero-kicker">개발자를 위한 주 2회 검증 노트</p>
            <h1 id="hero-title">
              밤새 쏟아진 AI 소식,
              <br />
              아침 9시엔 확인된 것만.
            </h1>
            <p className="hero-description">{siteContent.hero.description}</p>
            <SignupForm />
            <p className="form-footnote">{siteContent.hero.footnote}</p>
          </div>

          <aside className="proof-index" aria-label="L-Proof-AI 검증 기준">
            <p className="proof-index-title">PROOF LEVEL</p>
            <ol>
              {siteContent.proofLevels.map((level, index) => (
                <li key={level.label}>
                  <span className={"proof-line proof-line-" + level.style} aria-hidden="true" />
                  <span className="proof-number">0{index + 1}</span>
                  <span>{level.label}</span>
                  {level.stamped ? <LStamp size="micro" /> : null}
                </li>
              ))}
            </ol>
            <p className="proof-index-note">색이 없어도 선의 형태로 검증 수준을 읽을 수 있어요.</p>
          </aside>
        </div>
        <a className="scroll-cue" href="#noise">
          소음에서 신호까지
          <span aria-hidden="true">↓</span>
        </a>
      </section>

      <NoiseAtNight />
      <LoopSection />
      <BriefAnatomySection />
      <WhyLSection />
      <PersonSection />
      <ReceiveSection />
      <FinalSignupSection />
      <SiteFooter />
    </main>
  );
}
