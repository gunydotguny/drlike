import fetch from "node-fetch";

// ✅ Preprocessing 함수 그대로 유지
const preprocessText = (text: string): string => {
    return text.trim().normalize("NFKC");
};

export const getEmbedding = async (text: string): Promise<number[]> => {
    try {
        const cleanText = preprocessText(text);  // ✅ 전처리
        const res = await fetch("https://api.upstage.ai/v1/embeddings", {
            method: "POST",
            headers: {
                "Authorization": "Bearer up_eQz8t6MFedgOonUEnecs5nu1sUyAk",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "solar-embedding-1-large-query",
                input: [cleanText]
            })
        });

        if (!res.ok) {
            throw new Error(`API 요청 실패: ${res.status} ${res.statusText}`);
        }

        const data = await res.json();
        const embedding = data?.data?.[0]?.embedding;
        if (!embedding || !Array.isArray(embedding)) {
            throw new Error("❌ 임베딩 응답 이상: " + JSON.stringify(data));
        }

        console.log("✅ 생성된 임베딩 (앞 10개):", embedding.slice(0, 10));
        return embedding;
    } catch (error: any) {
        console.error("🔥 임베딩 API 호출 실패:", error.message || error);
        return Array(4096).fill(0);
    }
};

// ✅ 사용 예시:
(async () => {
    const vector = await getEmbedding("Hello world");
    console.log("🧪 벡터 길이:", vector.length);
})();
