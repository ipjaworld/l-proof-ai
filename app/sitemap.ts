import type { MetadataRoute } from "next";

const origin = "https://l-proof-ai.ipjaworld.chatgpt.site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: origin, changeFrequency: "weekly", priority: 1 },
    { url: `${origin}/privacy`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${origin}/unsubscribe`, changeFrequency: "yearly", priority: 0.5 },
  ];
}
