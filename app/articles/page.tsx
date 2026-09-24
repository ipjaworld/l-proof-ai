import type { Metadata } from "next";
import Link from "next/link";
import { PublicationFooter, PublicationHeader } from "@/components/publication-shell";
import { listPublishedArticles } from "@/lib/articles";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Articles | L-Proof-AI",
  description: "공식 발표와 원문을 확인하고 사람의 판단을 더한 L-Proof-AI 발행물 아카이브.",
  alternates: { canonical: "/articles" },
  openGraph: {
    title: "Articles | L-Proof-AI",
    description: "공식 발표와 원문을 확인하고 사람의 판단을 더한 L-Proof-AI 발행물 아카이브.",
    url: "/articles",
  },
};

const dateFormatter = new Intl.DateTimeFormat("ko-KR", {
  timeZone: "Asia/Seoul",
  year: "numeric",
  month: "long",
  day: "numeric",
});

export default async function ArticlesPage() {
  const { articles } = await listPublishedArticles({ limit: 50 });
  return (
    <main className="publication-page">
      <PublicationHeader />
      <header className="archive-hero">
        <p>L‑PROOF‑AI · PUBLISHED ARCHIVE</p>
        <h1>확인한 것과<br />판단한 것을 남깁니다.</h1>
        <p>AI가 모은 소식을 원문부터 확인하고, 개발자에게 무엇이 달라지는지 사람의 판단을 더한 발행물입니다.</p>
      </header>
      <section className="archive-list" aria-label="L-Proof-AI 아티클 목록">
        {articles.length === 0 ? (
          <div className="archive-empty">
            <h2>아직 공개된 아티클이 없습니다.</h2>
            <p>승인된 첫 발행물이 공개되면 이곳에서 읽을 수 있습니다.</p>
          </div>
        ) : articles.map((article) => (
          <article className="archive-row" key={article.id}>
            <div className="archive-row-meta">
              <span>{article.editionNumber ? `ISSUE ${String(article.editionNumber).padStart(2, "0")}` : "L‑PROOF‑AI"}</span>
              <time dateTime={article.publishedAt}>{dateFormatter.format(new Date(article.publishedAt))}</time>
              <span>PROOF LEVEL {String(article.proofLevel).padStart(2, "0")}</span>
            </div>
            <div>
              <h2><Link href={`/articles/${article.slug}`} prefetch={false}>{article.title}</Link></h2>
              <p>{article.summary}</p>
              {article.tags.length > 0 ? (
                <ul className="article-tags" aria-label="태그">
                  {article.tags.map((tag) => <li key={tag}>{tag}</li>)}
                </ul>
              ) : null}
            </div>
            <Link className="archive-row-link" href={`/articles/${article.slug}`} aria-label={`${article.title} 읽기`} prefetch={false}>→</Link>
          </article>
        ))}
      </section>
      <PublicationFooter />
    </main>
  );
}
