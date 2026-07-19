import type { Metadata } from "next";
import "./globals.css";
import AsiairShell from "@/components/asiair/AsiairShell";

export const metadata: Metadata = {
  title: "AstroLab — ASIAIR Style",
  description: "منصة إدارة التصوير الفلكي — واجهة ASIAIR من ZWO",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className="min-h-screen antialiased">
        <AsiairShell>{children}</AsiairShell>
      </body>
    </html>
  );
}
