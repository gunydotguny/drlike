import type { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";
import { getEmbedding } from "../../lib/getEmbeddings";
import { getCollection } from "../../utils/chromaClient";
import { generatePrompt } from "../../prompt";

const openai = new OpenAI({
  apiKey: process.env.UPSTAGE_API_KEY!,
  baseURL: "https://api.upstage.ai/v1",
});

/**
 * Remove markdown fences from a string
 */
function stripMarkdownFence(text: string): string {
  return text
    .replace(/^```json\s*/i, "")
    .replace(/^```/, "")
    .replace(/```$/, "")
    .trim();
}

/**
 * Try parsing JSON, return both parsed and error
 */
function tryParseJson(raw: string): { parsed: any | null; error: string | null } {
  try {
    const clean = stripMarkdownFence(raw);
    const parsed = JSON.parse(clean);

    if (!Array.isArray(parsed)) {
      console.error("❌ 구조 오류: JSON이 배열이 아님:", parsed);
      return { parsed: null, error: "invalid_output_structure" };
    }

    return { parsed, error: null };
  } catch (err) {
    console.error("❌ JSON 파싱 실패:", err);
    return { parsed: null, error: "invalid_json" };
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { formData, presetValue } = req.body;
    if (!formData || !presetValue) {
      return res.status(400).json({ error: "Missing formData or presetValue" });
    }

    // 1. 벡터 임베딩
    const embedding = await getEmbedding(formData);

    // 2. 유사 증례 검색
    const collection = await getCollection("clinical-cases-1024-v3");
    const result = await collection.query({
      queryEmbeddings: [embedding],
      nResults: 10,
    });

    const retrievedCases = result.metadatas?.[0] || [];
    const distances = result.distances?.[0] || [];
    const filteredCases = retrievedCases; // 필터 임시 제외
    // const filteredCases = retrievedCases.filter((_, i) => distances[i] < 0.65);

    const prompt = generatePrompt(formData, filteredCases, presetValue);
    const debug = {
      totalCount: await collection.count(),
      retrieved: retrievedCases.length,
      filtered: filteredCases.length,
      promptLength: prompt.length,
      promptPreview: prompt.slice(0, 500),
    };

    console.log("💾 벡터 DB 총 건수:", debug.totalCount);
    console.log("🔍 검색된 건수:", debug.retrieved);
    console.log("✅ 필터 통과 건수 (<0.65):", debug.filtered);

    if (filteredCases.length === 0) {
      return res.status(200).json({
        recommendationList: [],
        reason: "no_similar_cases",
        debug,
      });
    }

    console.log("🧠 Prompt 길이:", debug.promptLength);
    console.log("🧠 Prompt 미리보기:\n", debug.promptPreview);

    // 4. LLM 호출
    const completion = await openai.chat.completions.create({
      model: "solar-pro",
      messages: [{ role: "user", content: prompt }],
    });

    const raw = completion.choices?.[0]?.message?.content?.trim();
    console.log("🤖 LLM 응답 원본:\n", raw);

    if (!raw) {
      return res.status(200).json({ recommendationList: [], reason: "empty_llm_response", debug });
    }

    // 5. JSON 파싱
    let parsed: any = null;
    let error: string | null = null;

    try {
      const clean = stripMarkdownFence(raw);
      parsed = JSON.parse(clean);
    } catch (err) {
      return res.status(200).json({ recommendationList: [], reason: "invalid_json", raw, debug });
    }

    let recommendationList: any[] = [];
    if (Array.isArray(parsed)) {
      recommendationList = parsed;
    } else if (parsed.cases && Array.isArray(parsed.cases)) {
      recommendationList = parsed.cases;
    } else {
      return res.status(200).json({
        recommendationList: [],
        reason: "invalid_output_structure",
        raw,
        debug,
      });
    }

    return res.status(200).json({
      recommendationList,
      raw,
      debug,
    });
  } catch (e) {
    console.error("🔥 API 전체 오류:", e);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
