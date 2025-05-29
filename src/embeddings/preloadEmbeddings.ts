import fs from "fs";
import path from "path";
import { getCollection } from "../utils/chromaClient";
import { getEmbedding } from "../lib/getEmbeddings";
import { flattenCaseData } from "../utils/flattenCaseData";

const filePath = path.join(__dirname, "../data/clinical_cases.json");
const raw = fs.readFileSync(filePath, "utf-8");
const cases = JSON.parse(raw);

(async () => {
    const collection = await getCollection("drlike-case-collection");

    for (const caseData of cases) {
        const caseSummary = caseData.case_summary || JSON.stringify(caseData);

        if (!caseData.case_id) {
            console.warn(`⚠️ case_id 없음:`, caseData);
            continue;
        }

        const embedding = await getEmbedding(caseData);

        if (!embedding || embedding.length !== 1024) {
            console.warn(`❌ Invalid embedding for case_id: ${caseData.case_id}`);
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

            console.log(`✅ Uploaded: ${caseData.case_id}`);
        } catch (err) {
            console.error(`❌ Failed to upsert case_id: ${caseData.case_id}`, err);
            console.error("❗ Failed caseData:", {
                id: caseData.case_id,
                caseData,
                caseSummary
            });
        }

    }
})();
