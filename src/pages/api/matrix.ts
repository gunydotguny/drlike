// pages/api/strategy.ts
import type { NextApiRequest, NextApiResponse } from "next";

const TOKEN = process.env.NOTION_TOKEN!;
const DATABASE_ID = process.env.NOTION_STRATEGY_DB_ID!;
const NOTION_VERSION = "2022-06-28";

// ✅ 모든 컬럼 매핑
const FIELD_MAP: Record<string, string> = {
  "공급자": "supplier",
  "수요자": "customer",
  "데이터": "dataType",
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
  "평균점수": "avgScore",
};

async function queryNotionDatabase() {
  const res = await fetch(`https://api.notion.com/v1/databases/${DATABASE_ID}/query`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
      "Notion-Version": NOTION_VERSION,
    },
    body: JSON.stringify({
      page_size: 100,
    }),
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
    const data = await queryNotionDatabase();

    const items = (data.results ?? []).map((page: any) => {
      const props = page.properties ?? {};
      const parsed: Record<string, any> = {};

      for (const [kor, vRaw] of Object.entries(props)) {
        const v: any = vRaw;
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
          default:
            value = "";
        }

        parsed[key] = value;
      }

      // ✅ 평균점수 직접 계산
      const d = Number(parsed.demandSize ?? 0);
      const s = Number(parsed.supplyEase ?? 0);
      const r = Number(parsed.revenueSize ?? 0);
      const avg =
        [d, s, r].filter((x) => !isNaN(x) && x > 0).length > 0
          ? (d + s + r) / [d, s, r].filter((x) => !isNaN(x) && x > 0).length
          : null;

      return {
        id: page.id,
        url: page.url,
        ...parsed,
        avgScore: avg ? Number(avg.toFixed(2)) : parsed.avgScore ?? null, // 수식없을 경우 직접 계산
      };
    });

    res.status(200).json({ items });
  } catch (err: any) {
    console.error("❌ Error:", err);
    res.status(500).json({ error: err.message });
  }
}
