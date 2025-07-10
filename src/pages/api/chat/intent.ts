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
- "FIRST_VISIT" (첫 방문: 외래 진료 등 병원 첫 내원 시)
- "HOSPITALIZED" (입원 중: 현재 병원에 입원 치료 중인 경우)
- "UNKNOWN" (판단 불가)

❗️주의:
반드시 아래 규칙에 따라 사용자의 답변을 정확하게 변환하세요:
- "FIRST_VISIT": 첫 방문, 처음 방문, 외래 진료, 외래 내원, 병원 처음 방문 등과 관련된 표현
- "HOSPITALIZED": 입원 중, 입원 치료 중, 병원에 입원해 있는 경우 등과 관련된 표현
- 이 외의 모든 경우는 반드시 "UNKNOWN"으로 처리 (절대 추측 금지)

2. 연령 값 (ageValue):
- 숫자로만 응답 (없으면 null)

3. 연령 단위 (ageUnit):
- "month" (개월)
- "year" (세)
- 없으면 null

4. 추가 질문 문구 (nextQuestion):
- 진료 상태나 연령이 누락된 경우 반드시 질문을 생성해야 합니다.
- 절대 추정하거나 넘어가지 말고 반드시 명확하게 물어야 합니다.
- 질문 문구는 부드럽고 친절하되, 불필요한 인사말이나 감사 표현은 포함하지 마세요.
- 질문은 가능한 다양한 표현을 사용해 반복 사용 시에도 자연스럽게 느껴지도록 해주세요.
- 모든 정보가 충분하면 null을 반환해도 됩니다.

추가 지시:
모든 필수 정보(진료 상태와 연령)가 충분히 확보된 경우에는 아래 항목에 대한 추가 질문을 반드시 생성하세요:
- 환아의 진단명
- 주요 증상
- 검사 결과

이 추가 질문은 부드럽고 친절하게 작성하되, 인사말은 생략하고 명확하게 물어주세요.  
답변이 없으면 '없음'으로 넘어갈 수 있음을 반드시 안내해야 합니다.

❗️질문 문구 생성 시 추가 지시:
- 첫 질문에서는 가벼운 인사말을 포함할 수 있습니다.
- 단, 이후 추가 질문에서는 절대 인사말이나 감사 표현을 포함하지 말고 필요한 질문만 명확하게 묻도록 하세요.
- 진료 상태 선택지를 사용자에게 절대 영어 코드로 노출하지 마세요. 반드시 자연스러운 한국어 표현으로만 사용하세요:
  - 첫 방문 (외래 진료)
  - 입원 중
- 질문 문구는 항상 동일한 표현만 사용하지 말고, 아래 표현을 참고해 자연스럽게 다양화하세요:

[표현 변주 예시]
- 첫 방문 (외래 진료): 외래 내원, 처음 방문, 첫 방문, 병원 방문, 병원 처음 찾은 경우 등
- 입원 중: 병원에 입원해 있는 경우, 입원 치료 중, 현재 입원 중, 병원에 머무르는 중 등

❗️추가 지시 (중요):
- "첫 방문", "처음 방문", "외래"와 같은 표현은 반드시 "FIRST_VISIT"로 변환하세요. 절대로 "HOSPITALIZED"로 변환하지 마세요.
- "입원", "입원 중", "병원에 입원"과 관련된 표현만 "HOSPITALIZED"로 변환하세요. 절대 추측 금지.
- 사용자가 '없어', '모르겠어', '모름', '없음' 등으로 답변한 경우 반드시 '없음'으로 기록하고, 동일 질문은 반복하지 말고 종료하세요.
- 반대로 답변이 없거나 질문이 누락된 경우에는 반드시 질문을 반복하세요.

응답은 반드시 아래 JSON 형식으로 정확하게 제공하고, 절대 다른 설명을 추가하지 마세요:
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
        console.log("LLM 응답 (원본):", data);
        return res.status(200).json(parsed);

    } catch (error) {
        console.error("LLM 호출 실패:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}
