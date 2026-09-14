import { LStamp } from "@/components/l-stamp";
import { siteContent } from "@/content/site";

export function NoiseAtNight() {
  return (
    <section className="noise-section" id="noise" aria-labelledby="noise-title">
      <div className="night-grid" aria-hidden="true" />
      <div className="noise-inner">
        <div className="noise-copy">
          <p className="noise-label">NIGHT / UNFILTERED</p>
          <h2 id="noise-title">소식은 많지만,<br />신호는 많지 않아요.</h2>
          <div className="noise-statements">
            {siteContent.noise.copy.map((text) => (
              <p key={text}>{text}</p>
            ))}
          </div>
        </div>

        <div className="noise-field">
          <ul className="noise-list" aria-label="검증 전 과장된 제목 예시">
            {siteContent.noise.headlines.map((headline, index) => (
              <li key={headline + index}>
                <span className="noise-source">미확인</span>
                <span>{headline}</span>
              </li>
            ))}
          </ul>

          <div className="signal-record">
            <div className="signal-header">
              <span>남은 신호</span>
              <span className="signal-line" aria-hidden="true" />
              <span>직접 테스트</span>
              <LStamp size="tiny" />
            </div>
            <p>이번 주 개발자가<br />해볼 일은 이것</p>
            <span className="signal-action">실행 순서와 확인 기준까지</span>
          </div>
        </div>
      </div>
    </section>
  );
}
