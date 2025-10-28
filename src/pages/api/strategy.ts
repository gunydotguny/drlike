// pages/api/strategy.ts
import type { NextApiRequest, NextApiResponse } from "next";

const TOKEN = process.env.NOTION_TOKEN!;
const DATABASE_ID = process.env.NOTION_STRATEGY_DB_ID!;
const NOTION_VERSION = "2022-06-28";

// ✅ 공통 fetch
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
        property: "평균점수",
        number: { greater_than_or_equal_to: Number(minScore) },
      };
    }

    if (sort) {
      const [prop, dir] = (sort as string).split(":");
      body.sorts = [{ property: prop, direction: dir === "asc" ? "ascending" : "descending" }];
    }

    const data = await notionFetch(`https://api.notion.com/v1/databases/${DATABASE_ID}/query`, body);

    const items = (data.results ?? []).map((page: any) => ({
      id: page.id,
      url: page.url,
      properties: page.properties,
    }));

    res.status(200).json({ items, count: items.length });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
