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
      <body className="antialiased">{children}<link rel="manifest" href="/manifest.webmanifest" />
<meta name="theme-color" content="#10b981" />
<link rel="icon" href="/icon.svg" type="image/svg+xml" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-title" content="سلامت‌یار" /><WaterReminder /></body>
    </html>
  );
}