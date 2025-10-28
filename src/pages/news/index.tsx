import { useState, useEffect } from "react";
import { Box, Typography, TextField, Button, CircularProgress } from "@mui/material";
import NewsFilter from "../../components/NewsFilter";
import NewsList from "../../components/NewList";
import Layout from "@/components/Layout";

export default function NewsPage() {
    const [news, setNews] = useState<any[]>([]);
    const [cursor, setCursor] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({ q: "", start: "", end: "" });

    const fetchNews = async (append = false) => {
        setLoading(true);
        const query = new URLSearchParams({
            ...(filters.q ? { q: filters.q } : {}),
            ...(filters.start && filters.end ? { start: filters.start, end: filters.end } : {}),
            ...(cursor ? { cursor } : {}),
        });

        const res = await fetch(`/api/news?${query.toString()}`);
        const data = await res.json();

        setNews((prev) => (append ? [...prev, ...data.items] : data.items));
        setCursor(data.nextCursor);
        setHasMore(data.hasMore);
        setLoading(false);
    };

    useEffect(() => {
        fetchNews();
    }, [filters]);

    // Infinite scroll trigger
    useEffect(() => {
        if (!hasMore || loading) return;
        const onScroll = () => {
            if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 200) {
                fetchNews(true);
            }
        };
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, [cursor, hasMore, loading]);

    return (
        <Layout>
            {/* ✅ 상단 헤더 */}
            <Box sx={{
                px: 3,
                mt: 6,
                mb: 1,
            }}>
                <Typography sx={{
                    fontSize: 28,
                    lineHeight: '36px',
                    fontWeight: 700,
                }}>
                    제리의 데일리 뉴스 크롤링
                </Typography>
            </Box>
            <Box sx={{
                p: 3,
            }}>
                {loading ?
                    <Box sx={{
                        position: 'fixed',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                    }}>
                        <CircularProgress />
                    </Box>
                    :
                    <>
                        <NewsFilter filters={filters} setFilters={setFilters} />
                        <NewsList items={news} /></>
                }
            </Box>
        </Layout>
    );
}
