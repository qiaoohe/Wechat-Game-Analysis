import type { Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";

import { GoogleAnalyticsHeadScripts } from "@/components/analytics/google-analytics";
import { GoogleAnalyticsPageView } from "@/components/analytics/google-analytics-pageview";
import { AppShell } from "@/components/layout/app-shell";
import { RouteLoadingBar } from "@/components/layout/route-loading-bar";
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

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

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
      <head>
        <GoogleAnalyticsHeadScripts />
      </head>
      <body className="min-h-full">
        <Suspense fallback={null}>
          <GoogleAnalyticsPageView />
        </Suspense>
        <Suspense fallback={null}>
          <RouteLoadingBar />
        </Suspense>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
