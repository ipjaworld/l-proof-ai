"use client";

import { useEffect, useState } from "react";
import type { ViewCounts } from "@/lib/views";

function EyeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2 12s3.6-6 10-6 10 6 10 6-3.6 6-10 6S2 12 2 12Z" />
      <circle cx="12" cy="12" r="2.5" />
    </svg>
  );
}

function useViewCounts(id: string, url: string, initial: ViewCounts | null) {
  const [counts, setCounts] = useState(initial);
  useEffect(() => {
    const dayKst = new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const key = `lproof:view:${dayKst}:${id}`;
    const counted = sessionStorage.getItem(key) === "1";
    if (!counted) sessionStorage.setItem(key, "1");
    fetch(url, { method: counted ? "GET" : "POST", cache: "no-store" })
      .then((response) => {
        if (!response.ok) throw new Error("View counter unavailable");
        return response.json() as Promise<ViewCounts>;
      })
      .then((value) => {
        setCounts(value);
      })
      .catch(() => {
        if (!counted) sessionStorage.removeItem(key);
      });
  }, [id, url]);
  return counts;
}

export function SiteViewCount({ initial }: { initial: ViewCounts | null }) {
  const counts = useViewCounts("home", "/api/views", initial);
  return (
    <div className="site-view-count" aria-label="사이트 조회수">
      <span><EyeIcon /> 전체 조회수 <strong>{counts?.total.toLocaleString("ko-KR") ?? "—"}</strong></span>
      <span><EyeIcon /> 오늘 조회수 <strong>{counts?.today.toLocaleString("ko-KR") ?? "—"}</strong></span>
    </div>
  );
}

export function ArticleViewCount({ slug, initial }: { slug: string; initial: number | null }) {
  const counts = useViewCounts(`article:${slug}`, `/api/views?slug=${encodeURIComponent(slug)}`, initial === null ? null : { total: initial, today: 0 });
  return <ViewCount total={counts?.total ?? initial} />;
}

export function SitePageTracker({ page }: { page: "articles" | "privacy" | "unsubscribe" }) {
  useViewCounts(`page:${page}`, `/api/views?page=${page}`, null);
  return null;
}

export function ViewCount({ total }: { total: number | null }) {
  const label = total === null ? "—" : total.toLocaleString("ko-KR");
  return <span className="view-count" aria-label={`조회수 ${label}`}><EyeIcon /> {label}</span>;
}
