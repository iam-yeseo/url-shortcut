import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("host") ?? "localhost:3000";
  const forwardedProtocol = requestHeaders.get("x-forwarded-proto");
  const protocol = forwardedProtocol ?? (host.startsWith("localhost") ? "http" : "https");
  const baseUrl = new URL(`${protocol}://${host}`);
  const imageUrl = new URL("/og.png", baseUrl).toString();

  return {
    metadataBase: baseUrl,
    title: {
      default: "Vibe Archive",
      template: "%s · Vibe Archive",
    },
    description: "그동안 만든 바이브코딩 프로젝트를 한곳에 모은 링크 아카이브입니다.",
    openGraph: {
      type: "website",
      locale: "ko_KR",
      title: "바이브로 만든 작은 세계들",
      description: "그동안 만든 바이브코딩 프로젝트를 한곳에서 만나보세요.",
      images: [{ url: imageUrl, width: 1200, height: 630, alt: "바이브 아카이브" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "바이브로 만든 작은 세계들",
      description: "그동안 만든 바이브코딩 프로젝트를 한곳에서 만나보세요.",
      images: [imageUrl],
    },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#f4f3ee",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
