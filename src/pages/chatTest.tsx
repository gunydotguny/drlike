// ChatInterface.tsx
import React, { useState, useRef, useEffect } from "react";
import { Box, Typography, TextareaAutosize, Button, Stack, Dialog } from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import Typo from "../components/atoms/Typo";
import { useRouter } from "next/router";
import CloseIcon from "@mui/icons-material/Close";

const ChatInterface = () => {
    const [selectedDetail, setSelectedDetail] = useState<any | null>(null);
    const [messages, setMessages] = useState<
        { text: string; from: "user" | "bot"; cases?: any[] }[]
    >([]);
    const [input, setInput] = useState("");
    const chatEndRef = useRef<HTMLDivElement | null>(null);
    const [loading, setLoading] = useState(false);
    const [isSending, setIsSending] = useState(false);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage = input;
        setInput("");

        if (isSending) return;

        setMessages((prev) => [
            ...prev,
            { text: userMessage, from: "user" },
            { text: "답변 생성 중...", from: "bot", loading: true },
        ]);
        setIsSending(true);
        setLoading(true);

        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: userMessage }),
            });

            const data = await res.json();

            setMessages((prev) => {
                const newMessages = [...prev];
                newMessages.pop();
                return [...newMessages, {
                    text: data.guideMessage,
                    from: "bot",
                    cases: data.cases
                }];
            });
        } catch (error) {
            setMessages((prev) => {
                const newMessages = [...prev];
                newMessages.pop();
                return [...newMessages, { text: "❗️ 오류가 발생했습니다.", from: "bot" }];
            });
        } finally {
            setLoading(false);
            setIsSending(false);
        }
    };

    return (
        <>
            <Box sx={{
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
                }
            }}>
                <Header />
                <Box sx={{ flex: 1, overflowY: "auto", pt: 2, pb: 3 + 2 }}>
                    {messages.map((msg, index) => (
                        <Box key={index} sx={{
                            display: "flex",
                            flexDirection: 'column',
                            alignItems: msg.from === "user" ? "flex-end" : "flex-start",
                            mb: 3,
                        }}>
                            <Box sx={{
                                px: 2,
                                py: 1.5,
                                borderRadius: 2,
                                bgcolor: msg.from === "user" ? "grey.50" : "none",
                                color: "text.primary",
                                maxWidth: "100%",
                                wordBreak: "break-word",
                                whiteSpace: "pre-wrap",
                                ml: 3,
                                mr: 3,
                            }}>
                                <Typography sx={{ fontSize: "16px", lineHeight: "24px" }}>
                                    {msg.text}
                                </Typography>
                            </Box>

                            {/* 증례 카드 섹션 */}
                            {msg.from === "bot" && msg.cases && msg.cases?.length > 0 && (
                                <Box sx={{
                                    mt: 2,
                                    display: "flex",
                                    overflowX: "auto",
                                    scrollSnapType: "x mandatory",
                                    gap: 3,
                                    '&::-webkit-scrollbar': { display: 'none' },
                                    pb: 2,
                                    width: '100%',
                                }}>
                                    <Box sx={{ flex: "0 0 auto", width: '0px', scrollSnapAlign: "start" }} />
                                    {msg.cases.map((caseItem, idx) => (
                                        <Box
                                            key={idx}
                                            onClick={() => setSelectedDetail(caseItem)}
                                            sx={{
                                                flex: "0 0 auto",
                                                scrollSnapAlign: "start",
                                                width: "320px",
                                                maxHeight: "480px",
                                                borderRadius: '4px',
                                                border: `1px solid #DCDFE5`,
                                                display: 'flex',
                                                flexDirection: 'column',
                                                cursor: 'pointer',
                                                boxShadow: `0 2px 8px rgba(19, 20, 22, 0.1)`,
                                                bgcolor: 'white',
                                                transition: 'box-shadow 0.3s ease',
                                                '&:hover': {
                                                    boxShadow: `4px 4px 16px rgba(19, 20, 22, 0.16)`,
                                                },
                                            }}
                                        >
                                            <Box sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                p: `12px 16px`,
                                                borderBottom: `1px solid #DCDFE5`,
                                            }}>
                                                <Typo sx={{ fontSize: 16, fontWeight: '700', flex: 1 }}>
                                                    증례 ID : {caseItem.case_id ?? "-"}
                                                </Typo>
                                            </Box>
                                            <Stack spacing={2} sx={{ p: `12px 16px`, flex: 1 }}>
                                                <Stack spacing={1} sx={{
                                                    ' span': {
                                                        display: 'inline-block',
                                                        minWidth: '48px !important',
                                                        color: '#515867'
                                                    },
                                                }}>
                                                    <Typo sx={{ fontSize: 14, color: '#8D95A5' }}>
                                                        <span>진단명</span> {caseItem.metadata?.diagnosis_diagnosis ?? "-"}
                                                    </Typo>
                                                    <Typo sx={{ fontSize: 14, color: '#8D95A5' }}>
                                                        <span>나이</span> {caseItem.metadata?.patient_info_age_months ?? "-"}개월
                                                    </Typo>
                                                    <Typo sx={{ fontSize: 14, color: '#8D95A5' }}>
                                                        <span>성별</span> {caseItem.metadata?.patient_info_sex ?? "-"}
                                                    </Typo>
                                                </Stack>
                                                <Box sx={{
                                                    borderRadius: '4px',
                                                    p: `12px 16px`,
                                                    backgroundColor: '#F5F6F7',
                                                    flex: 1,
                                                }}>
                                                    <Typo lines={8} sx={{ fontSize: 14, color: '#515867' }}>
                                                        {caseItem.summary}
                                                    </Typo>
                                                </Box>
                                            </Stack>
                                        </Box>
                                    ))}
                                    <Box sx={{ width: '24px' }} />
                                </Box>
                            )}
                        </Box>
                    ))}
                    <div ref={chatEndRef} />
                </Box>

                {/* 입력 영역 */}
                <Box sx={{
                    mt: -3,
                    pl: 3,
                    pr: 3,
                    pb: 3,
                    bgcolor: "transparent",
                    boxShadow: "none",
                }}>
                    <Box sx={{
                        display: "flex",
                        alignItems: "flex-end",
                        borderRadius: "12px",
                        border: "1px solid #ccc",
                        backgroundColor: "white",
                        boxShadow: `0px 4px 4px 0px rgba(0, 0, 0, 0.16)`,
                        px: 2,
                        py: 1.5,
                        '& textarea': {
                            fontFamily: "inherit",
                            fontSize: "16px !important",
                            lineHeight: '24px'
                        }
                    }}>
                        <TextareaAutosize
                            minRows={1}
                            maxRows={6}
                            placeholder="메시지를 입력하세요..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e: any) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                    if (e.isComposing) return;
                                    e.preventDefault();
                                    handleSend();
                                }
                            }}
                            style={{
                                width: "100%",
                                minHeight: '48px',
                                resize: "none",
                                border: "none",
                                outline: "none",
                                backgroundColor: "transparent",
                            }}
                        />
                        <LoadingButton onClick={handleSend} sx={{ ml: 2 }} variant='contained' color='secondary' loading={loading}>
                            등록
                        </LoadingButton>
                    </Box>
                </Box>
            </Box>

            {/* 상세 다이얼로그 */}
            <Dialog open={!!selectedDetail} onClose={() => setSelectedDetail(null)} maxWidth="md" fullWidth>
                {/* ... 여기에 다이얼로그 내용 추가 (너가 기존에 쓰던 거 그대로 넣으면 됨) */}
            </Dialog>
        </>
    );
};

function Header() {
    const router = useRouter();
    return (
        <Box sx={{
            display: 'flex',
            alignItems: 'center',
            p: `24px`,
            borderBottom: `1px solid #DCDFE5`,
        }}>
            <Box sx={{
                ' img': { width: `48px !important`, height: `48px !important`, mr: `24px` }
            }}>
                <img src='/logo/caseRecommend.png' />
            </Box>
            <Box sx={{ flex: 1 }}>
                <Typo sx={{ fontSize: `22px`, fontWeight: `700` }}>
                    증례추천
                </Typo>
                <Typo sx={{ fontSize: `15px` }}>
                    소아 감염, 호흡기, 알레르기 진단을 간편하게
                </Typo>
            </Box>
            <Button onClick={() => { router.push('/') }}>
                돌아가기
            </Button>
        </Box>
    );
}

export default ChatInterface;
