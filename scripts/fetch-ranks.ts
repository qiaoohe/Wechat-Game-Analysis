import { fetchAllRanks } from "../src/lib/fetchers/rank-fetcher";
import { fetchAndPersistInsights } from "../src/lib/fetchers/wechat-mp-insight-fetcher";
import { triggerRemoteRevalidate } from "./trigger-revalidate";

async function main() {
  const date = process.argv[2];
  const skipInsights = process.argv.includes("--ranks-only");

  const result = await fetchAllRanks(date);
  console.log(JSON.stringify(result, null, 2));

  let insights = null;
  if (!skipInsights) {
    insights = await fetchAndPersistInsights();
    console.log(JSON.stringify({ insights }, null, 2));
  }

  const insightOk = insights
    ? insights.hotWords.count > 0 ||
      insights.hotSearch.count > 0 ||
      insights.ipTrends.count > 0
    : false;
  const success = result.success || insightOk;

  if (success) {
    const revalidate = await triggerRemoteRevalidate();
    console.log(JSON.stringify({ revalidate }, null, 2));
  }

  process.exit(success ? 0 : 1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
