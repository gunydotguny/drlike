import path from "path";
import { promises as fs } from "fs";
import { getCollection } from "../../utils/chromaClient";
import { getEmbedding } from "../../lib/getEmbeddings";
import { flattenCaseData } from "../../utils/flattenCaseData";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    // ✅ public 디렉토리에 있는 파일 읽기
    const filePath = path.join(process.cwd(), "public", "clinical_cases.json");
    const raw = await fs.readFile(filePath, "utf-8");
    const cases = JSON.parse(raw);

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
