import type { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";
import { getEmbedding } from "../../lib/getEmbeddings";
import { generatePrompt } from "../../prompt";

const openai = new OpenAI({
  apiKey: process.env.UPSTAGE_API_KEY!,
  baseURL: "https://api.upstage.ai/v1",
});

const CHROMA_HOST = process.env.CHROMA_HOST!;
const COLLECTION_NAME = "drlike-case-collection";

function stripMarkdownFence(text: string): string {
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
    const { formData, presetValue } = req.body;
    if (!formData || !presetValue) {
      return res.status(400).json({ error: "Missing formData or presetValue" });
    }

    const embedding = await getEmbedding(formData);
    if (!embedding || embedding.length !== 1024) {
      return res.status(400).json({ error: "Invalid embedding result" });
    }

    // 1. 컬렉션 목록 조회
    const listRes = await fetch(`${CHROMA_HOST}/api/v1/collections`);
    const data = await listRes.json();

    // 2. 응답 구조 보정
    const collections = Array.isArray(data)
      ? data
      : Array.isArray(data.collections)
        ? data.collections
        : [];

    console.log("📦 실제 collections 목록:", collections.map((c: any) => c.name));

    const collection = collections.find((c: any) => c.name === COLLECTION_NAME);
    if (!collection) {
      console.error("❌ 컬렉션을 찾을 수 없습니다:", COLLECTION_NAME);
      return res.status(500).json({ error: "Collection not found" });
    }

    const collectionId = collection.id;

    // 3. 문서 수 확인
    const countRes = await fetch(`${CHROMA_HOST}/api/v1/collections/${collectionId}/count`);
    const totalCount = await countRes.text();

    // 4. 유사 문서 검색
    const queryRes = await fetch(`${CHROMA_HOST}/api/v1/collections/${collectionId}/query`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query_embeddings: [embedding],
        n_results: 10,
        include: ["metadatas", "distances"],
      }),
    });

    if (!queryRes.ok) throw new Error(`Query failed: ${queryRes.status}`);
    const queryData = await queryRes.json();

    const retrievedCases = queryData.metadatas?.[0] || [];
    const distances = queryData.distances?.[0] || [];

    const filteredCases = retrievedCases; // TODO: 거리 필터링하려면 여기 조정

    const prompt = generatePrompt(formData, filteredCases, presetValue);

    const debug = {
      totalCount: parseInt(totalCount, 10),
      retrieved: retrievedCases.length,
      filtered: filteredCases.length,
      promptLength: prompt.length,
      promptPreview: prompt.slice(0, 500),
    };

    if (filteredCases.length === 0) {
      return res.status(200).json({
        recommendationList: [],
        reason: "no_similar_cases",
        debug,
      });
    }

    // 5. LLM 호출
    const completion = await openai.chat.completions.create({
      model: "solar-pro",
      messages: [{ role: "user", content: prompt }],
    });

    const raw = completion.choices?.[0]?.message?.content?.trim();
    if (!raw) {
      return res.status(200).json({ recommendationList: [], reason: "empty_llm_response", debug });
    }

    // 6. JSON 파싱
    let parsed: any;
    try {
      const clean = stripMarkdownFence(raw);
      parsed = JSON.parse(clean);
    } catch {
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

    return res.status(200).json({ recommendationList, raw, debug });
  } catch (e: any) {
    console.error("🔥 API 전체 오류:", e.message || e);
    return res.status(500).json({
      error: "Internal Server Error",
      detail: e.message,
    });
  }
}