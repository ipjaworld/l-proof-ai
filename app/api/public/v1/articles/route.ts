import { listPublishedArticles } from "@/lib/articles";
import { sha256 } from "@/lib/briefing-workflow";

export const dynamic = "force-dynamic";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Accept, If-None-Match",
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const rawLimit = url.searchParams.get("limit");
  const limit = rawLimit === null ? 20 : Number(rawLimit);
  const cursor = url.searchParams.get("cursor");
  if (!Number.isInteger(limit) || limit < 1 || limit > 50) {
    return Response.json(
      { version: 1, error: "invalid-limit" },
      { status: 400, headers: { ...corsHeaders, "Cache-Control": "no-store" } },
    );
  }
  if (cursor && (cursor.length > 512 || !/^[A-Za-z0-9_-]+$/.test(cursor))) {
    return Response.json(
      { version: 1, error: "invalid-cursor" },
      { status: 400, headers: { ...corsHeaders, "Cache-Control": "no-store" } },
    );
  }

  const { articles, nextCursor } = await listPublishedArticles({ limit, cursor });
  const payload = {
    version: 1,
    items: articles.map((article) => ({
      editionNumber: article.editionNumber,
      slug: article.slug,
      title: article.title,
      summary: article.summary,
      publishedAt: article.publishedAt,
      proofLevel: article.proofLevel,
      tags: article.tags,
      imageUrl: article.heroImageUrl,
      url: article.url,
    })),
    nextCursor,
  };
  const body = JSON.stringify(payload);
  const etag = `"${(await sha256(body)).slice(0, 32)}"`;
  const headers = {
    ...corsHeaders,
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=3600",
    ETag: etag,
  };
  if (request.headers.get("if-none-match") === etag) {
    return new Response(null, { status: 304, headers });
  }
  return new Response(body, { headers });
}
