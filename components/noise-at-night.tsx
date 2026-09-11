"use client";

import { CSSProperties, useEffect, useRef, useState } from "react";
import { LStamp } from "@/components/l-stamp";
import { siteContent } from "@/content/site";

export function NoiseAtNight() {
  const sectionRef = useRef<HTMLElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    const update = () => {
      frame = 0;
      const section = sectionRef.current;
      if (!section || media.matches || window.innerWidth < 768) {
        setProgress(1);
        return;
      }
      const rect = section.getBoundingClientRect();
      const distance = Math.max(1, section.offsetHeight - window.innerHeight);
      setProgress(Math.min(1, Math.max(0, -rect.top / distance)));
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    media.addEventListener("change", update);
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      media.removeEventListener("change", update);
    };
  }, []);

  const step = Math.min(2, Math.floor(progress * 3));
  const style = { "--noise-progress": progress } as CSSProperties;

  return (
    <section ref={sectionRef} className="noise-section" id="noise" style={style} aria-labelledby="noise-title">
      <div className="noise-sticky">
        <div className="night-grid" aria-hidden="true" />
        <div className="noise-copy">
          <p className="noise-label">NIGHT / UNFILTERED</p>
          <h2 id="noise-title">소식은 많지만,<br />신호는 많지 않아요.</h2>
          <div className="noise-statements">
            {siteContent.noise.copy.map((text, index) => (
              <p key={text} className={step === index ? "is-current" : step > index ? "is-past" : ""}>{text}</p>
            ))}
          </div>
        </div>

        <div className="noise-field" aria-label="과장된 제목이 검증을 거쳐 신호로 정리되는 예시">
          {siteContent.noise.headlines.map((headline, index) => (
            <div key={headline + index} className={"noise-chip noise-chip-" + (index + 1)}>
              <span className="noise-source">미확인</span>
              <span>{headline}</span>
            </div>
          ))}
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

        <div className="dawn-marker" aria-hidden="true">
          <span>09:00</span>
          <span className="dawn-line" />
          <span>CLEAR</span>
        </div>
      </div>
    </section>
  );
}
