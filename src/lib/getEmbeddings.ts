import OpenAI from "openai";

const API_KEY = "up_eQz8t6MFedgOonUEnecs5nu1sUyAk"; // 실제 키로 교체하세요
const openai = new OpenAI({
    apiKey: API_KEY,
    baseURL: "https://api.upstage.ai/v1"
});

export const getEmbedding = async (caseData: any): Promise<number[]> => {
    const text = JSON.stringify(caseData);
    const response = await openai.embeddings.create({
        model: "embedding-query",
        input: text
    });
    const embedding = response.data[0].embedding;
    console.log("✅ 벡터 길이:", embedding.length);
    return embedding;
};