import OpenAI from "openai";
import { getEmbedding } from "./getEmbeddings";
import { userEmbeddingPrompt } from "../pages/api/prompt/user_embedding_prompt";

const openai = new OpenAI({
    apiKey: process.env.UPSTAGE_API_KEY!,
    baseURL: "https://api.upstage.ai/v1"
});

export async function getUserEmbedding(userInput: any, presetPriority: any) {
    // 1. LLM 요약 생성
    const prompt = userEmbeddingPrompt
        .replace("{USER INPUT JSON}", JSON.stringify(userInput, null, 2))
        .replace("{PRESET PRIORITY JSON}", JSON.stringify(presetPriority, null, 2));
    const completion = await openai.chat.completions.create({
        model: "solar-pro",
        messages: [{ role: "user", content: prompt }]
    });
    const summary = completion.choices?.[0]?.message?.content?.trim();
    if (!summary) throw new Error("LLM summary not generated");

    // 2. 임베딩 생성
    const embedding = await getEmbedding(summary);
    return { summary, embedding };
}
