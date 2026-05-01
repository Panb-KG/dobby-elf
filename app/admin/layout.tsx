import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "多比后台管理 - Dobi Admin",
  description: "魔法小课桌后台管理平台",
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="bg-gray-50 min-h-screen">
        {children}
      </body>
    </html>
  );
}
