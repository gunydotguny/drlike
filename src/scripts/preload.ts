import "dotenv/config";
import path from "path";
import fs from "fs/promises";
import { getEmbedding } from "../lib/getEmbeddings";
import { flattenCaseData } from "../utils/flattenCaseData";

const CHROMA_API = "https://chroma-production-889a.up.railway.app";
const COLLECTION_NAME = "drlike-case-collection";

async function main() {
  try {
    const filePath = path.join(process.cwd(), "public", "data", "clinical_cases.json");
    const raw = await fs.readFile(filePath, "utf-8");
    const cases = JSON.parse(raw);

    // 1. 컬렉션 생성 (있어도 에러 무시)
    await fetch(`${CHROMA_API}/api/v1/collections`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: COLLECTION_NAME,
        metadata: { description: "Dr.LIKE 임상 증례 데이터" },
      }),
    }).catch(() => {
      // 이미 있으면 무시
    });

    // 2. 컬렉션 UUID 가져오기
    const listRes = await fetch(`${CHROMA_API}/api/v1/collections`);
    if (!listRes.ok) throw new Error(`Failed to list collections: ${await listRes.text()}`);
    const listJson = await listRes.json();

    const collection = listJson.find((c: any) => c.name === COLLECTION_NAME);
    if (!collection) throw new Error(`Collection ${COLLECTION_NAME} not found`);
    const collectionId = collection.id; // UUID

    console.log(`컬렉션 UUID: ${collectionId}`);

    let count = 0;

    // 3. 문서 업로드 루프
    for (const caseData of cases) {
      if (!caseData.case_id) continue;

      const embedding = await getEmbedding(caseData);
      if (!embedding || embedding.length !== 1024) {
        console.warn(`❌ Invalid embedding for case_id: ${caseData.case_id}`);
        continue;
      }

      const metadata = flattenCaseData(caseData);
      const document = caseData.case_summary || JSON.stringify(caseData);

      console.log("📦 inserting with collection:", collectionId);
      console.log("📦 payload:", {
        ids: [caseData.case_id],
        documents: [document],
        embeddings: [embedding],
        metadatas: [metadata],
      });

      const res = await fetch(`${CHROMA_API}/api/v1/collections/${collectionId}/upsert`, {
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
        const errorText = await res.text();
        console.error(`❌ Failed to insert case_id: ${caseData.case_id}\n${errorText}`);
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
