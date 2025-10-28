// pages/api/news.ts
import type { NextApiRequest, NextApiResponse } from "next";

const TOKEN = process.env.NOTION_TOKEN!;
const DATABASE_ID = process.env.NOTION_NEWS_DB_ID!;
const VERSION = "2022-06-28";

async function queryNotionNewsDatabase({ filter, sorts, startCursor }: any = {}) {
    const response = await fetch(`https://api.notion.com/v1/databases/${DATABASE_ID}/query`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${TOKEN}`,
            "Content-Type": "application/json",
            "Notion-Version": VERSION,
        },
        body: JSON.stringify({
            page_size: 20,
            start_cursor: startCursor,
            ...(filter ? { filter } : {}),
            ...(sorts ? { sorts } : {}),
        }),
    });
    return response.json();
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const { q, start, end, cursor } = req.query;

        const filter: any = {
            and: [],
        };

        if (start && end) {
            filter.and.push({
                property: "date",
                date: { on_or_after: start as string, on_or_before: end as string },
            });
        }

        if (q) {
            filter.and.push({
                property: "content",
                rich_text: { contains: q as string },
            });
        }

        const sorts = [{ property: "date", direction: "descending" }];
        const data = await queryNotionNewsDatabase({ filter, sorts, startCursor: cursor });

        const items = data.results.map((page: any) => ({
            id: page.id,
            date: page.properties["date"]?.date?.start || null,
            number: page.properties["number"]?.number || null,
            content: page.properties["content"]?.rich_text?.[0]?.plain_text || "",
        }));

        res.status(200).json({
            items,
            nextCursor: data.next_cursor || null,
            hasMore: data.has_more,
        });
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
}
