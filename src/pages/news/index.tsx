import { useState, useEffect } from "react";
import { Box, Typography, TextField, Button, CircularProgress } from "@mui/material";
import NewsFilter from "../components/NewsFilter";
import NewsList from "../components/NewList";

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
        <Box sx={{ p: 3 }}>
            <Typography variant="h5" fontWeight="bold" mb={2}>
                📰 헬스케어 뉴스 데이터
            </Typography>
            <NewsFilter filters={filters} setFilters={setFilters} />
            <NewsList items={news} />
            {loading && (
                <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
                    <CircularProgress />
                </Box>
            )}
        </Box>
    );
}
