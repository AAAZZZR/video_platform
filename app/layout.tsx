import type { Metadata } from "next";
import Providers from "./providers";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://vidcraft.ai";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "VidCraft AI — AI 影片與海報生成平台",
    template: "%s | VidCraft AI",
  },
  description:
    "用 AI 在幾秒內生成專業影片和海報。支援 9 種場景模板、自訂動畫、語音旁白和字幕，一站完成從腳本到成品。",
  keywords: [
    "AI video generator",
    "AI poster maker",
    "AI 影片生成",
    "AI 海報設計",
    "Remotion",
    "VidCraft",
    "影片製作",
    "自動配音",
    "動態簡報",
  ],
  authors: [{ name: "VidCraft AI" }],
  creator: "VidCraft AI",
  openGraph: {
    type: "website",
    locale: "zh_TW",
    url: siteUrl,
    siteName: "VidCraft AI",
    title: "VidCraft AI — AI 影片與海報生成平台",
    description:
      "用 AI 在幾秒內生成專業影片和海報。9 種場景模板、自訂動畫、語音旁白、一鍵匯出。",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "VidCraft AI — AI Video & Poster Generation",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "VidCraft AI — AI 影片與海報生成平台",
    description: "用 AI 在幾秒內生成專業影片和海報。從腳本到成品，一站完成。",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/logo.svg",
    apple: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <body style={{ margin: 0, backgroundColor: "#09090b", color: "white" }}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
