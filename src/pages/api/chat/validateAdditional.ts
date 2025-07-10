import { NextApiRequest, NextApiResponse } from "next";

const API_KEY = process.env.UPSTAGE_API_KEY!;
const BASE_URL = "https://api.upstage.ai/v1";

function stripMarkdownFence(text: string): string {
  return text.replace(/^```json\s*/i, "")
             .replace(/```$/, "")
             .trim();
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { additionalAnswer } = req.body;

    const prompt = `
추가 질문에 대한 사용자의 응답을 아래 기준으로 판단해줘:

- 추가 질문 응답이 유효한 정보면, "VALID"로 표시하고 답변 내용을 반환해.
- 추가 질문 응답이 거부 의사(예: 없음, 몰라요, 잘 몰라요 등)면, "DECLINED"로 표시하고 null을 반환해.

반드시 아래 JSON 형식으로 정확하게 응답해:
{
  "status": "VALID" or "DECLINED",
  "info": 추가 정보 내용 or null
}

추가 질문 응답:
"${additionalAnswer}"
`;

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

    const data = await response.json();
    const content = data.choices[0].message.content.trim();
    const cleaned = stripMarkdownFence(content);

    console.log("LLM 응답 (정제 전):", content);
    console.log("LLM 응답 (정제 후):", cleaned);

    const parsed = JSON.parse(cleaned);
    return res.status(200).json(parsed);

  } catch (error) {
    console.error("LLM 호출 실패:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
