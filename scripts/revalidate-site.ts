import { triggerRemoteRevalidate } from "./trigger-revalidate";

async function main() {
  const result = await triggerRemoteRevalidate();
  console.log(JSON.stringify(result, null, 2));
  process.exit(result.ok || result.skipped ? 0 : 1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
