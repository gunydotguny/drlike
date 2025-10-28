// components/NewsCard.tsx
import { Paper, Typography } from "@mui/material";

export default function NewsCard({ item }: any) {
    return (
        <Paper
            sx={{
                p: 2,
                borderRadius: 2,
                transition: "0.2s",
                "&:hover": { boxShadow: 4, transform: "scale(1.01)" },
            }}
        >
            <Typography variant="caption" color="text.secondary">
                {item.date}
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.5 }}>
                {item.content}
            </Typography>
        </Paper>
    );
}
