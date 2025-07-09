import { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.UPSTAGE_API_KEY!,
  baseURL: "https://api.upstage.ai/v1",
});

// ✅ 추천 API 호출 함수 (질문 → 벡터 검색 → 증례 추천)
async function fetchRecommendedCases(message: string) {
  const res = await fetch(`${process.env.API_BASE_URL}/api/test/recommend`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      formData: { question: message },
      presetPriority: [],
      promptType: "chatbot",
    }),
  });
  const data = await res.json();
  return data.recommendationList || [];
}

// ✅ 최종 handler
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { message } = req.body;

  try {
    // 1️⃣ 추천 API 호출 → 증례 추천
    const recommendedCases = await fetchRecommendedCases(message);

    // 2️⃣ LLM 가이드 문구 생성 (증례 요약 X, 증례 개수만 활용)
    const prompt = `
너는 소아 감염/호흡기/알레르기 분야의 의학 전문가야.

아래 질문과 추천된 유사 증례를 참고해서,
사용자에게 다음 내용으로 안내할 가이드 문구를 작성해줘:
- ✅ 총 ${recommendedCases.length}건의 유사 증례가 추천되었음
- 증례 요약들은 아래에 따로 제공될 예정이니, 증례 목록은 절대 반복하지 말고
- 증례를 참고하여 적절한 의료 상담이나 추가 행동을 권장하는 식으로 자연스럽게 안내

절대 증례 내용을 반복하지 말고, 다음과 같은 아주 짧은 안내 문구를 작성해줘:

- "총 N건의 유사 증례가 추천되었습니다. 아래 증례를 참고하세요." 정도의 매우 간단한 한 문장으로만 안내.
- 절대 추가 설명, 증례 분석, 의학 정보, 조언 등을 포함하지 말 것.
- 반드시 한 문장만 출력.
- ✅ 이모지 꼭 포함


사용자 질문:
${message}

- 사용자의 입력에서 연령 정보가 '세'로 주어질 경우, 반드시 '개월(months)' 단위로 변환해 판단해야 돼
예: 3세 → 36개월

추천된 증례 개수: ${recommendedCases.length}
`;

    const completion = await openai.chat.completions.create({
      model: "solar-pro",
      messages: [{ role: "user", content: prompt }],
    });

    const guideMessage = completion.choices[0].message?.content || "";

    // 3️⃣ 응답 구조화: 가이드 + 증례 목록 (요약 + JSON 데이터)
    res.status(200).json({
      guideMessage,
      cases: recommendedCases.map((c: any) => ({
        case_id: c.case_id,
        summary: c.document,
        metadata: c.metadata,
      })),
    });
  } catch (error) {
    console.error("API Error:", error);
    res.status(500).json({ guideMessage: "❗️ API 호출 실패", cases: [] });
  }
}
