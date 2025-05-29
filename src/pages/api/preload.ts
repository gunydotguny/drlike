import type { NextApiRequest, NextApiResponse } from "next";
import path from "path";
import fs from "fs";
import { getCollection } from "../../utils/chromaClient";
import { getEmbedding } from "../../lib/getEmbeddings";
import { flattenCaseData } from "../../utils/flattenCaseData";

// JSON 데이터 파일 경로
const filePath = path.join(process.cwd(), "data", "clinical_cases.json");

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    const cases = JSON.parse(raw);
    const collection = await getCollection("clinical-cases-1024-v3");

    const results = [];

    for (const caseData of cases) {
      const caseSummary = caseData.case_summary || JSON.stringify(caseData);

      if (!caseData.case_id) {
        console.warn(`⚠️ case_id 없음`, caseData);
        results.push({ case_id: null, status: "skipped", reason: "no case_id" });
        continue;
      }

      const embedding = await getEmbedding(caseData);
      if (!embedding || embedding.length !== 1024) {
        console.warn(`❌ Invalid embedding for case_id: ${caseData.case_id}`);
        results.push({ case_id: caseData.case_id, status: "skipped", reason: "invalid embedding" });
        continue;
      }

      try {
        const metadata = flattenCaseData(caseData);

        await collection.upsert({
          ids: [caseData.case_id],
          embeddings: [embedding],
          metadatas: [metadata],
          documents: [caseSummary],
        });

        results.push({ case_id: caseData.case_id, status: "uploaded" });
      } catch (err) {
        console.error(`❌ Failed to upsert: ${caseData.case_id}`, err);
        results.push({ case_id: caseData.case_id, status: "error", error: String(err) });
      }
    }

    return res.status(200).json({
      message: "✅ Preload complete",
      total: cases.length,
      uploaded: results.filter((r) => r.status === "uploaded").length,
      results,
    });
  } catch (e) {
    console.error("🔥 API 오류:", e);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
