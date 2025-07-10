import { NextApiRequest, NextApiResponse } from "next";

const API_KEY = process.env.UPSTAGE_API_KEY!;
const BASE_URL = "https://api.upstage.ai/v1";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method Not Allowed" });
    }

    try {
        const { userInput } = req.body;

        const prompt = `
사용자의 입력에서 아래 정보를 추출해 JSON으로 응답해줘:

1. 진료 상태 (visitStatus):
- "FIRST_VISIT" (첫 진료)
- "HOSPITALIZED" (입원 중)
- "UNKNOWN" (판단 불가)

2. 연령 값 (ageValue):
- 숫자로만 응답 (나이 없으면 null)

3. 연령 단위 (ageUnit):
- "month" (개월)
- "year" (세)
- 나이 없으면 null

4. 추가 질문 문구 (nextQuestion):
- 진료 상태나 연령이 누락된 경우에만 질문 문구를 생성
- 질문 문구는 부드럽고 친절하게 작성하고, 가능한 다양한 표현을 사용해 반복 사용 시 자연스럽게 느껴지도록 해줘
- 모든 정보가 충분하면 null을 반환해

응답은 반드시 아래 JSON 형식으로 해줘:
{
  "visitStatus": "",
  "ageValue": 숫자 or null,
  "ageUnit": "month" or "year" or null,
  "nextQuestion": 질문 문구 or null
}

사용자 입력:
"${userInput}"
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

        try {
            const parsed = JSON.parse(content);
            return res.status(200).json(parsed);
        } catch {
            console.error("LLM 응답 JSON 파싱 실패:", content);
            return res.status(500).json({ error: "Failed to parse LLM response" });
        }

    } catch (error) {
        console.error("LLM 호출 실패:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}
