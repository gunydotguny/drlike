// api/test/recommend.ts

import type { NextApiRequest, NextApiResponse } from "next";
import { getUserEmbedding } from "../../../lib/getUserEmbedding";

const CHROMA_HOST = process.env.CHROMA_HOST!;
const COLLECTION_NAME = "pediatric_cases_structured_test";

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

        if (!embedding || embedding.length !== 4096) {
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
                n_results: 5,
                include: ["documents", "metadatas", "distances"],
            }),
        });

        if (!queryRes.ok) {
            const errorText = await queryRes.text();
            throw new Error(`Vector query failed with status ${queryRes.status}: ${errorText}`);
        }

        const queryData = await queryRes.json();
        const retrievedCases = (queryData.metadatas?.[0] || []).map((metadata: any, idx: number) => ({
            id: queryData.ids?.[0]?.[idx] || metadata.case_id,  // 안정적
            document: queryData.documents?.[0]?.[idx] || "",
            metadata,
            distance: queryData.distances?.[0]?.[idx] || null,
        }));
        return res.status(200).json({
            recommendationList: retrievedCases,
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
