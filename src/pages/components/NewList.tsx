// components/NewsList.tsx
import { Box } from "@mui/material";
import NewsCard from "./NewsCard";

export default function NewsList({ items }: any) {
    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {items.map((item: any) => (
                <NewsCard key={item.id} item={item} />
            ))}
        </Box>
    );
}
