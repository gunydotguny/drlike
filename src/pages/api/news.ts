// pages/api/strategy.ts
import type { NextApiRequest, NextApiResponse } from "next";

const TOKEN = process.env.NOTION_TOKEN!;
const DATABASE_ID = process.env.NOTION_STRATEGY_DB_ID!;
const NOTION_VERSION = "2022-06-28";

// ✅ 한글 → 영문 매핑 테이블
const FIELD_MAP: Record<string, string> = {
    "공급자": "supplier",
    "수요자": "customer",
    "데이터": "data",
    "전략명": "strategyName",
    "전략 설명": "strategyDesc",
    "시장 동향": "marketTrend",
    "서비스/제품 형태": "serviceType",
    "서비스/제품 형태 설명": "serviceTypeDesc",
    "수요 크기": "demandSize",
    "수요 크기 설명": "demandSizeDesc",
    "공급 용이성": "supplyEase",
    "공급 용이성 설명": "supplyEaseDesc",
    "수익 크기": "revenueSize",
    "수익 크기 설명": "revenueSizeDesc",
    "대표 사례": "examples",
    "비고": "note",
};

async function notionFetch(url: string, body?: any) {
    const res = await fetch(url, {
        method: body ? "POST" : "GET",
        headers: {
            Authorization: `Bearer ${TOKEN}`,
            "Content-Type": "application/json",
            "Notion-Version": NOTION_VERSION,
        },
        ...(body ? { body: JSON.stringify(body) } : {}),
    });

    if (!res.ok) {
        const text = await res.text();
        console.error("❌ Notion API Error:", text);
        throw new Error(`Notion API failed: ${res.status}`);
    }
    return res.json();
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const { id, minScore, sort } = req.query;

        // ✅ 단건 조회
        if (id) {
            const data = await notionFetch(`https://api.notion.com/v1/pages/${id}`);
            return res.status(200).json({ item: data });
        }

        // ✅ 전체 조회
        const body: any = { page_size: 100 };
        if (minScore) {
            body.filter = {
                property: "수요 크기",
                number: { greater_than_or_equal_to: 0 },
            };
        }

        if (sort) {
            const [prop, dir] = (sort as string).split(":");
            body.sorts = [{ property: prop, direction: dir === "asc" ? "ascending" : "descending" }];
        }

        const data = await notionFetch(`https://api.notion.com/v1/databases/${DATABASE_ID}/query`, body);

        const items = (data.results ?? []).map((page: any) => {
            const props = page.properties;
            const parsed: Record<string, any> = {};

            for (const [kor, vRaw] of Object.entries(props)) {
                const v: any = vRaw; // ✅ 타입 단언
                const key = FIELD_MAP[kor] ?? kor;
                let value: any = "";

                switch (v.type) {
                    case "title":
                        value = v.title?.map((t: any) => t.plain_text).join("") ?? "";
                        break;
                    case "rich_text":
                        value = v.rich_text?.map((t: any) => t.plain_text).join("") ?? "";
                        break;
                    case "number":
                        value = v.number;
                        break;
                    case "select":
                        value = v.select?.name ?? "";
                        break;
                    case "multi_select":
                        value = (v.multi_select ?? []).map((s: any) => s.name);
                        break;
                    case "status":
                        value = v.status?.name ?? "";
                        break;
                    case "date":
                        value = v.date?.start ?? "";
                        break;
                    case "checkbox":
                        value = v.checkbox;
                        break;
                    case "formula":
                        value = v.formula?.number ?? v.formula?.string ?? "";
                        break;
                    case "files":
                        value = (v.files ?? []).map((f: any) =>
                            f.type === "external" ? f.external?.url : f.file?.url
                        );
                        break;
                    default:
                        value = "";
                }

                parsed[key] = value;
            }

            // ✅ 평균점수 직접 계산
            const d = Number(parsed.demandSize ?? 0);
            const s = Number(parsed.supplyEase ?? 0);
            const r = Number(parsed.revenueSize ?? 0);
            const avg = (d + s + r) / [d, s, r].filter((x) => !!x).length || null;

            parsed.avgScore = avg ? Number(avg.toFixed(2)) : null;

            return {
                id: page.id,
                url: page.url,
                ...parsed,
            };
        });

        res.status(200).json({ items, count: items.length });
    } catch (err: any) {
        console.error("❌ Server Error:", err);
        res.status(500).json({ error: err.message });
    }
}
