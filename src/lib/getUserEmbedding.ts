import { getEmbedding } from "./getEmbeddings";
import { userEmbeddingPrompt } from "../pages/api/prompt/user_embedding_prompt";

const API_KEY = process.env.UPSTAGE_API_KEY!;
const BASE_URL = "https://api.upstage.ai/v1";

// ✅ 공통 전처리 함수
const preprocessText = (text: string) => {
  return text.trim().normalize("NFKC");
};

export async function getUserEmbedding(userInput: any, presetPriority: any) {
  // 1. LLM 요약 생성
  const prompt = userEmbeddingPrompt
    .replace("{USER INPUT JSON}", JSON.stringify(userInput, null, 2))
    .replace("{PRESET PRIORITY JSON}", JSON.stringify(presetPriority, null, 2));

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
  if (!summary) {
    throw new Error("LLM summary not generated");
  }

  // ✅ 전처리 후 임베딩
  const cleanedSummary = preprocessText(summary);
  const embedding = await getEmbedding(cleanedSummary);
  return { summary: cleanedSummary, embedding };
}
