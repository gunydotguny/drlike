import LoadingButton from "@mui/lab/LoadingButton";
import { Box, Button, Stack, Typography } from "@mui/material";
import { useState } from "react";

export default function App() {
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState<any>(false)
    async function handleSamplePreload() {
        setLoading(true)
        setData(null)
        console.log("🚀 Preload 시작합니다...");
        try {
            const res = await fetch("/api/test/preload", { method: "POST" });
            const data = await res.json();
            console.log("✅ Preload 완료:", data);
        } catch (error) {
            console.error("🔥 Preload 실패:", error);
        }
        setLoading(false)
    }

    async function handleUserEmbedding() {
        setLoading(true)
        setData(null)
        console.log("🚀 사용자 임베딩 시작합니다...");
        try {
            // ✅ 반드시 fetch로 파일을 불러와야 함 (프론트에서는 fs 안됨)
            const [inputSamples, presetSamples] = await Promise.all([
                fetch("/data/user_input_samples.json").then(res => res.json()),
                fetch("/data/user_preset_sample.json").then(res => res.json())
            ]);

            const res = await fetch("/api/test/user-embedding", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    inputSamples,
                    selectedPresetKey: "first_visit",
                    presetSamples,
                    promptType: "prompt2"
                })
            });
            const data = await res.json();
            console.log("✅ 사용자 임베딩 완료:", data);
        } catch (error) {
            console.error("🔥 사용자 임베딩 실패:", error);
        }
        setLoading(false)
    }

    const handleRecommend = async () => {
        setLoading(true)
        setData(null)
        console.log("🚀 증례 추천 시작합니다...");
        try {
            const [inputSamples, presetSamples] = await Promise.all([
                fetch("/data/user_input_samples.json").then(res => res.json()),
                fetch("/data/user_preset_sample.json").then(res => res.json())
            ]);

            const response = await fetch("/api/test/recommend", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    inputSamples,
                    selectedPresetKey: "first_visit",
                    presetSamples,
                    promptType: "prompt3"
                })
            });
            const data = await response.json();
            console.log("추천 결과:", data);
            setData(data)
        } catch (e) {
            console.error("추천 실패", e);
        }
        setLoading(false)
    };

    return (
        <Stack direction="column" spacing={2} sx={{
            backgroundColor: '#ffffff',
            "@media screen and (min-width: 601px)": {
                position: 'fixed',
                top: `50%`,
                left: `50%`,
                transform: `translate(-50%, -50%)`,
                borderRadius: `8px`,
                width: `960px`,
                height: `100%`,
                maxHeight: `816px`,
                bgcolor: `#ffffff`,
                boxShadow: `0 4px 12px 0 rgba(19, 20, 22, 0.08)`,
                display: 'flex',
                flexDirection: 'column',
                p: 2,
            }
        }}>
            <LoadingButton onClick={handleSamplePreload} loading={loading} variant="contained">
                Sample Preload
            </LoadingButton>
            <LoadingButton onClick={handleUserEmbedding} loading={loading} variant="contained">
                User Input Embedding
            </LoadingButton>
            <LoadingButton onClick={handleRecommend} loading={loading} variant="contained">
                Get Results (include User Input Embedding)
            </LoadingButton>
            <Box sx={{
                flex: 1,
                overflowY: 'auto'
            }}>
                <Stack direction={'column'} spacing={2}>
                    {data && data.retrievedCases.map((item: any, index: any) => {
                        return <Stack key={index} direction={'column'} spacing={0.5} sx={{
                            p: 2, border: `1px solid #000000`
                        }}>
                            <Typography sx={{ fontWeight: 'bold' }}>ID</Typography>
                            <Typography>{item.id}</Typography>

                            <Typography sx={{ fontWeight: 'bold' }}>document</Typography>
                            <Typography>{item.document}</Typography>

                            <Typography sx={{ fontWeight: 'bold' }}>metadata</Typography>
                            <pre style={{
                                background: '#f5f5f5',
                                padding: '1rem',
                                borderRadius: '8px',
                                overflowX: 'auto',
                                whiteSpace: 'pre-wrap',
                                wordBreak: 'break-word',
                                fontSize: 14,
                            }}>
                                {JSON.stringify(item.metadata, null, 2)}
                            </pre>
                        </Stack>
                    })}
                </Stack>
            </Box>
        </Stack >
    );
}

