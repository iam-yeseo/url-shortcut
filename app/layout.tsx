import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import { DEFAULT_SITE_SETTINGS } from "./types";
import "./globals.css";

function resolveAssetUrl(value: string, baseUrl: URL) {
  if (!value) return undefined;

  try {
    return new URL(value, baseUrl).toString();
  } catch {
    return undefined;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("host") ?? "localhost:3000";
  const forwardedProtocol = requestHeaders.get("x-forwarded-proto");
  const protocol = forwardedProtocol ?? (host.startsWith("localhost") ? "http" : "https");
  const baseUrl = new URL(`${protocol}://${host}`);
  const imageUrl = resolveAssetUrl(DEFAULT_SITE_SETTINGS.thumbnailUrl, baseUrl);

  return {
    metadataBase: baseUrl,
    title: {
      default: DEFAULT_SITE_SETTINGS.title,
      template: `%s · ${DEFAULT_SITE_SETTINGS.title}`,
    },
    description: DEFAULT_SITE_SETTINGS.description,
    openGraph: {
      type: "website",
      locale: "ko_KR",
      title: DEFAULT_SITE_SETTINGS.title,
      description: DEFAULT_SITE_SETTINGS.description,
      images: imageUrl ? [{ url: imageUrl, alt: `${DEFAULT_SITE_SETTINGS.title} 썸네일` }] : undefined,
    },
    twitter: {
      card: imageUrl ? "summary_large_image" : "summary",
      title: DEFAULT_SITE_SETTINGS.title,
      description: DEFAULT_SITE_SETTINGS.description,
      images: imageUrl ? [imageUrl] : undefined,
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
