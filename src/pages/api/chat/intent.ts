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
        const { userInput } = req.body;

        const prompt = `
사용자의 입력에서 아래 정보를 추출해 JSON으로 응답해줘:

1. 진료 상태 (visitStatus):
- "FIRST_VISIT" (첫 진료: 외래 진료 등 환아가 병원에 처음 방문한 경우)
- "HOSPITALIZED" (입원 중: 환아가 현재 병원에 입원 치료 중인 경우)
- "UNKNOWN" (판단 불가)

이 값은 의료진이 증례 추천을 위해 반드시 선택해야 하는 환아의 현재 진료 환경(상태)을 뜻해.

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

추가 지시:
모든 필수 정보(진료 상태와 연령)가 충분히 확보된 경우에도,  
마지막으로 반드시 아래 항목에 대해 추가 질문 문구를 생성해줘:
- 환아의 진단명
- 주요 증상
- 검사 결과

질문 문구는 부드럽고 친절하게 작성하고, 가능한 다양한 표현을 사용해 자연스럽게 느껴지도록 해줘.  
이 질문은 반드시 모든 필수 정보가 확보된 경우에만 포함해야 하며,  
사용자가 답변하지 않으면 "없음"으로 넘어갈 수 있도록 안내해줘.

응답은 반드시 아래 JSON 형식으로 정확하게 제공해야 하며, 절대로 다른 설명을 추가하면 안 돼:
{
  "visitStatus": "",
  "ageValue": 숫자 or null,
  "ageUnit": "month" or "year" or null,
  "nextQuestion": 질문 문구 or null,
  "additionalQuestion": 추가 질문 문구 or null
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
