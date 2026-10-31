import Link from "next/link";
import { siteContent } from "@/content/site";
import { interpretationHeading } from "@/lib/article-markdown";
import { listPublishedArticles } from "@/lib/articles";

const dateFormatter = new Intl.DateTimeFormat("ko-KR", {
  timeZone: "Asia/Seoul",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export async function FilmArchive() {
  let articles;
  try {
    ({ articles } = await listPublishedArticles({ limit: 2 }));
  } catch {
    return null;
  }
  if (articles.length === 0) return null;
  return (
    <section className="archive" aria-labelledby="archive-title">
      <div className="section-heading reveal">
        <h2 id="archive-title">먼저 읽어보세요</h2>
        <Link href="/articles" prefetch={false}>전체 보기 ↗</Link>
      </div>
      <div className="sheets">
        {articles.map((article) => {
          const level = siteContent.proofLevels[article.proofLevel - 1];
          const take = interpretationHeading(article.contentText);
          return (
            <Link className="sheet reveal" href={`/articles/${article.slug}`} prefetch={false} key={article.id}>
              <div className="sheet-head">
                <span>L–PROOF</span>
                <span>{article.editionNumber ? String(article.editionNumber).padStart(3, "0") : ""}</span>
              </div>
              <h3>{article.title}</h3>
              <p className="sheet-date">{dateFormatter.format(new Date(article.publishedAt))}</p>
              {level ? (
                <p className="sheet-proof">
                  <span className={`proof-sample proof-sample-${level.style}${level.stamped ? " proof-sample-stamped" : ""}`} aria-hidden="true" />
                  검증 수준 0{article.proofLevel} · {level.label}
                </p>
              ) : null}
              {take ? (
                <>
                  <p className="sheet-label">L-Proof의 해석</p>
                  <p className="sheet-take">{take}</p>
                </>
              ) : null}
              <span className="sheet-read">원문 읽기 ↗</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
