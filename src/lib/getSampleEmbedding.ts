import { getEmbedding } from "./getEmbeddings";
import { sampleEmbeddingPrompt } from "../pages/api/prompt/sample_embedding_prompt";

const API_KEY = process.env.UPSTAGE_API_KEY!;
const BASE_URL = "https://api.upstage.ai/v1";

// ✅ 임베딩용 전처리 함수 (한 곳에서 공통사용)
const preprocessText = (text: string) => {
  return text.trim().normalize("NFKC");
};

export async function getSampleEmbedding(caseData: any) {
  // 1. LLM 요약 생성
  const prompt = sampleEmbeddingPrompt.replace("{JSON DATA HERE}", JSON.stringify(caseData, null, 2));
  
  const response = await fetch(`${BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "solar-pro",
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) {
    throw new Error(`❌ LLM 호출 실패: ${response.status} ${response.statusText}`);
  }

  const result = await response.json();
  console.log("🔥 LLM 응답:", result);

  const summary = result.choices?.[0]?.message?.content?.trim();
  if (!summary) throw new Error("LLM summary not generated");

  // ✅ 전처리 적용 후 임베딩
  const cleanedSummary = preprocessText(summary);
  const embedding = await getEmbedding(cleanedSummary);

  // ✅ 테스트용 Embedding 비교도 수행
  const testText = `이 환자는 폐렴으로 입원 중이며, 상태는 안정적입니다. 항생제를 투여하고 있습니다.`;
  const testEmbedding = await getEmbedding(testText);
  console.log("🧪 테스트용 자연어 임베딩 결과:", testEmbedding);

  return { summary: cleanedSummary, embedding };
}
