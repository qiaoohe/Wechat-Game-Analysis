import { enrichPublishersFromOfficial } from "../src/lib/services/publisher-service";
import { triggerRemoteRevalidate } from "./trigger-revalidate";

async function main() {
  const limitArg = process.argv.find((arg) => arg.startsWith("--limit="));
  const delayArg = process.argv.find((arg) => arg.startsWith("--delay="));
  const skipRevalidate = process.argv.includes("--no-revalidate");

  const limit = limitArg ? Number(limitArg.split("=")[1]) : 300;
  const delayMs = delayArg ? Number(delayArg.split("=")[1]) : 1000;

  if (!Number.isFinite(limit) || limit <= 0) {
    throw new Error("--limit 必须是正整数");
  }
  if (!Number.isFinite(delayMs) || delayMs < 0) {
    throw new Error("--delay 必须是非负整数（毫秒）");
  }

  console.log(
    JSON.stringify({ action: "enrich_publishers_start", limit, delayMs }, null, 2),
  );

  const result = await enrichPublishersFromOfficial({ limit, delayMs });
  console.log(JSON.stringify({ publishers: result }, null, 2));

  if (!skipRevalidate && result.updated > 0) {
    const revalidate = await triggerRemoteRevalidate();
    console.log(JSON.stringify({ revalidate }, null, 2));
  }

  process.exit(result.failed > 0 && result.updated === 0 ? 1 : 0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
