import Script from "next/script";

const UMAMI_WEBSITE_ID = "70c70206-ebe6-4279-94b8-98e20efd5183";

export function UmamiAnalytics() {
  return (
    <Script
      defer
      src="https://cloud.umami.is/script.js"
      data-website-id={UMAMI_WEBSITE_ID}
      strategy="afterInteractive"
    />
  );
}
