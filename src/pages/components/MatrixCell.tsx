import { alpha, Box, ButtonBase, Paper, Typography } from "@mui/material";
import { purple, blueGrey } from "@mui/material/colors";

export const scoreColor = (score?: number) => {
    if (score == null || Number.isNaN(score)) return '#ffffff';
    if (score >= 5.0) return '#000000';
    if (score >= 4.5) return purple[500];
    if (score >= 4.0) return purple[400];
    if (score >= 3.5) return purple[300];
    if (score >= 3.0) return purple[200];
    if (score >= 2.5) return blueGrey[100];
    if (score >= 2.0) return blueGrey[50];
    if (score >= 0) return '#ffffff';
    return purple[500];
};

// ✅ 텍스트 색상 (배경 대비용)
export const textColor = (score?: number) => {
    if (score == null || Number.isNaN(score)) return blueGrey[700];
    return score >= 3.0 ? "#fff" : blueGrey[700];; // 4점 이상이면 흰색
};

export function MatrixCell({ item }: { item: any | null }) {
    if (!item) {
        return (
            <Paper
                sx={{
                    width: "100%",
                    bgcolor: "#f5f5f5",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#aaa",
                    borderRadius: 2,
                }}
            >
                –
            </Paper>
        );
    }

    const avg = item.avgScore || 0;

    return (
        <ButtonBase
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
                bgcolor: scoreColor(avg),
                borderRadius: 1,
                transition: "all 0.3s ease",
                boxShadow: 'none',
                // "&:hover": { boxShadow: `4px 4px 16px ${alpha(scoreColor(avg), 0.8)}` },
            }}
        >
            <Typography sx={{
                fontSize: 28,
                lineHeight: '36px',
                fontWeight: 700,
                color: textColor(avg)
            }}>
                {(avg * 10 * 2).toFixed(0)}
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
                        // fontWeight: 700,
                        color: textColor(avg),
                        // textAlign: 'center',
                        lineBreak: 'break-all',
                    }}
                >
                    {item.title || item.strategyName}
                </Typography>
            </Box>
        </ButtonBase>
    );
}
