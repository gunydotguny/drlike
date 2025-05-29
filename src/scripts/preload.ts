import "dotenv/config";
import path from "path";
import fs from "fs/promises";
import { getEmbedding } from "../lib/getEmbeddings";
import { flattenCaseData } from "../utils/flattenCaseData";

const FLY_INSERT_ENDPOINT = "https://chroma-fly.fly.dev/insert"; // <- 여기에 본인 Fly 주소

async function main() {
  try {
    const filePath = path.join(process.cwd(), "public", "data", "clinical_cases.json");
    const raw = await fs.readFile(filePath, "utf-8");
    const cases = JSON.parse(raw);

    let count = 0;

    for (const caseData of cases) {
      if (!caseData.case_id) continue;

      const embedding = await getEmbedding(caseData);
      if (!embedding || embedding.length !== 1024) {
        console.warn(`❌ Invalid embedding for case_id: ${caseData.case_id}`);
        continue;
      }

      const metadata = flattenCaseData(caseData);
      const document = caseData.case_summary || JSON.stringify(caseData);

      const res = await fetch(FLY_INSERT_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ids: [caseData.case_id],
          embeddings: [embedding],
          metadatas: [metadata],
          documents: [document],
        }),
      });

      if (!res.ok) {
        console.error(`❌ Failed to insert case_id: ${caseData.case_id}`);
        continue;
      }

      console.log(`✅ Uploaded: ${caseData.case_id}`);
      count++;
    }

    console.log(`🎉 Done. Uploaded ${count} cases.`);
  } catch (e) {
    console.error("🔥 Preload error:", e);
  }
}

main();
