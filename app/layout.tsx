import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ErrorBoundary } from "./components/ui/ErrorBoundary";

export const metadata: Metadata = {
  title: "魔法小课桌 - 多比学习助手",
  description: "你的AI魔法学习伙伴，让学习充满魔力",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#6366f1",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#6366f1" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body>
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </body>
    </html>
  );
}
