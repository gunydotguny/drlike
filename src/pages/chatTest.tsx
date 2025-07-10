import React, { useState, useRef, useEffect } from "react";
import { Box, Typography, TextareaAutosize, Button, Stack, Dialog, IconButton } from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import Typo from "../components/atoms/Typo";
import { useRouter } from "next/router";
import CloseIcon from "@mui/icons-material/Close";
import OpenInFullIcon from "@mui/icons-material/OpenInFull";
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

export default function ChatInterface() {
    const [selectedDetail, setSelectedDetail] = useState<any | null>(null);
    const [messages, setMessages] = useState<{ text: string; from: "user" | "bot"; cases?: any[] }[]>([]);
    const [input, setInput] = useState("");
    const chatEndRef = useRef<HTMLDivElement | null>(null);
    const [loading, setLoading] = useState(false);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };
    useEffect(() => {
        console.log("messages.length", messages.length, messages);
    }, [])
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const [awaitingAdditionalAnswer, setAwaitingAdditionalAnswer] = useState(false);

    const handleSend = async () => {
        if (!input.trim()) return;
        const userMessage = input;
        setInput("");

        setMessages((prev) => [...prev, { text: userMessage, from: "user" }]);

        try {
            // ✅ 추가 질문 응답 처리 흐름
            if (awaitingAdditionalAnswer) {
                const res = await fetch("/api/chat/validateAdditional", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ additionalAnswer: userMessage }),
                });
                const { status, info } = await res.json();

                // ✅ 추천 API 호출 (추가 정보 포함/미포함)
                await callRecommendationAPI(info);
                setAwaitingAdditionalAnswer(false);
                return;
            }

            setMessages((prev) => [
                ...prev,
                { text: "답변을 생성 중입니다...", from: "bot", loading: true },
            ]);

            const combinedInput = messages
                .map((msg) => `${msg.from === "user" ? "사용자" : "봇"}: ${msg.text}`)
                .join("\n") + `\n사용자: ${userMessage}`;

            const intentRes = await fetch("/api/chat/intent", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userInput: combinedInput }),
            });

            if (!intentRes.ok) throw new Error("Intent API 호출 실패");

            const { visitStatus, ageValue, ageUnit, nextQuestion, additionalQuestion } = await intentRes.json();

            setMessages((prev) => {
                const newMessages = [...prev];
                newMessages.pop();
                return newMessages;
            });

            let ageInMonths = null;
            if (ageValue !== null && ageUnit) {
                ageInMonths = ageUnit === "year" ? ageValue * 12 : ageValue;
            }

            if (nextQuestion) {
                setMessages((prev) => [...prev, { text: nextQuestion, from: "bot" }]);
                return;
            }

            if (additionalQuestion) {
                setMessages((prev) => [...prev, { text: additionalQuestion, from: "bot" }]);
                setAwaitingAdditionalAnswer(true);
                return;
            }

            // ✅ 추천 API 호출 (추가 정보 없음)
            await callRecommendationAPI(null, userMessage, ageInMonths, visitStatus);

        } catch (error) {
            console.error(error);
            setMessages((prev) => [
                ...prev,
                { text: "❗️ 시스템 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.", from: "bot" },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const callRecommendationAPI = async (additionalInfo: string | null, message?: string, ageMonths?: number, visitStatus?: string) => {
        setLoading(true);
        setMessages((prev) => [
            ...prev,
            { text: "추천 증례를 찾고 있습니다...", from: "bot", loading: true },
        ]);

        const res = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                message,
                careEnvironment: visitStatus === "FIRST_VISIT" ? "first_visit" : "inpatient_care",
                ageMonths,
                additionalInfo,
            }),
        });

        const data = await res.json();

        setMessages((prev) => {
            const newMessages = [...prev];
            newMessages.pop();
            return [...newMessages, {
                text: data.guideMessage,
                from: "bot",
                cases: data.cases.length > 0 ? data.cases : undefined,
            }];
        });
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
                    overflow: 'hidden'
                },
            }}>
                <Header />
                <Box sx={{
                    position: 'relative', flex: 1, overflowY: "auto", pt: 3, pb: 3,
                    "@media screen and (max-width: 600px)": {
                        minHeight: '100vh',
                        pt: '132px'
                    }
                }}>
                    {messages.length === 0 && (
                        <Box sx={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            textAlign: 'center',
                            zIndex: 99
                        }}>
                            <Typo sx={{
                                fontSize: '14px',
                                lineHeight: '24px',
                                color: '#898989',
                                textAlign: 'center'
                            }}>
                                이 서비스는 소아 감염·호흡기·알레르기 질환에 대한 증례 추천을 위한 서비스입니다.<br />
                                환자의 진료 환경이나 연령, 증상 등을 입력해 유사 증례를 추천 받아 보세요.
                            </Typo>
                        </Box>
                    )}
                    {messages.map((msg, index) => (
                        <Box key={index} sx={{
                            mb: 5,
                        }}>
                            <Box sx={{
                                position: 'relative',
                                width: '100%',
                                display: "flex",
                                flexDirection: 'column',
                                alignItems: msg.from === "user" ? "flex-end" : "flex-start",
                            }}>
                                <Box sx={{
                                    position: 'relative',
                                    px: msg.from === "user" ? 2 : 0,
                                    py: msg.from === "user" ? 1.5 : 0,
                                    borderRadius: 2,
                                    bgcolor: msg.from === "user" ? "grey.50" : "none",
                                    color: "text.primary",
                                    maxWidth: "100%",
                                    wordBreak: "break-word",
                                    whiteSpace: "pre-wrap",
                                    ml: 3,
                                    mr: 3,
                                }}>
                                    <Typography sx={{
                                        fontSize: "16px", lineHeight: "24px",
                                        "@media screen and (max-width: 600px)": {
                                            maxWidth: msg.from === "bot" && msg.cases && msg.cases.length > 0 ? 'calc(100% - 48px)' : 'initial'
                                        }

                                    }}>
                                        {msg.text}
                                    </Typography>
                                </Box>
                                {msg.from === "bot" && msg.cases && msg.cases.length > 0 && (
                                    <Box sx={{
                                        position: 'absolute',
                                        right: 24,
                                        bottom: 0,
                                        display: 'flex', justifyContent: 'flex-end', gap: 1
                                    }}>
                                        <IconButton className={`swiper-button-prev-${index}`} sx={{
                                            bgcolor: "white", boxShadow: 1, borderRadius: 1, width: `32px`, height: `32px`, '&.swiper-button-disabled': {
                                                opacity: 0.3,
                                                pointerEvents: 'none',
                                            },
                                        }}>
                                            <ArrowForwardIosIcon sx={{ transform: 'rotate(180deg)' }} />
                                        </IconButton>
                                        <IconButton className={`swiper-button-next-${index}`} sx={{
                                            bgcolor: "white", boxShadow: 1, borderRadius: 1, width: `32px`, height: `32px`, '&.swiper-button-disabled': {
                                                opacity: 0.3,
                                                pointerEvents: 'none',
                                            },
                                        }}>
                                            <ArrowForwardIosIcon />
                                        </IconButton>
                                    </Box>
                                )}
                            </Box>
                            {msg.from === "bot" && msg.cases && msg.cases.length > 0 && (
                                <Box sx={{
                                    mt: 3,
                                    px: 3,
                                    pb: 3,
                                    overflow: 'hidden',
                                    width: '100%',
                                    maxWidth: '100%',
                                }}>
                                    <Swiper
                                        modules={[Navigation]}
                                        navigation={{
                                            prevEl: `.swiper-button-prev-${index}`,
                                            nextEl: `.swiper-button-next-${index}`,
                                        }}
                                        breakpoints={{
                                            0: { slidesPerView: 1 },
                                            600: { slidesPerView: 3 },
                                        }}
                                        spaceBetween={16}
                                        style={{
                                            padding: '24px 0',
                                            margin: '-24px 0',
                                            overflow: 'visible'
                                        }}
                                    >
                                        {msg.cases.map((caseItem, idx) => (
                                            <SwiperSlide key={idx}>
                                                <Box
                                                    sx={{
                                                        width: '100%',
                                                        maxHeight: "480px",
                                                        borderRadius: '4px',
                                                        border: `1px solid #DCDFE5`,
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        boxShadow: `0 2px 8px rgba(19, 20, 22, 0.1)`,
                                                        bgcolor: 'white',
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
                                                        <OpenInFullIcon onClick={() => setSelectedDetail(caseItem)} sx={{ cursor: 'pointer' }} />
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
                                            </SwiperSlide>
                                        ))}
                                    </Swiper>
                                </Box>
                            )}


                        </Box>
                    ))}
                    <div ref={chatEndRef} />
                    <Box sx={{ height: `108px` }} />
                </Box>
                {/* 입력 영역 */}
                <Box sx={{
                    mt: '-108px',
                    pl: 3,
                    pr: 3,
                    boxShadow: "none",
                    zIndex: 999,
                    background: "linear-gradient(to bottom, rgba(255, 255, 255, 0) 0px, rgba(255, 255, 255, 1) 92px)",
                    "@media screen and (max-width: 600px)": {
                        position: 'fixed',
                        left: 0,
                        right: 0,
                        bottom: 0,
                        zIndex: 9999,
                    }
                }}>
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                    }}>
                        {/* 진료 환경 선택 버튼 */}
                        <Box sx={{ flex: 1, }}>
                            <Box sx={{
                                display: "flex",
                                alignItems: "flex-end",
                                borderRadius: "8px",
                                border: "1px solid rgba(0, 0, 0, 0.12)",
                                backgroundColor: "white",
                                boxShadow: '0px 4px 4px 0px rgba(0, 0, 0, 0.16)',
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
                                    placeholder="메시지를 입력해 주세요."
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e: any) => {
                                        console.log('e.isComposing:', e.isComposing, 'e.nativeEvent.isComposing:', e.nativeEvent.isComposing);
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            if (e.nativeEvent.isComposing) return;
                                            e.preventDefault();
                                            handleSend();
                                        }
                                    }}

                                    style={{
                                        flex: 1,
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
                    <Typo sx={{
                        my: 1,
                        textAlign: 'center',
                        fontSize: 12,
                        color: '#ababab'
                    }}>
                        본 서비스는 증례 추천 외의 질문은 지원하지 않습니다.
                    </Typo>
                </Box >
            </Box>
            {/* 상세 다이얼로그 */}
            <Dialog
                open={!!selectedDetail
                }
                onClose={() => setSelectedDetail(null)}
                maxWidth="md"
                fullWidth
                sx={{ ' .MuiPaper-root': { borderRadius: 1 } }}
            >
                <Box sx={{
                    width: '100%',
                    display: 'flex',
                    p: '20px 24px',
                    alignItems: 'center',
                    borderBottom: '1px solid #DCDFE5',
                }}>
                    <Typo sx={{ fontSize: 20, fontWeight: '700', flex: 1 }}>
                        증례 ID : {selectedDetail?.case_id ?? "-"}
                    </Typo>
                    <CloseIcon onClick={() => setSelectedDetail(null)} sx={{ fontSize: 20, cursor: 'pointer' }} />
                </Box>
                <Box sx={{ flex: 1, overflowY: 'auto' }}>
                    <Box sx={{ width: '100%', p: 3, mb: -3, }}>
                        <Typo sx={{ fontSize: 16, fontWeight: '700', mb: 2 }}>
                            요약
                        </Typo>
                        <Box sx={{
                            display: 'flex',
                        }}>
                            <Stack spacing={1} sx={{
                                flex: 1,
                                ' span': {
                                    display: 'inline-block',
                                    minWidth: '48px !important',
                                    color: '#515867'
                                },
                            }}>
                                <Typo sx={{ fontSize: 14, color: '#8D95A5' }}>
                                    <span>진단명</span> {selectedDetail?.metadata?.diagnosis_diagnosis ?? "-"}
                                </Typo>
                                <Typo sx={{ fontSize: 14, color: '#8D95A5' }}>
                                    <span>나이</span> {selectedDetail?.metadata?.patient_info_age_months ?? "-"}개월
                                </Typo>
                                <Typo sx={{ fontSize: 14, color: '#8D95A5' }}>
                                    <span>성별</span> {selectedDetail?.metadata?.patient_info_sex ?? "-"}
                                </Typo>
                            </Stack>
                            <Box sx={{
                                borderRadius: '4px',
                                p: '12px 16px',
                                backgroundColor: '#F5F6F7',
                                flex: 2,
                            }}>
                                <Typo lines={100} sx={{ fontSize: 14, color: '#515867' }}>
                                    {selectedDetail?.summary ?? "-"}
                                </Typo>
                            </Box>
                        </Box>
                    </Box>
                    <Box sx={{ width: '100%', p: 3 }}>
                        <Typo sx={{ fontSize: 16, fontWeight: '700', mb: 2 }}>
                            상세 정보
                        </Typo>
                        <Stack spacing={1} sx={{
                            ' span': {
                                display: 'block',
                                minWidth: '48px !important',
                                color: '#515867'
                            },
                        }}>
                            {selectedDetail && Object.entries(selectedDetail.metadata || {}).map(([key, value]) => (
                                <Typo key={key} sx={{ fontSize: 14, color: '#8D95A5' }}>
                                    <span>{key}</span>{String(value)}
                                </Typo>
                            ))}
                        </Stack>
                    </Box>
                </Box>
            </Dialog >
        </>
    );
}

function Header() {
    const router = useRouter();
    return (
        <Box sx={{
            display: 'flex',
            alignItems: 'center',
            p: '24px',
            borderBottom: '1px solid #DCDFE5',
            "@media screen and (max-width: 600px)": {
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                zIndex: 9999,
                background: 'white',
                p: '16px 24px',
            }
        }}>
            <Box sx={{
                ' img': { width: '48px !important', height: '48px !important', mr: '24px' }
            }}>
                <img src='/logo/caseRecommend.png' />
            </Box>
            <Box sx={{ flex: 1 }}>
                <Typo sx={{ fontSize: '22px', fontWeight: 700 }}>
                    증례추천
                </Typo>
                <Typo sx={{ fontSize: '15px' }}>
                    소아 감염, 호흡기, 알레르기 진단을 간편하게
                </Typo>
            </Box>
            <Button onClick={() => { router.push('/') }}>
                돌아가기
            </Button>
        </Box>
    );
}
