/** Google Analytics 4 测量 ID */
export const GA_MEASUREMENT_ID = "G-EZ3ZQS0KWP";

const GA_INLINE_SCRIPT = `
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', '${GA_MEASUREMENT_ID}');
`;

/**
 * Google 官方 gtag 片段，原样放入 <head> 紧后位置。
 * 不使用 next/script，确保检测工具能在 HTML 源码中直接看到标准 script 标签。
 */
export function GoogleAnalyticsHeadScripts() {
  return (
    <>
      {/* Google tag (gtag.js) */}
      <script
        async
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
      />
      <script dangerouslySetInnerHTML={{ __html: GA_INLINE_SCRIPT }} />
    </>
  );
}
