import { NextApiRequest, NextApiResponse } from "next";
import { getUserEmbedding } from "../../../lib/getUserEmbedding";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method Not Allowed" });
    }

    try {
        // ✅ 1. 프론트에서 inputSamples, selectedPresetKey, presetSamples를 POST로 넘겨줌.
        const { inputSamples, selectedPresetKey, presetSamples, promptType } = req.body;
        const selectedPreset = presetSamples[selectedPresetKey];

        // ✅ 2. 샘플 개수 결정 (프롬프트 타입에 따라 다르게 돌림)
        const samplesToTest = promptType === "prompt3" ? [inputSamples[0]] : inputSamples;

        for (let idx = 0; idx < samplesToTest.length; idx++) {
            const inputSample = samplesToTest[idx];
            console.log(`\n[${idx + 1}/${samplesToTest.length}] ▶️ 사용자 입력 테스트 시작`);

            const result = await getUserEmbedding(inputSample, selectedPreset);
            if (!result) {
                console.log(`    └ ⚠️ 요약 또는 임베딩 실패 → 스킵`);
                continue;
            }

            const { summary, embedding } = result;
            console.log(`    └ ✅ 요약문 (앞 300자): ${summary.slice(0, 300)}`);
            console.log(`    └ ✅ 임베딩 벡터 길이: ${embedding.length}`);

            // ✅ 2번 프롬프트 테스트 시 (prompt2)
            if (promptType === "prompt2") {
                // → 벡터 검색 + 추천 LLM 호출 추가 (너가 기존에 만든 코드 그대로 삽입하면 됨)
            }

            // ✅ 3번 프롬프트 테스트는 이미 샘플 1개만 돌리고 있으니 여기선 추가 안 해도 됨
        }

        return res.status(200).json({ message: "✅ 사용자 입력 임베딩 테스트 완료", count: samplesToTest.length });

    } catch (e: any) {
        console.error("🔥 에러 발생:", e.message);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}
