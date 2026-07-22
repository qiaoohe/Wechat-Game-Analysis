import type { Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";

import { UmamiAnalytics } from "@/components/analytics/umami-analytics";
import { AppShell } from "@/components/layout/app-shell";
import { RouteLoadingBar } from "@/components/layout/route-loading-bar";
import { SiteJsonLd } from "@/components/seo/site-json-ld";
import { createRootMetadata } from "@/lib/site-seo";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#e04d4e",
};

export const metadata = createRootMetadata();

/** 榜单日更，ISR 5 分钟；抓取成功后会 on-demand revalidate */
export const revalidate = 300;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <SiteJsonLd />
        <Suspense fallback={null}>
          <RouteLoadingBar />
        </Suspense>
        <AppShell>{children}</AppShell>
        <UmamiAnalytics />
      </body>
    </html>
  );
}
