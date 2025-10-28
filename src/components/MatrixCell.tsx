import { alpha, Box, ButtonBase, Paper, Typography } from "@mui/material";
import { purple, blueGrey } from "@mui/material/colors";
import { useRouter } from "next/router";

export const scoreColor = (score?: number) => {
    if (score == null || Number.isNaN(score)) return '#ffffff';
    if (score >= 5.0) return '#000000';
    if (score >= 4.0) return purple[500];
    if (score >= 3.0) return purple[300];
    if (score >= 2.0) return blueGrey[50];
    if (score >= 0) return '#ffffff';
    return purple[500];
};

// ✅ 텍스트 색상 (배경 대비용)
export const textColor = (score?: number) => {
    if (score == null || Number.isNaN(score)) return blueGrey[700];
    return score >= 3.0 ? "#fff" : blueGrey[700];; // 4점 이상이면 흰색
};

export default function MatrixCell({ item }: { item: any | null }) {
    const router = useRouter()
    const { strategyName, avgScore, supplier, customer, url } = item;
    const score = Number(avgScore ?? 0);

    const handleClick = () => {
        router.push(url)
    }
    console.log(item)
    if (!item) {
        return (
            <Paper
                sx={{
                    width: "100%",
                    aspectRatio: "1 / 1",
                    bgcolor: "#f5f5f5",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#aaa",
                    borderRadius: 1.5,
                    fontSize: 13,
                }}
            >
                –
            </Paper>
        );
    }
    return (
        <ButtonBase
            onClick={handleClick}
            sx={{
                border: `1px solid ${blueGrey[50]}`,
                minWidth: 88,
                px: 1,
                pt: 0.5,
                pb: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                justifyContent: "center",
                bgcolor: scoreColor(score),
                borderRadius: 1,
                transition: "all 0.3s ease",
                boxShadow: 'none',
                // "&:hover": { boxShadow: `4px 4px 16px ${alpha(scoreColor(score), 0.8)}` },
            }}
        >
            <Typography sx={{
                fontSize: 24,
                lineHeight: '32px',
                fontWeight: 700,
                color: textColor(score)
            }}>
                {(score).toFixed(1)}
            </Typography>
            <Box sx={{
                flex: 1,
                // display: "flex",
                // alignItems: "center",
                // justifyContent: "center",
                // flexDirection: "column",
            }}>
                <Typography
                    sx={{
                        fontSize: 12,
                        lineHeight: '16px',
                        fontWeight: 700,
                        color: textColor(score),
                        // textAlign: 'center',
                        lineBreak: 'break-all',
                    }}
                >
                    {strategyName}
                </Typography>
            </Box>
        </ButtonBase>
    );
}
