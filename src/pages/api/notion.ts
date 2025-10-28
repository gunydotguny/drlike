// pages/api/notion.ts
import type { NextApiRequest, NextApiResponse } from "next";

// 🔐 환경변수 로드
const TOKEN = process.env.NOTION_TOKEN!;
const DATABASE_ID = process.env.NOTION_DATABASE_ID!;

// ✅ 공통 fetch 함수 (SDK 대신 직접 REST API 호출)
async function queryNotionDatabase({ filter, sorts }: any = {}) {
    const response = await fetch(`https://api.notion.com/v1/databases/${DATABASE_ID}/query`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${TOKEN}`,
            "Content-Type": "application/json",
            "Notion-Version": "2022-06-28",
        },
        body: JSON.stringify({
            page_size: 100,
            ...(filter ? { filter } : {}),
            ...(sorts ? { sorts } : {}),
        }),
    });

    if (!response.ok) {
        const text = await response.text();
        console.error("❌ Notion API Error:", text);
        throw new Error(`Notion API failed: ${response.status}`);
    }

    return response.json();
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        // 쿼리 파라미터 처리
        const minScore = Number(req.query.minScore ?? 0);
        const sortParam = (req.query.sort as string) || "평균점수:desc";
        const [propName, directionRaw] = sortParam.split(":");
        const direction = directionRaw === "asc" ? "ascending" : "descending";

        const filter = {
            property: "평균점수",
            number: { greater_than_or_equal_to: minScore },
        };

        const sorts = [{ property: propName, direction }];

        const data = await queryNotionDatabase({ filter, sorts });

        // 간단 정제
        const items = (data.results ?? []).map((page: any) => ({
            id: page.id,
            title: page.properties?.["전략명"]?.title?.[0]?.plain_text ?? "",
            supplier: page.properties?.["공급자"]?.select?.name ?? "",
            customer: page.properties?.["수요자"]?.select?.name ?? "",
            avgScore: page.properties?.["평균점수"]?.number ?? null,
            url: page.url,
        }));

        res.status(200).json({ items, count: items.length });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
}
