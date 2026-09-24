import type { MetadataRoute } from "next";
import { listPublishedArticles } from "@/lib/articles";

export const dynamic = "force-dynamic";

const origin = "https://l-proof-ai.xyz";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: origin, changeFrequency: "weekly", priority: 1 },
    { url: `${origin}/articles`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${origin}/privacy`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${origin}/unsubscribe`, changeFrequency: "yearly", priority: 0.5 },
  ];
  try {
    const { articles } = await listPublishedArticles({ limit: 50 });
    return [
      ...staticRoutes,
      ...articles.map((article) => ({
        url: article.url,
        lastModified: new Date(article.updatedAt),
        changeFrequency: "monthly" as const,
        priority: 0.8,
      })),
    ];
  } catch {
    return staticRoutes;
  }
}
