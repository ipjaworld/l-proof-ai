import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PublicationFooter, PublicationHeader } from "@/components/publication-shell";
import { renderArticleMarkdown } from "@/lib/article-markdown";
import { getAdjacentPublishedArticles, getPublishedArticle } from "@/lib/articles";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

const dateFormatter = new Intl.DateTimeFormat("ko-KR", {
  timeZone: "Asia/Seoul",
  year: "numeric",
  month: "long",
  day: "numeric",
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getPublishedArticle(slug);
  if (!article) return { title: "아티클을 찾을 수 없습니다 | L-Proof-AI" };
  const path = `/articles/${article.slug}`;
  return {
    title: `${article.title} | L-Proof-AI`,
    description: article.summary,
    alternates: { canonical: path },
    openGraph: {
      type: "article",
      locale: "ko_KR",
      url: path,
      title: article.title,
      description: article.summary,
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt,
      authors: ["이건하"],
      tags: article.tags,
      images: article.heroImageUrl ? [article.heroImageUrl] : ["/og.png"],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.summary,
      images: article.heroImageUrl ? [article.heroImageUrl] : ["/og.png"],
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = await getPublishedArticle(slug);
  if (!article) notFound();
  const adjacent = await getAdjacentPublishedArticles(article);
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.summary,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt,
    mainEntityOfPage: article.url,
    author: { "@type": "Person", name: "이건하" },
    publisher: { "@type": "Organization", name: "L-Proof-AI", url: "https://l-proof-ai.xyz" },
    image: article.heroImageUrl ?? "https://l-proof-ai.xyz/og.png",
  };
  return (
    <main className="publication-page">
      <PublicationHeader />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }}
      />
      <article className="article-detail">
        <nav className="article-breadcrumb" aria-label="현재 위치">
          <Link href="/" prefetch={false}>L-Proof-AI</Link><span>/</span><Link href="/articles" prefetch={false}>Articles</Link>
        </nav>
        <header className="article-detail-header">
          <p>
            {article.editionNumber ? `ISSUE ${String(article.editionNumber).padStart(2, "0")} · ` : ""}
            PROOF LEVEL {String(article.proofLevel).padStart(2, "0")}
          </p>
          <h1>{article.title}</h1>
          <p className="article-deck">{article.summary}</p>
          <div className="article-byline">
            <span>이건하</span>
            <time dateTime={article.publishedAt}>{dateFormatter.format(new Date(article.publishedAt))}</time>
          </div>
          {article.tags.length > 0 ? (
            <ul className="article-tags" aria-label="태그">
              {article.tags.map((tag) => <li key={tag}>{tag}</li>)}
            </ul>
          ) : null}
        </header>
        <div
          className="article-body"
          dangerouslySetInnerHTML={{ __html: renderArticleMarkdown(article.contentText) }}
        />
        <footer className="article-end">
          <p>다음 발행물은 이메일로 먼저 알려드려요.</p>
          <Link href="/#signup-title" prefetch={false}>L-Proof-AI 구독하기 →</Link>
        </footer>
      </article>
      <nav className="article-pagination" aria-label="이전 및 다음 아티클">
        {adjacent.older ? <Link href={`/articles/${adjacent.older.slug}`} prefetch={false}><span>이전 글</span>{adjacent.older.title}</Link> : <span />}
        {adjacent.newer ? <Link href={`/articles/${adjacent.newer.slug}`} prefetch={false}><span>다음 글</span>{adjacent.newer.title}</Link> : <span />}
      </nav>
      <PublicationFooter />
    </main>
  );
}
