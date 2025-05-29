// /pages/api/preload.ts

import { getEmbedding } from "../../lib/getEmbeddings";
import { getCollection } from "../../utils/chromaClient";
import { flattenCaseData } from "../../utils/flattenCaseData";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    // ✅ public/clinical_cases.json → 정적 URL로 fetch
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000";

    const response = await fetch(`${baseUrl}/data/clinical_cases.json`);
    const cases = await response.json();

    const collection = await getCollection("clinical-cases-1024-v3");

    let count = 0;

    for (const caseData of cases) {
      if (!caseData.case_id) continue;

      const embedding = await getEmbedding(caseData);
      if (!embedding || embedding.length !== 1024) continue;

      const metadata = flattenCaseData(caseData);

      await collection.upsert({
        ids: [caseData.case_id],
        embeddings: [embedding],
        metadatas: [metadata],
        documents: [caseData.case_summary || JSON.stringify(caseData)],
      });

      count += 1;
    }

    return res.status(200).json({ message: "✅ Preload complete", count });
  } catch (e) {
    console.error("🔥 Preload error:", e);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
