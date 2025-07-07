// src/scripts/preload.ts
import "dotenv/config";
import path from "path";
import fs from "fs/promises";
import axios from "axios";
import { getEmbedding } from "../lib/getEmbeddings";
import { flattenCaseData } from "../utils/flattenCaseData";

interface CollectionInfo {
  id: string;
  name: string;
  metadata?: Record<string, any>;
}

const CHROMA_HOST = process.env.CHROMA_HOST;
if (!CHROMA_HOST) {
  console.error("🔥 Error: .env에 CHROMA_HOST를 정의해주세요.");
  process.exit(1);
}

const V1 = `${CHROMA_HOST}/api/v1`;
const COLLECTION_NAME = "drlike-case-collection";

// ✅ 안전한 전처리 함수 추가
function preprocessText(text: any) {
  const str =
    typeof text === "string"
      ? text
      : typeof text === "object" && text !== null
      ? JSON.stringify(text, null, 2)
      : String(text);
  return str.trim().normalize("NFKC");
}

async function main() {
  // 0) 임베딩 데이터 불러오기
  const filePath = path.join(process.cwd(), "public", "data", "clinical_cases.json");
  const raw = await fs.readFile(filePath, "utf-8");
  const cases: any[] = JSON.parse(raw);

  // 1) 컬렉션 조회 후, 없으면 생성
  const existing: CollectionInfo[] = await axios
    .get<CollectionInfo[]>(`${V1}/collections`)
    .then(r => r.data);

  const col: CollectionInfo =
    existing.find(c => c.name === COLLECTION_NAME)
    ?? await axios
      .post<CollectionInfo>(
        `${V1}/collections`,
        { name: COLLECTION_NAME, metadata: { description: "Dr.LIKE 임상 증례 데이터" } },
        { headers: { "Content-Type": "application/json" } }
      )
      .then(r => r.data);
  console.log(`✅ 컬렉션 ID: ${col.id}`);

  // 2) 케이스별 문서 업로드
  let count = 0;
  for (const caseData of cases) {
    if (!caseData.case_id) continue;

    // ✅ 반드시 문자열로 변환해서 임베딩
    const embeddingText = preprocessText(caseData.case_summary || caseData);
    const embedding = await getEmbedding(embeddingText);
    if (!embedding || embedding.length !== 4096) {
      console.warn(`❌ Invalid embedding for case_id: ${caseData.case_id}`);
      continue;
    }

    const metadata = flattenCaseData(caseData);
    const document = caseData.case_summary || JSON.stringify(caseData);

    console.log("📦 upsert into:", col.id, {
      ids: [caseData.case_id],
      documents: [document],
      embeddings: [embedding],
      metadatas: [metadata],
    });

    try {
      await axios.post(
        `${V1}/collections/${encodeURIComponent(col.id)}/upsert`,
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
    } catch (err: any) {
      console.error(
        `❌ Failed to upload ${caseData.case_id}:`,
        err.response?.data || err.message
      );
    }
  }

  console.log(`🎉 Done. Uploaded ${count} cases.`);
}

main().catch((e) => {
  console.error("🔥 Preload error:", e);
  process.exit(1);
});
