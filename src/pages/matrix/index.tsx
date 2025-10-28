import { useEffect, useState } from "react";
import { Box, Typography, Paper, CircularProgress } from "@mui/material";
import { blue, blueGrey } from "@mui/material/colors";
import MatrixCell from "../../components/MatrixCell";
import Layout from "../../components/Layout";


const FIXED_ORDER = [
    "소비자(일반)",
    "소비자(환자)",
    "의료기관",
    "연구기관/공공",
    "제약/바이오",
    "디바이스/IoT",
    "AI/데이터기업",
    "보험/핀테크",
    "플랫폼/서비스",
];

const normalize = (s = "") => s.replace(/\s+/g, "").trim();

const HEADER_WIDTH = 120;
const HEADER_HEIGHT = 64;

export default function MatrixPage() {
    const [rows, setRows] = useState<
        { supplier: string; cells: { customer: string; item: any | null }[] }[]
    >([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch("/api/strategy?minScore=0&sort=평균점수:desc");
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const data = await res.json();

                const suppliers = FIXED_ORDER;
                const customers = FIXED_ORDER;

                // ✅ 매트릭스 초기화
                const matrix: Record<string, Record<string, any | null>> = {};
                suppliers.forEach((s) => {
                    matrix[s] = {};
                    customers.forEach((c) => (matrix[s][c] = null));
                });

                // ✅ 단일 전략 매핑
                (data.items || []).forEach((item: any) => {
                    const sKey = suppliers.find((x) => normalize(x) === normalize(item.supplier));
                    const cKey = customers.find((x) => normalize(x) === normalize(item.customer));
                    if (sKey && cKey) matrix[sKey][cKey] = item;
                });

                // ✅ 행 단위 변환
                const preparedRows = suppliers.map((supplier) => ({
                    supplier,
                    cells: customers.map((customer) => ({
                        customer,
                        item: matrix[supplier][customer],
                    })),
                }));

                setRows(preparedRows);
                console.table(
                    data.items.map((i: any) => ({
                        전략명: i.title,
                        공급자: i.supplier,
                        수요자: i.customer,
                        평균점수: i.avgScore,
                    }))
                );
            } catch (err: any) {
                console.error("❌ Fetch error:", err);
                setError(err.message || "데이터를 불러오지 못했습니다.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);
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
                    헬스케어 데이터 수요-공급 매트릭스
                </Typography>
            </Box>
            {/* ✅ Matrix */}
            <Box sx={{
                p: 3,
            }}>
                <Box sx={{
                    borderRadius: 1,
                    backgroundColor: '#ffffff',
                    pl: 3,
                    pt: 3,
                    pr: 3,
                    pb: 3,
                    height: '814px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}>
                    {loading ?
                        <CircularProgress />
                        :
                        error ?
                            <Typography color="error">{error}</Typography>
                            : <Box sx={{
                                ml: -2,
                                mt: -2,
                            }}>
                                <Box
                                    sx={{
                                        display: "grid",
                                        gridTemplateColumns: `${HEADER_WIDTH}px repeat(${FIXED_ORDER.length}, 1fr)`,
                                        gridAutoRows: "1fr",
                                        gap: 0.5,
                                        height: HEADER_HEIGHT,
                                    }}
                                >
                                    <CustomCell>
                                        공급 ↓<br />수요 →
                                    </CustomCell>
                                    {FIXED_ORDER.map((item, index) => (
                                        <CustomCell
                                            key={index}
                                        >
                                            {item}
                                        </CustomCell>
                                    ))}
                                </Box>
                                <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                                    {rows.map((row) => (
                                        <Box
                                            key={row.supplier}
                                            sx={{
                                                display: "grid",
                                                gridTemplateColumns: `${HEADER_WIDTH}px repeat(${FIXED_ORDER.length}, 1fr)`,
                                                gap: 0.5,
                                            }}
                                        >
                                            {/* 행 헤더 */}
                                            <CustomCell>
                                                {row.supplier}
                                            </CustomCell>
                                            {/* 셀 */}
                                            {row.cells.map(({ item }, idx) => (
                                                <MatrixCell key={idx} item={item} />
                                            ))}
                                        </Box>
                                    ))}
                                </Box>
                            </Box>

                    }
                </Box>
            </Box>
        </Layout>
    );
}

function CustomCell({ children }: { children: any }) {
    return <Box sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    }}>
        <Typography sx={{
            fontSize: 14,
            lineHeight: '20px',
            fontWeight: 500,
            color: blueGrey[700],
            textAlign: 'center',
        }}>
            {children}
        </Typography>
    </Box>
}