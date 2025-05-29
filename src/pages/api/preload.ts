// /pages/api/preload.ts

import { getEmbedding } from "../../lib/getEmbeddings";
import { getCollection } from "../../utils/chromaClient";
import { flattenCaseData } from "../../utils/flattenCaseData";

export default async function handler(req: any, res: any) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method Not Allowed" });
    }

    try {
        const response = await fetch("https://drlike.vercel.app/data/clinical_cases.json");
        const cases = await response.json();

        const collection = await getCollection("drlike-case-collection");
        console.log(collection);

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
