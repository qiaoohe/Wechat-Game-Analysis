import { fetchAllDouyinConsoleRanks } from "../src/lib/fetchers/douyin-console-fetcher";
import { triggerRemoteRevalidate } from "./trigger-revalidate";

async function main() {
  const date = process.argv[2];
  const result = await fetchAllDouyinConsoleRanks(date);
  console.log(JSON.stringify(result, null, 2));

  if (result.success) {
    const revalidate = await triggerRemoteRevalidate();
    console.log(JSON.stringify({ revalidate }, null, 2));
  }

  process.exit(result.success ? 0 : 1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
