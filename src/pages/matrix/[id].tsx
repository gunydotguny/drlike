// pages/matrix/[id].tsx
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Box, Typography, CircularProgress, Paper, Divider } from "@mui/material";
import Layout from "../../components/Layout";


export default function StrategyDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/strategy?id=${id}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        setData(json.item);
      } catch (err: any) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading)
    return (
      <Layout>
        <Box sx={{ display: "flex", height: "100vh", alignItems: "center", justifyContent: "center" }}>
          <CircularProgress />
        </Box>
      </Layout>
    );

  if (error)
    return (
      <Layout>
        <Box sx={{ p: 4 }}>
          <Typography color="error">{error}</Typography>
        </Box>
      </Layout>
    );

  if (!data)
    return (
      <Layout>
        <Box sx={{ p: 4 }}>
          <Typography>❗ 데이터를 불러오지 못했습니다.</Typography>
        </Box>
      </Layout>
    );

  const props = data.properties || {};

  return (
    <Layout>
      <Box sx={{ p: 4, maxWidth: 900, mx: "auto" }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          {props["전략명"]?.title?.[0]?.plain_text ?? "제목 없음"}
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={2}>
          {data.url}
        </Typography>

        <Paper sx={{ p: 3, borderRadius: 2 }}>
          {Object.entries(props).map(([key, value]: [string, any]) => {
            let display = "";
            switch (value.type) {
              case "title":
                display = value.title?.map((t: any) => t.plain_text).join("") ?? "";
                break;
              case "rich_text":
                display = value.rich_text?.map((t: any) => t.plain_text).join("") ?? "";
                break;
              case "number":
                display = value.number?.toString() ?? "";
                break;
              case "select":
                display = value.select?.name ?? "";
                break;
              case "multi_select":
                display = value.multi_select?.map((s: any) => s.name).join(", ");
                break;
              case "status":
                display = value.status?.name ?? "";
                break;
              case "date":
                display = value.date?.start ?? "";
                break;
              case "checkbox":
                display = value.checkbox ? "✅" : "❌";
                break;
              case "formula":
                display = value.formula?.number ?? value.formula?.string ?? "";
                break;
              default:
                display = JSON.stringify(value);
            }

            return (
              <Box key={key} sx={{ mb: 1 }}>
                <Typography fontWeight="bold">{key}</Typography>
                <Typography sx={{ whiteSpace: "pre-wrap" }}>{display || "—"}</Typography>
                <Divider sx={{ my: 1 }} />
              </Box>
            );
          })}
        </Paper>
      </Box>
    </Layout>
  );
}
