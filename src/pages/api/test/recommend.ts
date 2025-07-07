// api/test/recommend.ts

import type { NextApiRequest, NextApiResponse } from "next";
import { getUserEmbedding } from "../../../lib/getUserEmbedding";

const CHROMA_HOST = process.env.CHROMA_HOST!;
const COLLECTION_NAME = "pediatric_cases_structured_test";

function restructureCase(caseItem: any) {
    const fixedFields = {
        patient_name: caseItem.metadata.patient_name,
        age_months: caseItem.metadata.age_months,
        sex: caseItem.metadata.sex,
        diagnosis: caseItem.metadata.diagnosis,
    };

    return {
        ...caseItem,
        fixed_fields: fixedFields,
        other_fields: { ...caseItem.metadata },  // ✅ 메타데이터 전체 넣기!
    };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method Not Allowed" });
    }

    try {
        const { formData, presetPriority, promptType } = req.body;

        const result = await getUserEmbedding(formData, presetPriority);
        if (!result) {
            return res.status(400).json({ error: "User embedding failed" });
        }
        const embedding = result.embedding;

        if (!embedding || embedding.length !== 1024) {
            return res.status(400).json({ error: "Invalid embedding result" });
        }

        const listRes = await fetch(`${CHROMA_HOST}/api/v1/collections`);
        const data = await listRes.json();
        const collections = Array.isArray(data) ? data : data.collections || [];


        console.log("검색 중인 컬렉션 이름:", JSON.stringify(COLLECTION_NAME));
        console.log("컬렉션 목록:", collections.map((c: any) => JSON.stringify(c.name)));


        const collection = collections.find((c: any) => c.name === COLLECTION_NAME);
        if (!collection) {
            return res.status(500).json({ error: "Collection not found" });
        }

        const collectionId = collection.id;
        const queryRes = await fetch(`${CHROMA_HOST}/api/v1/collections/${collectionId}/query`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                query_embeddings: [embedding],
                n_results: 10,
                include: ["documents", "metadatas", "distances"],
            }),
        });

        if (!queryRes.ok) {
            const errorText = await queryRes.text();
            throw new Error(`Vector query failed with status ${queryRes.status}: ${errorText}`);
        }

        const queryData = await queryRes.json();
        const retrievedCases = (queryData.metadatas?.[0] || []).map((metadata: any, idx: number) => ({
            id: metadata.case_id,
            document: queryData.documents?.[0]?.[idx] || "",
            metadata,
            distance: queryData.distances?.[0]?.[idx] || null,
        }));

        const restructuredCases = retrievedCases.map(restructureCase);

        return res.status(200).json({
            recommendationList: restructuredCases,
            retrievedCases,
            debug: {
                promptType,
                COLLECTION_NAME,
                retrieved: retrievedCases.length,
            },
        });
    } catch (e: any) {
        return res.status(500).json({ error: "Internal Server Error", detail: e.message });
    }
}
