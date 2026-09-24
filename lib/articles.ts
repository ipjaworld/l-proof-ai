import { cache } from "react";
import { getCloudflareEnv } from "@/lib/cloudflare-env";

const siteOrigin = "https://l-proof-ai.xyz";

type ArticleRow = {
  id: string;
  edition_number: number | null;
  slug: string;
  subject: string;
  preview_text: string;
  content_text: string;
  proof_level: number;
  tags: string;
  hero_image_url: string | null;
  published_at: string;
  updated_at: string;
};

export type PublishedArticle = {
  id: string;
  editionNumber: number | null;
  slug: string;
  title: string;
  summary: string;
  contentText: string;
  proofLevel: number;
  tags: string[];
  heroImageUrl: string | null;
  publishedAt: string;
  updatedAt: string;
  url: string;
};

function database() {
  const values = getCloudflareEnv();
  if (!values.DB) throw new Error("Cloudflare D1 binding `DB` is unavailable");
  return values.DB;
}

function parseTags(value: string) {
  try {
    const parsed = JSON.parse(value) as unknown;
    return Array.isArray(parsed) ? parsed.filter((tag): tag is string => typeof tag === "string") : [];
  } catch {
    return [];
  }
}

function mapArticle(row: ArticleRow): PublishedArticle {
  return {
    id: row.id,
    editionNumber: row.edition_number,
    slug: row.slug,
    title: row.subject,
    summary: row.preview_text,
    contentText: row.content_text,
    proofLevel: row.proof_level,
    tags: parseTags(row.tags),
    heroImageUrl: row.hero_image_url,
    publishedAt: row.published_at,
    updatedAt: row.updated_at,
    url: `${siteOrigin}/articles/${encodeURIComponent(row.slug)}`,
  };
}

function decodeCursor(cursor: string | null) {
  if (!cursor) return null;
  try {
    const normalized = cursor.replace(/-/g, "+").replace(/_/g, "/");
    const padding = "=".repeat((4 - normalized.length % 4) % 4);
    const parsed = JSON.parse(atob(normalized + padding)) as unknown;
    if (!Array.isArray(parsed) || parsed.length !== 2 || parsed.some((item) => typeof item !== "string")) {
      return null;
    }
    return { publishedAt: parsed[0], id: parsed[1] };
  } catch {
    return null;
  }
}

export function encodeArticleCursor(article: Pick<PublishedArticle, "publishedAt" | "id">) {
  return btoa(JSON.stringify([article.publishedAt, article.id]))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export async function listPublishedArticles(options: { limit?: number; cursor?: string | null } = {}) {
  const limit = Math.max(1, Math.min(options.limit ?? 20, 50));
  const now = new Date().toISOString();
  const cursor = decodeCursor(options.cursor ?? null);
  const fields = `id, edition_number, slug, subject, preview_text, content_text, proof_level,
    tags, hero_image_url, published_at, updated_at`;
  const query = cursor
    ? `SELECT ${fields} FROM briefing_editions
       WHERE publication_status = 'published' AND published_at <= ? AND slug IS NOT NULL
         AND (published_at < ? OR (published_at = ? AND id < ?))
       ORDER BY published_at DESC, id DESC LIMIT ?`
    : `SELECT ${fields} FROM briefing_editions
       WHERE publication_status = 'published' AND published_at <= ? AND slug IS NOT NULL
       ORDER BY published_at DESC, id DESC LIMIT ?`;
  const statement = cursor
    ? database().prepare(query).bind(now, cursor.publishedAt, cursor.publishedAt, cursor.id, limit + 1)
    : database().prepare(query).bind(now, limit + 1);
  const result = await statement.all<ArticleRow>();
  const articles = result.results.slice(0, limit).map(mapArticle);
  return {
    articles,
    nextCursor: result.results.length > limit && articles.length > 0
      ? encodeArticleCursor(articles[articles.length - 1])
      : null,
  };
}

export const getPublishedArticle = cache(async (slug: string) => {
  const row = await database().prepare(
    `SELECT id, edition_number, slug, subject, preview_text, content_text, proof_level,
      tags, hero_image_url, published_at, updated_at
     FROM briefing_editions
     WHERE slug = ? AND publication_status = 'published' AND published_at <= ?`,
  ).bind(slug, new Date().toISOString()).first<ArticleRow>();
  return row ? mapArticle(row) : null;
});

export async function getAdjacentPublishedArticles(article: PublishedArticle) {
  const now = new Date().toISOString();
  const fields = `id, edition_number, slug, subject, preview_text, content_text, proof_level,
    tags, hero_image_url, published_at, updated_at`;
  const [newer, older] = await database().batch<ArticleRow>([
    database().prepare(
      `SELECT ${fields} FROM briefing_editions
       WHERE publication_status = 'published' AND published_at <= ? AND slug IS NOT NULL
         AND (published_at > ? OR (published_at = ? AND id > ?))
       ORDER BY published_at ASC, id ASC LIMIT 1`,
    ).bind(now, article.publishedAt, article.publishedAt, article.id),
    database().prepare(
      `SELECT ${fields} FROM briefing_editions
       WHERE publication_status = 'published' AND published_at <= ? AND slug IS NOT NULL
         AND (published_at < ? OR (published_at = ? AND id < ?))
       ORDER BY published_at DESC, id DESC LIMIT 1`,
    ).bind(now, article.publishedAt, article.publishedAt, article.id),
  ]);
  return {
    newer: newer.results[0] ? mapArticle(newer.results[0]) : null,
    older: older.results[0] ? mapArticle(older.results[0]) : null,
  };
}
