import { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import { getSampleEmbedding } from "../../../lib/getSampleEmbedding";
import path from "path";
import fs from "fs/promises";

const CHROMA_HOST = process.env.CHROMA_HOST!;
const COLLECTION_NAME = "pediatric_cases_structured_test";  // 새 테스트 컬렉션 이름
const CASES_JSON_URL = path.join(process.cwd(), "public", "data", "sample_cases.json");

function flattenObject(obj: any, prefix = '') {
    return Object.keys(obj).reduce((acc, key) => {
        const pre = prefix.length ? `${prefix}_${key}` : key;
        if (typeof obj[key] === 'object' && obj[key] !== null) {
            Object.assign(acc, flattenObject(obj[key], pre));
        } else {
            acc[pre] = obj[key];
        }
        return acc;
    }, {} as Record<string, any>);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method Not Allowed" });
    }

    try {
        // 1. 증례 데이터 fetch
        const raw = await fs.readFile(CASES_JSON_URL, "utf-8");
        const cases: any[] = JSON.parse(raw);
        console.log("▶️ 증례 데이터:", cases.length);

        // 2. 컬렉션 생성 또는 확인
        const colList = await axios.get(`${CHROMA_HOST}/api/v1/collections`);
        let col = colList.data.find((c: any) => c.name === COLLECTION_NAME);
        if (!col) {
            const colRes = await axios.post(
                `${CHROMA_HOST}/api/v1/collections`,
                { name: COLLECTION_NAME },
                { headers: { "Content-Type": "application/json" } }
            );
            col = colRes.data;
        }

        const colId = col.id;
        let count = 0;
        let shownLogs = 0;  // ✅ 로그 출력 카운터

        // 3. 증례 데이터 loop (자동 ID 생성)
        for (let idx = 0; idx < cases.length; idx++) {
            const caseData = cases[idx];
            const caseId = `case_${idx + 1}`;  // ✅ 자동 ID 생성

            console.log(
                `[${idx + 1}/${cases.length}] ▶️ ID: ${caseId}`
            );

            const result = await getSampleEmbedding(caseData);
            if (!result) {
                console.log(`    └ ⚠️ 요약 또는 임베딩 실패 → 스킵`);
                continue;
            }

            const { summary, embedding } = result;

            console.log(`    └ ✅ 임베딩 벡터 길이: ${embedding.length}`);

            const isZeroVector = embedding.every((v) => v === 0);
            if (isZeroVector) {
                console.warn("⚠️ 경고: 벡터가 전부 0으로만 채워져 있음! 확인 필요!");
            }

            if (shownLogs < 5) {
                console.log(`📝 요약문 ${shownLogs + 1}:`, summary);
                shownLogs++;
            }

            const flattenedMetadata = flattenObject(caseData);

            // ✅ ChromaDB 저장 (Flatten된 JSON 메타데이터 포함)
            await axios.post(
                `${CHROMA_HOST}/api/v1/collections/${colId}/add`,
                {
                    ids: [caseId],
                    documents: [summary],
                    embeddings: [embedding],
                    metadatas: [flattenedMetadata],
                },
                { headers: { "Content-Type": "application/json" } }
            );
            console.log(`    └ ✅ 요약문 생성 성공 (길이: ${summary.length}자)`);
            console.log(`    └ ✅ ChromaDB 저장 완료`);
            count++;
        }

        return res.status(200).json({ message: "✅ Preload complete", count });
    } catch (e: any) {
        console.error("🔥 Preload error:", e.message || e);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}
