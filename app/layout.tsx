import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "魔法小课桌 - 多比学习助手",
  description: "你的AI魔法学习伙伴，让学习充满魔力",
  manifest: "/manifest.json",
  themeColor: "#6366f1",
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
        {children}
      </body>
    </html>
  );
}
