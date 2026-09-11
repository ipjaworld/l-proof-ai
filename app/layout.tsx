import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://l-proof-ai.ipjaworld.chatgpt.site"),
  title: "L-Proof-AI — AI가 모으고, 사람이 증명합니다",
  description: "코딩 에이전트와 LLM 소식을 원문과 직접 테스트로 검증해 보내는 개발자 브리핑.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "L-Proof-AI — AI가 모으고, 사람이 증명합니다",
    description: "코딩 에이전트와 LLM 소식을 원문과 직접 테스트로 검증해 보내는 개발자 브리핑.",
    type: "website",
    locale: "ko_KR",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "L-Proof-AI" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "L-Proof-AI — AI가 모으고, 사람이 증명합니다",
    description: "AI가 모으고, 사람이 증명하는 개발자 브리핑.",
    images: ["/og.png"],
  },
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">{children}</body>
    </html>
  );
}
