import OpenAI from "openai";

const API_KEY = "up_eQz8t6MFedgOonUEnecs5nu1sUyAk";
const openai = new OpenAI({
    apiKey: API_KEY,
    baseURL: "https://api.upstage.ai/v1"
});

export const getEmbedding = async (text: string): Promise<number[]> => {
    try {
        const response = await openai.embeddings.create({
            model: "solar-embedding-1-large-query",
            input: text
        });
        console.log("🔥 임베딩 API 원본 응답:", response);
        if (!response.data || !response.data[0] || !response.data[0].embedding) {
            console.error("❌ 임베딩 API 응답 이상: ", response);
            throw new Error("임베딩 응답 없음");
        }

        const embedding = response.data[0].embedding;
        console.log("✅ 생성된 임베딩:", embedding);
        return embedding;
    } catch (error: any) {
        console.error("🔥 임베딩 API 호출 실패:", error.message || error);
        return Array(1024).fill(0);  // 실패 시 명시적으로 0 벡터 반환
    }
};