import { getCollection } from "./chromaClient";
import { getEmbedding } from "../lib/getEmbeddings";

export const querySimilarCases = async (formData: any, topK: number = 10) => {
    const embedding = await getEmbedding(formData);
    const collection = await getCollection("drlike-case-collection");

    const result = await collection.query({
        queryEmbeddings: [embedding],
        nResults: topK,
    });

    const retrievedCases = result.metadatas?.[0] || [];
    const distances = result.distances?.[0] || [];

    const filtered = retrievedCases.filter((_, i) => distances[i] < 0.9); // 0.9 이상은 버리자

    console.log("🔍 Retrieved filtered cases:", filtered.length);
    return result;
};
