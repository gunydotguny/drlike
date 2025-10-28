import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Divider,
  Paper,
  Button,
  Stack,
} from "@mui/material";
import Layout from "../../components/Layout";

export default function StrategyDetailPage() {
  const router = useRouter();
  const { id } = router.query;

  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      try {
        const res = await fetch("/api/matrix");
        const json = await res.json();
        const found = json.items.find((i: any) => i.id === id);
        setData(found || null);
      } catch (err) {
        console.error("❌ fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading)
    return (
      <Layout>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
          }}
        >
          <CircularProgress />
        </Box>
      </Layout>
    );

  if (!data)
    return (
      <Layout>
        <Box sx={{ p: 4 }}>
          <Typography>데이터를 불러오지 못했습니다.</Typography>
        </Box>
      </Layout>
    );

  return (
    <Layout>
      <Box sx={{ p: 4 }}>
        {/* ✅ 제목 */}
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          {data.strategyName || "전략 상세"}
        </Typography>

        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          {data.strategyDesc || "-"}
        </Typography>

        <Divider sx={{ my: 3 }} />

        {/* ✅ 정보 카드 */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Stack spacing={1.5}>
            <Field label="공급자" value={data.supplier} />
            <Field label="수요자" value={data.customer} />
            <Field label="데이터" value={data.dataType} />
            <Field label="시장 동향" value={data.marketTrend} />
            <Field label="서비스/제품 형태" value={data.serviceType} />
            <Field label="서비스/제품 형태 설명" value={data.serviceTypeDesc} />
            <Field label="수요 크기" value={data.demandSize} />
            <Field label="수요 크기 설명" value={data.demandSizeDesc} />
            <Field label="공급 용이성" value={data.supplyEase} />
            <Field label="공급 용이성 설명" value={data.supplyEaseDesc} />
            <Field label="수익 크기" value={data.revenueSize} />
            <Field label="수익 크기 설명" value={data.revenueSizeDesc} />
            <Field label="대표 사례" value={data.examples} />
            <Field
              label="평균점수"
              value={data.avgScore ? `${data.avgScore}점` : "-"}
            />
          </Stack>
        </Paper>

        {/* ✅ 원본 노션 링크 */}
        {data.url && (
          <Button
            variant="contained"
            color="primary"
            onClick={() => window.open(data.url, "_blank")}
          >
            원본 노션 페이지 열기
          </Button>
        )}
      </Box>
    </Layout>
  );
}

/** ✅ 각 필드 표현용 작은 컴포넌트 */
function Field({ label, value }: { label: string; value: any }) {
  return (
    <Box>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ fontWeight: 600 }}
      >
        {label}
      </Typography>
      <Typography
        variant="body1"
        sx={{
          ml: 0.5,
          whiteSpace: "pre-wrap",
          wordBreak: "keep-all",
        }}
      >
        {Array.isArray(value)
          ? value.length
            ? value.join(", ")
            : "-"
          : value || "-"}
      </Typography>
    </Box>
  );
}
