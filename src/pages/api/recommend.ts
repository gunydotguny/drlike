import type { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";
import { getEmbedding } from "../../lib/getEmbeddings";
import { generatePrompt } from "../../prompt";
import { llmRestructurePrompt } from "../test/prompt/llm_restructure_prompt";
import { getUserEmbedding } from "../test/lib/getUserEmbedding";

const openai = new OpenAI({
  apiKey: process.env.UPSTAGE_API_KEY!,
  baseURL: "https://api.upstage.ai/v1",
});

const CHROMA_HOST = process.env.CHROMA_HOST!;

function stripMarkdownFence(text: string) {
  return text
    .replace(/^```json\s*/i, "")
    .replace(/^```/, "")
    .replace(/```$/, "")
    .trim();
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { formData, presetValue, presetPriority, promptType } = req.body;

    // ✅ promptType에 따라 embeddingMode와 collectionName 자동 설정
    let embeddingMode = "preset";
    let collectionName = "drlike-case-collection";

    if (promptType === "prompt2") {
      embeddingMode = "user";
      collectionName = "pediatric_cases_structured_test";
    } else if (promptType === "prompt3") {
      embeddingMode = "user";
      collectionName = "pediatric_cases_structured_test";
    }

    // ✅ 임베딩 생성
    let embedding: number[] | null = null;
    if (embeddingMode === "user") {
      const result = await getUserEmbedding(formData, presetPriority);
      if (!result) {
        return res.status(400).json({ error: "User embedding failed" });
      }
      embedding = result.embedding;
      console.log("✅ 사용자 입력 기반 임베딩 생성 완료");
    } else {
      embedding = await getEmbedding(formData);
      console.log("✅ 기존 임베딩 생성 완료");
    }

    if (!embedding || embedding.length !== 1024) {
      return res.status(400).json({ error: "Invalid embedding result" });
    }

    // ✅ 벡터 검색
    console.log("✅ Step 1: 벡터 검색 요청 시작");
    const listRes = await fetch(`${CHROMA_HOST}/api/v1/collections`);
    const data = await listRes.json();
    const collections = Array.isArray(data) ? data : data.collections || [];
    const collection = collections.find((c: any) => c.name === collectionName);
    if (!collection) {
      console.error("❌ 컬렉션 없음:", collectionName);
      return res.status(500).json({ error: "Collection not found" });
    }

    const collectionId = collection.id;
    const queryRes = await fetch(`${CHROMA_HOST}/api/v1/collections/${collectionId}/query`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query_embeddings: [embedding],
        n_results: 10,
        include: ["metadatas", "distances"],
      }),
    });

    console.log("✅ Step 2: 벡터 검색 응답 상태:", queryRes.status);
    if (!queryRes.ok) {
      const errorText = await queryRes.text();
      console.error("❌ 벡터 검색 실패 응답:", errorText);
      throw new Error(`Vector query failed with status ${queryRes.status}`);
    }

    const queryData = await queryRes.json();
    const retrievedCases = queryData.metadatas?.[0] || [];
    console.log("✅ Step 3: 벡터 검색 결과 건수:", retrievedCases.length);

    // ✅ 프롬프트 생성
    const prompt = generatePrompt(formData, retrievedCases, presetValue);
    console.log("🧠 Step 4: 프롬프트 길이:", prompt.length);

    // ✅ LLM 호출
    const completion = await openai.chat.completions.create({
      model: "solar-pro",
      messages: [{ role: "user", content: prompt }],
    });

    const raw = completion.choices?.[0]?.message?.content?.trim();
    if (!raw) {
      return res.status(200).json({ recommendationList: [], reason: "empty_llm_response" });
    }

    let parsed: any;
    try {
      parsed = JSON.parse(stripMarkdownFence(raw));
    } catch (e) {
      console.error("❌ JSON 파싱 실패:", e);
      return res.status(200).json({ recommendationList: [], reason: "invalid_json", raw });
    }

    const recommendationList = Array.isArray(parsed)
      ? parsed
      : parsed.cases && Array.isArray(parsed.cases)
        ? parsed.cases
        : [];

    console.log("✅ Step 5: 추천 완료, 추천 건수:", recommendationList.length);

    // ✅ 정형화 프롬프트
    const restructurePrompt = await llmRestructurePrompt(recommendationList);
    const restructureCompletion = await openai.chat.completions.create({
      model: "solar-pro",
      messages: [{ role: "user", content: restructurePrompt }],
    });

    const restructured = restructureCompletion.choices?.[0]?.message?.content?.trim();
    console.log("✅ Step 6: 정형화된 추천 결과 생성 완료");

    return res.status(200).json({
      recommendationList,
      restructured,
      debug: {
        promptLength: prompt.length,
        retrieved: retrievedCases.length,
      },
    });
  } catch (e: any) {
    console.error("🔥 API 전체 오류:", e.message || e);
    return res.status(500).json({ error: "Internal Server Error", detail: e.message });
  }
}
