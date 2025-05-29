// /pages/api/preload.ts
import axios from "axios";
import { getEmbedding } from "../../lib/getEmbeddings";
import { flattenCaseData } from "../../utils/flattenCaseData";

const CHROMA_HOST = process.env.CHROMA_HOST!;
const COLLECTION_NAME = "drlike-case-collection";
const CASES_JSON_URL = "https://drlike.vercel.app/data/clinical_cases.json";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    // 1. 증례 데이터 fetch
    const response = await fetch(CASES_JSON_URL);
    const cases = await response.json();

    // 2. 컬렉션 생성 또는 확인
    const colList = await axios.get(`${CHROMA_HOST}/api/v1/collections`);
    let col = colList.data.find((c: any) => c.name === COLLECTION_NAME);

    if (!col) {
      const colRes = await axios.post(
        `${CHROMA_HOST}/api/v1/collections`,
        { name: COLLECTION_NAME },
        { headers: { "Content-Type": "application/json" } }
      );
      col = colRes.data;
    }

    const colId = col.id;
    let count = 0;

    // 3. 문서 loop 삽입
    for (const caseData of cases) {
      if (!caseData.case_id) continue;

      const embedding = await getEmbedding(caseData);
      if (!embedding || embedding.length !== 1024) continue;

      const metadata = flattenCaseData(caseData);
      const document = caseData.case_summary || JSON.stringify(caseData);

      await axios.post(
        `${CHROMA_HOST}/api/v1/collections/${colId}/add`,
        {
          ids: [caseData.case_id],
          documents: [document],
          embeddings: [embedding],
        },
        { headers: { "Content-Type": "application/json" } }
      );

      count++;
    }

    return res.status(200).json({ message: "✅ Preload complete", count });
  } catch (e: any) {
    console.error("🔥 Preload error:", e.message || e);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
