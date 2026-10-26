import { getPublishedArticle } from "@/lib/articles";
import { getViewCounts, recordView } from "@/lib/views";

export const dynamic = "force-dynamic";

async function pageKey(request: Request) {
  const params = new URL(request.url).searchParams;
  const slug = params.get("slug");
  const page = params.get("page");
  if (slug !== null && page !== null) return null;
  if (page !== null) {
    return ["articles", "privacy", "unsubscribe"].includes(page) ? `page:${page}` : null;
  }
  if (slug === null) return "home";
  if (!slug || slug.length > 200) return null;
  const article = await getPublishedArticle(slug);
  return article ? `article:${article.slug}` : null;
}

const headers = { "Cache-Control": "no-store" };

export async function GET(request: Request) {
  const key = await pageKey(request);
  if (!key) return Response.json({ error: "not-found" }, { status: 404, headers });
  return Response.json(await getViewCounts(key === "home" ? undefined : key), { headers });
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) {
    return Response.json({ error: "forbidden" }, { status: 403, headers });
  }
  const key = await pageKey(request);
  if (!key) return Response.json({ error: "not-found" }, { status: 404, headers });
  return Response.json(await recordView(key), { headers });
}
