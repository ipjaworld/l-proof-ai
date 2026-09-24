import Link from "next/link";
import { listPublishedArticles } from "@/lib/articles";

const dateFormatter = new Intl.DateTimeFormat("ko-KR", {
  timeZone: "Asia/Seoul",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export async function LatestArticles() {
  let articles;
  try {
    ({ articles } = await listPublishedArticles({ limit: 3 }));
  } catch {
    return null;
  }
  if (articles.length === 0) return null;
  return (
    <section className="latest-articles" aria-labelledby="latest-articles-title">
      <div className="latest-articles-heading">
        <div>
          <p>L‑PROOF‑AI · ARCHIVE</p>
          <h2 id="latest-articles-title">최근 발행물</h2>
        </div>
        <Link href="/articles" prefetch={false}>전체 아티클 보기 →</Link>
      </div>
      <div className="article-card-grid">
        {articles.map((article) => (
          <article className="article-card" key={article.id}>
            <p className="article-card-meta">
              {article.editionNumber ? `ISSUE ${String(article.editionNumber).padStart(2, "0")} · ` : ""}
              {dateFormatter.format(new Date(article.publishedAt))}
            </p>
            <h3><Link href={`/articles/${article.slug}`} prefetch={false}>{article.title}</Link></h3>
            <p>{article.summary}</p>
            <Link className="article-card-link" href={`/articles/${article.slug}`} prefetch={false}>원문 읽기 →</Link>
          </article>
        ))}
      </div>
    </section>
  );
}
