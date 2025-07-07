// /pages/api/preload.ts
/**
 * 📝 Dr.LIKE - 증례 데이터 Preload API
 * - 임베딩 생성 → ChromaDB 저장
 * - 사용 대상: RAG용 초기 증례 데이터셋 사전 적재
 *
 * ✅ 주요 흐름:
 * 1. 원격 JSON 증례 데이터 fetch
 * 2. ChromaDB 컬렉션 존재 여부 확인 → 없으면 생성
 * 3. 각 증례:
 *    - case_summary가 있으면 요약문 임베딩
 *    - 없으면 전체 caseData를 JSON.stringify해서 임베딩
 *    - 메타데이터는 flattenCaseData()로 납작화
 *    - ChromaDB에 저장 (id, document, embedding, metadata)
 *
 * ✅ 데이터 전처리 주의:
 * - 반드시 문자열로 변환 후 임베딩해야 오류 없음
 * - Unicode 정규화(NFKC) + trim 적용
 */

import axios from "axios";
import { getEmbedding } from "../../lib/getEmbeddings";
import { flattenCaseData } from "../../utils/flattenCaseData";

// ✅ 환경 변수
const CHROMA_HOST = process.env.CHROMA_HOST!;
const COLLECTION_NAME = "drlike-case-collection";
const CASES_JSON_URL = "https://drlike.vercel.app/data/clinical_cases.json";

// ✅ 안전한 임베딩용 전처리 함수
const preprocessText = (text: any) => {
  let str: string;
  if (typeof text === "string") {
    str = text;
  } else if (typeof text === "object" && text !== null) {
    str = JSON.stringify(text, null, 2);
  } else {
    str = String(text);
  }
  return str.trim().normalize("NFKC");
};


// ✅ API 핸들러 (POST 전용)
export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    // 1. 증례 데이터 가져오기 (원격 JSON)
    const response = await fetch(CASES_JSON_URL);
    const cases = await response.json();

    // 2. ChromaDB 컬렉션 조회 → 없으면 생성
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

    // 3. 증례 데이터 Loop → 임베딩 & 저장
    for (const caseData of cases) {
      if (!caseData.case_id) continue; // case_id 없으면 skip

      const embeddingText = caseData.case_summary || caseData;

      // ✅ 반드시 문자열화 → 임베딩
      const embedding = await getEmbedding(preprocessText(embeddingText));
      if (!embedding || embedding.length !== 4096) {
        console.warn(`⚠️ 임베딩 실패 → 스킵: ${caseData.case_id}`);
        continue;
      }

      const metadata = flattenCaseData(caseData);
      const document = caseData.case_summary || JSON.stringify(caseData);

      // ✅ ChromaDB 저장 (upsert)
      await axios.post(
        `${CHROMA_HOST}/api/v1/collections/${colId}/add`,
        {
          ids: [caseData.case_id],
          documents: [document],
          embeddings: [embedding],
          metadatas: [metadata],
        },
        { headers: { "Content-Type": "application/json" } }
      );

      console.log(`✅ Uploaded: ${caseData.case_id}`);
      count++;
    }

    // ✅ 응답
    return res.status(200).json({ message: "✅ Preload complete", count });
  } catch (e: any) {
    console.error("🔥 Preload error:", e.message || e);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
