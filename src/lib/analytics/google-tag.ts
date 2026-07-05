/** Google Analytics 4 测量 ID */
export const GA_MEASUREMENT_ID = "G-EZ3ZQS0KWP";

/** Google 官方安装片段（需紧接在 <head> 之后） */
export const GOOGLE_TAG_HEAD_SNIPPET = `<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', '${GA_MEASUREMENT_ID}');
</script>`;
