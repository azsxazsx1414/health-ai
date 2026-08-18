import type { Metadata } from "next";
import "@fontsource/vazirmatn/400.css";
import "@fontsource/vazirmatn/500.css";
import "@fontsource/vazirmatn/700.css";
import "@fontsource/vazirmatn/900.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "سلامت‌یار | دستیار هوشمند سلامتی",
  description: "برنامه شخصی‌سازی شده آب، کالری و تغذیه با هوش مصنوعی",
};
import WaterReminder from "@/components/WaterReminder";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl">
      <body className="antialiased">{children}<WaterReminder /></body>
    </html>
  );
}