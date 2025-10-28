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
                const res = await fetch("/api/matrix?minScore=0&sort=평균점수:desc");
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
                        전략명: i.strategyName,
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
                pt: 6,
                mb: 1,
                '@media (max-width: 768px)': {
                    pt: 3,
                }
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
                    background: '#ffffff'
                }}>
                    <CircularProgress />
                </Box>
                :
                error ?
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
                        <Typography color="error">{error}</Typography>
                    </Box>
                    :

                    <Box sx={{
                        p: 3,
                        '@media (max-width: 768px)': {
                            overflowX: 'scroll',
                            p: 0,
                            pt: 3,
                        }
                    }}>
                        <Box sx={{
                            borderRadius: 1,
                            backgroundColor: '#ffffff',
                            pl: 3,
                            pt: 3,
                            pr: 3,
                            pb: 3,
                            height: ' dpx',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            '@media (max-width: 768px)': {
                                justifyContent: 'flex-start',
                                minWidth: '1200px',
                                backgroundColor: '#ffffff',
                                pl: 0,
                                pt: 0,
                                pr: 0,
                                pb: 0,
                            }
                        }}>
                            <Box sx={{
                                ml: -2,
                                mt: -2,
                                '@media (max-width: 768px)': {
                                    ml: 0,
                                    pr: 3,
                                }
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
                                    <CustomCell sticky>
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
                                            <CustomCell sticky>
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
                        </Box>
                    </Box>

            }
        </Layout>
    );
}

function CustomCell({ children, sticky }: { children: any, sticky?: boolean, }) {
    return <Box sx={sticky ? {
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: '#ffffff',
        '@media (max-width: 768px)': {
            position: 'sticky',
            left: 0,
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: '#ffffff',
            zIndex: 99
        }
    } : {
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: '#ffffff',
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