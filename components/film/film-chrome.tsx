import Link from "next/link";
import { siteContent } from "@/content/site";

export function FilmHeader({ subscribeHref }: { subscribeHref: string }) {
  return (
    <header className="film-header">
      <Link className="film-brand" href="/" aria-label="L-Proof AI 홈" prefetch={false}>
        <svg viewBox="0 0 30 32" aria-hidden="true">
          <path d="M3 2h24v28H3zM8 6v19h15M13 6v14h10" />
        </svg>
        L-Proof <span>AI</span>
      </Link>
      <nav aria-label="주 메뉴">
        <Link href="/articles" prefetch={false}>Articles</Link>
        <Link href="/about" prefetch={false}>About</Link>
        <a className="film-join" href={subscribeHref}>구독하기 ↗</a>
      </nav>
    </header>
  );
}

export function FilmFooter({ note }: { note?: string }) {
  return (
    <footer className="film-footer">
      <div>
        <b>L-Proof AI</b>
        <p>© 2026 L-Proof-AI · 이건하</p>
      </div>
      <div className="film-footer-links">
        <nav aria-label="푸터">
          <a href={siteContent.links.contact}>문의</a>
          <Link href="/privacy" prefetch={false}>개인정보 처리방침</Link>
          <Link href="/unsubscribe" prefetch={false}>수신거부</Link>
        </nav>
        {note ? <p>{note}</p> : null}
      </div>
    </footer>
  );
}
