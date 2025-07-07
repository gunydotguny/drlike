import { Box, Button, Stack, Typography } from "@mui/material";
import { useState } from "react";

export default function App() {
    const [retrievedCases, setRetrivedCases] = useState<any>(null)
    async function handleSamplePreload() {
        console.log("🚀 Preload 시작합니다...");
        try {
            const res = await fetch("/api/test/preload", { method: "POST" });
            const data = await res.json();
            console.log("✅ Preload 완료:", data);
        } catch (error) {
            console.error("🔥 Preload 실패:", error);
        }
    }

    async function handleUserEmbedding() {
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
    }

    const handleRecommend = async () => {
        console.log("🚀 증례 추천 시작합니다...");
        try {
            const [inputSamples, presetSamples] = await Promise.all([
                fetch("/data/user_input_samples.json").then(res => res.json()),
                fetch("/data/user_preset_sample.json").then(res => res.json())
            ]);

            const response = await fetch("/api/recommend", {
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
            setRetrivedCases(data)
        } catch (e) {
            console.error("추천 실패", e);
        }
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
            <Button onClick={handleSamplePreload}>
                Sample Preload
            </Button>
            <Button onClick={handleUserEmbedding}>
                User Embedding
            </Button>
            <Button onClick={handleRecommend}>
                Get Result (include User Input Embedding)
            </Button>
            {retrievedCases && retrievedCases.map((item: any, index: any) => {
                return <Stack key={index} direction={'column'} spacing={0.5}>
                    <Typography sx={{ fontWeight: 'bold' }}>ID</Typography>
                    <Typography>{item.id}</Typography>
                    <Typography sx={{ fontWeight: 'bold' }}>document</Typography>
                    <Typography>{item.document}</Typography>
                    <Typography sx={{ fontWeight: 'bold' }}>metadata</Typography>
                    <Typography>{item.metadata}</Typography>
                </Stack>
            })}
        </Stack>
    );
}

