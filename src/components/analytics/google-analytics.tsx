import Script from "next/script";

/** Google Analytics 4 测量 ID */
export const GA_MEASUREMENT_ID = "G-EZ3ZQS0KWP";

/**
 * 使用 beforeInteractive，让 gtag 写入服务端 HTML 的 <head>，
 * 以便 Google Analytics「安装代码」检测工具能识别（afterInteractive 仅客户端注入）。
 * @see https://nextjs.org/docs/app/api-reference/components/script#beforeinteractive
 * @see https://nextjs.org/docs/app/guides/third-party-libraries#google-analytics
 */
export function GoogleAnalytics() {
  return (
    <>
      <Script
        id="google-analytics-gtag"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="beforeInteractive"
      />
      <Script id="google-analytics-config" strategy="beforeInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}');
        `}
      </Script>
    </>
  );
}
