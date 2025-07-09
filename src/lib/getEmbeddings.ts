import fetch from "node-fetch";

// ✅ 모든 나이 표현 → 개월로 변환하는 함수 (한/영 올인원)
const convertAllAgesToMonths = (text: string): string => {
    let converted = text;

    // 한글: '세' → 개월
    converted = converted.replace(/(\d+)\s*세/g, (_, years) => `${parseInt(years, 10) * 12}개월`);
    converted = converted.replace(/만\s*(\d+)\s*세/g, (_, years) => `${parseInt(years, 10) * 12}개월`);
    converted = converted.replace(/나이\s*(\d+)/g, (_, years) => `${parseInt(years, 10) * 12}개월`);
    converted = converted.replace(/(\d+)\s*살/g, (_, years) => `${parseInt(years, 10) * 12}개월`);

    // 한글: 생후/태어난지 → 개월
    converted = converted.replace(/생후\s*(\d+)\s*(개월|달)/g, (_, months) => `${months}개월`);
    converted = converted.replace(/태어난지\s*(\d+)\s*(개월|달)/g, (_, months) => `${months}개월`);

    // 영어: age, aged → 개월
    converted = converted.replace(/\bage\s*(\d+)\b/gi, (_, years) => `${parseInt(years, 10) * 12} months`);
    converted = converted.replace(/\baged\s*(\d+)\b/gi, (_, years) => `${parseInt(years, 10) * 12} months`);

    // 영어: years old → 개월
    converted = converted.replace(/(\d+)\s*(years|year)\s*old/gi, (_, years) => `${parseInt(years, 10) * 12} months`);

    // 영어: months old → 개월
    converted = converted.replace(/(\d+)\s*(months|month)\s*old/gi, (_, months) => `${months} months`);

    // 신생아 특수 케이스 (선택적으로 생후 0개월로 처리)
    converted = converted.replace(/\b(newborn|infant|신생아)\b/gi, "0개월");

    return converted;
};

// ✅ 기존 전처리 함수 (그대로 유지)
const preprocessText = (text: string): string => {
    return text.trim().normalize("NFKC");
};

// ✅ 최종 임베딩 생성 함수 (변환 포함)
export const getEmbedding = async (text: string): Promise<number[]> => {
    try {
        // ✅ 1️⃣ 모든 연령 표현 → 개월 변환 (핵심 추가)
        const ageConvertedText = convertAllAgesToMonths(text);

        // ✅ 2️⃣ 기존 전처리 적용 (공백 정리 등)
        const cleanText = preprocessText(ageConvertedText);

        console.log("🚀 변환된 입력 텍스트:", cleanText);

        // ✅ 3️⃣ 임베딩 생성
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
}