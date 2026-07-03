import { fetchAllOfficialRanks } from "../src/lib/fetchers/wechat-official-fetcher";

async function main() {
  const date = process.argv[2];
  const result = await fetchAllOfficialRanks(date);
  console.log(JSON.stringify(result, null, 2));
  process.exit(result.success ? 0 : 1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
