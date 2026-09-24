import Link from "next/link";
import { LStamp } from "@/components/l-stamp";
import { SiteFooter } from "@/components/landing-sections";

export function PublicationHeader() {
  return (
    <header className="publication-header">
      <Link className="brand" href="/" aria-label="L-Proof-AI 홈" prefetch={false}>
        <LStamp size="small" />
        <span>L-Proof-AI</span>
      </Link>
      <nav aria-label="주 메뉴">
        <Link href="/articles" prefetch={false}>Articles</Link>
        <Link href="/#person-title" prefetch={false}>About</Link>
        <Link className="publication-subscribe" href="/#signup-title" prefetch={false}>Subscribe</Link>
      </nav>
    </header>
  );
}

export function PublicationFooter() {
  return <SiteFooter />;
}
