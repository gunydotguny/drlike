import type { NextApiRequest, NextApiResponse } from "next";

const TOKEN = process.env.NOTION_TOKEN!;
const DATABASE_ID = process.env.NOTION_NEWS_DB_ID!;
const VERSION = "2022-06-28";

// ✅ Notion DB 쿼리 함수
async function queryNotionDatabase({ filter, sorts, startCursor }: any = {}) {
  const body: any = {
    page_size: 50,
    sorts,
  };
  if (filter) body.filter = filter;
  if (startCursor) body.start_cursor = startCursor;

  const response = await fetch(`https://api.notion.com/v1/databases/${DATABASE_ID}/query`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
      "Notion-Version": VERSION,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Notion API Error: ${response.status} ${text}`);
  }

  return response.json();
}

// ✅ '25.10.27' → '2025-10-27' 변환 함수
function parseKoreanDate(str: string): string | null {
  if (!str) return null;
  const parts = str.split(".").map((s) => s.trim());
  if (parts.length < 3) return null;
  const [yy, mm, dd] = parts;
  return `20${yy.padStart(2, "0")}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { q, cursor } = req.query;

    // ✅ 필터 생성
    const filterConditions: any[] = [];
    if (q) {
      filterConditions.push({
        property: "이름",
        title: { contains: q as string },
      });
    }

    const filter = filterConditions.length ? { and: filterConditions } : undefined;
    const sorts = [{ property: "date", direction: "descending" }];

    // ✅ Notion 쿼리 실행
    const data = await queryNotionDatabase({
      filter,
      sorts,
      startCursor: cursor,
    });

    // ✅ 결과 파싱
    const items = data.results.map((page: any) => {
      const dateText =
        page.properties["date"]?.rich_text?.[0]?.plain_text?.trim() || null;

      return {
        id: page.id,
        date: parseKoreanDate(dateText),
        number: page.properties["number"]?.number || null,
        content:
          page.properties["이름"]?.title
            ?.map((t: any) => t.plain_text)
            .join("")
            .trim() || "",
      };
    });

    // ✅ 응답 반환
    res.status(200).json({
      items,
      nextCursor: data.next_cursor || null,
      hasMore: data.has_more,
    });
  } catch (err: any) {
    console.error("❌ Notion query error:", err);
    res.status(500).json({ error: err.message });
  }
}
