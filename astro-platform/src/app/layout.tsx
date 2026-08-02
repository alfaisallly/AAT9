import type { Metadata } from "next";
import "./globals.css";
import AppLayout from "@/components/AppLayout";

export const metadata: Metadata = {
  title: "AstroLab — Eng. Ahmed alfaisal",
  description:
    "منصة إدارة التصوير الفلكي — تطوير Eng. Ahmed alfaisal — جميع الحقوق محفوظة",
  authors: [{ name: "Ahmed alfaisal" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className="min-h-screen antialiased">
        <AppLayout>{children}</AppLayout>
      </body>
    </html>
  );
}
