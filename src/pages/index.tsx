import { alpha, Box, Button, ButtonBase, Checkbox, CircularProgress, Container, FormControl, FormControlLabel, FormGroup, FormLabel, InputBase, Paper, Radio, RadioGroup, Stack, TextField, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import { MouseEventHandler, useEffect, useRef, useState } from "react";
import OpenAI from "openai";
import { presets } from "../preset";
import Typo from "../components/atoms/Typo";
import { DatePicker } from '@mui/x-date-pickers';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { CaseType, getInitialFormData, options } from "../options";
import LoadingButton from '@mui/lab/LoadingButton';
import EditIcon from '@mui/icons-material/Edit';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import RefreshIcon from '@mui/icons-material/Refresh';
import { Dialog, DialogTitle, DialogContent, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

type ScreenState = 'input' | 'result';

export default function App() {
  const [screen, setScreen] = useState<ScreenState>('input');
  const [recommendationResult, setRecommendationResult] = useState<CaseType[]>([])
  const [selectedDetail, setSelectedDetail] = useState<any | null>(null); // 모달용
  const [presetValue, setPresetValue] = useState<"first_visit" | "inpatient_care">(presets[0].value)
  const [formData, setFormData] = useState<any>(getInitialFormData(presets[0].value));
  const [loading, setLoading] = useState<boolean>(false);
  const [noResult, setNoResult] = useState<boolean>(false);

  const isFormValid = (formData: any) => {
    return !!formData.patient_name && !!formData.age;
  };
  const handleChange = (field: string) => (event: any) => {
    const value = event.target?.value ?? event;
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleCheckboxGroupChange = (group: string, value: string) => {
    setFormData((prev: any) => {
      const current = prev[group] || [];
      return {
        ...prev,
        [group]: current.includes(value)
          ? current.filter((v: string) => v !== value)
          : [...current, value],
      };
    });
  }
  const handleRecommend = async () => {
    setLoading(true);
    try {
      console.log("✅ API 호출 시작! 벡터 DB는 100건 기준 1~3분 소요");
      const response = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ formData, presetValue })
      });
      const json = await response.json();
      console.log("📥 응답 전체:", json); // ← 이거 먼저 찍어보자
      const { recommendationList, raw, debug, reason } = json

      // ✅ 크롬 개발자도구에 출력
      if (debug) {
        console.log("✅ 벡터 길이:", 1024);
        console.log("💾 총 저장 건수:", debug.totalCount);
        console.log("🔍 검색된 건수:", debug.retrieved);
        console.log("✅ 필터 통과 건수:", debug.filtered);
        console.log("🧠 Prompt 길이:", debug.promptLength);
        console.log("🧠 Prompt 샘플:\n", debug.promptPreview);
        // console.log("🧠 LLM Raw 응답:", raw);
        console.log("📦 추천 건수:", recommendationList?.length);
        console.log("❗️추천 결과 없음 사유:", reason);
      }

      if (!recommendationList || recommendationList.length === 0) {
        alert("추천 결과가 없습니다.");
        return;
      }
      const parsedResult = Array.isArray(recommendationList) ? recommendationList : [];
      setRecommendationResult(parsedResult);
      setScreen("result");

    } catch (e) {
      console.error("❌ handleRecommend error:", e);
      alert("추천 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };
  const handleEdit = () => {
    setScreen('input')
  }
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
        {/* {loading === true &&
        <Box sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: alpha('#ffffff', 0.4)
        }}>
          <CircularProgress />
        </Box>
      } */}
        {loading === true ?
          <Box sx={{
            flex: 1,
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: alpha('#ffffff', 0.4),
            "@media screen and (max-width: 600px)": {
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            }
          }}>
            <CircularProgress />
            <Typo sx={{
              fontSize: 13,
              color: '#8D95A5',
              mt: 2
            }}>증례를 추천중입니다. 잠시만 기다려 주세요...</Typo>
          </Box>
          : screen === 'result' ?
            <Box sx={{
              "@media screen and (min-width: 601px)": {
                flex: 1,
                display: 'flex',
                overflow: 'hidden'
              },
            }}>
              <PatientSummary
                formData={formData}
                onEdit={handleEdit}
              />
              <Box sx={{
                "@media screen and (min-width: 601px)": {
                  display: 'flex',
                  flexDirection: 'column',
                  flex: 1,
                  minHeight: 0,
                },
              }}>
                <Box sx={{
                  display: 'flex',
                  alignItems: 'center',
                  p: 3,
                }}>
                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    flex: 1,
                  }}>
                    <Typo sx={{
                      fontSize: `17px`,
                      fontWeight: '700',
                      mr: 1,
                      ' span': {
                        fontWeight: `700`,
                      }
                    }}>
                      유사 증례 목록
                    </Typo>
                    <Box sx={{
                      background: '#EDEFF2',
                      borderRadius: 2,
                      minWidth: '24px',
                      height: '24px',
                      p: '0px 8px',
                      display: 'flex',
                      alignItems: 'center'
                    }}>
                      <Typo sx={{
                        fontSize: 13,
                        fontWeight: '700',
                        color: '#515867'
                      }}>
                        {recommendationResult.length ?? "-"}
                      </Typo>
                    </Box>
                  </Box>
                  <ButtonBase onClick={handleRecommend}>
                    <RefreshIcon sx={{
                      fontSize: 15,
                      color: '#8D95A5',
                      mr: 0.5
                    }} />
                    <Typo sx={{
                      fontSize: 13,

                      color: '#8D95A5',
                    }}>
                      추천 새로고침
                    </Typo>
                  </ButtonBase>
                </Box>
                <Box sx={{
                  flex: 1,
                  overflowY: 'auto',
                }}>
                  <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: "1fr 1fr",
                    gap: 2,
                    p: 3,
                    mt: -3,
                    "@media screen and (max-width: 600px)": {
                      gridTemplateColumns: "1fr",
                    }
                  }}>
                    {recommendationResult.map((item, index) => (
                      <ResultCard key={index} item={item} onClick={() => { setSelectedDetail(item) }} />
                    ))}
                  </Box>
                </Box>
              </Box>
            </Box> :
            <Box sx={{
              flex: 1,
              overflowY: 'auto'
            }}>
              <Box sx={{
                p: `24px`,
              }}>
                <Typo sx={{
                  fontSize: `15px`,
                  color: `#515867`,
                  mb: 2,
                  ' span': {
                    fontWeight: `700`,
                  }
                }}>
                  <span>STEP 1.</span> 현재 환자의 진료 상황을 선택해 주세요.
                </Typo>
                <Stack
                  direction={'row'}
                  spacing={2}>
                  {presets.map((item, index) => {
                    const checekd = presetValue === item.value
                    const handleClickPreset = () => {
                      setPresetValue(item.value)
                    }
                    return <PresetItem
                      key={index}
                      item={item}
                      checked={checekd} onClick={handleClickPreset} />
                  })}
                </Stack>
              </Box>
              <Box sx={{
                p: `24px`,
              }}>
                <Typo sx={{
                  fontSize: `15px`,
                  color: `#515867`,
                  mb: 2,
                  ' span': {
                    fontWeight: `700`,
                  }
                }}>
                  <span>STEP 2.</span> 정확한 추천을 위해 환자 정보를 입력하세요. (환아명, 나이 필수)
                </Typo>
                <FormSection
                  formData={formData}
                  onChange={handleChange}
                  onCheckboxGroupChange={handleCheckboxGroupChange}
                  presetValue={presetValue}
                />
                <LoadingButton
                  size='large'
                  fullWidth
                  variant={'contained'}
                  disabled={!isFormValid(formData)}
                  onClick={handleRecommend}
                  loading={loading}
                >증례 추천받기</LoadingButton>
              </Box>
            </Box>}
      </Box>
      <CaseDetailModal
        item={selectedDetail}
        onClose={() => setSelectedDetail(null)}
      />
    </>
  );
}

function Header() {
  return <Box sx={{
    display: 'flex',
    alignItems: 'center',
    p: `24px`,
    borderBottom: `1px solid #DCDFE5`,
  }}>
    <Box sx={{
      ' img': {
        width: `48px !important`,
        height: `48px !important`,
        mr: `24px`
      }
    }}>
      <img src='/logo/caseRecommend.png' />
    </Box>
    <Box sx={{ flex: 1 }}>
      <Typo sx={{
        fontSize: `22px`,
        fontWeight: `700`
      }}>
        증례추천
      </Typo>
      <Typo sx={{
        fontSize: `15px`,
      }}>
        소아 감염, 호흡기, 알레르기 진단을  간편하게
      </Typo>
    </Box>
  </Box>
}

function PresetItem({ item, checked, onClick }: { item: { label: string, value: string, desc: string }, checked: boolean, onClick: MouseEventHandler<HTMLButtonElement> | undefined }) {
  const border = checked ? `2px solid #0657F9` : `1px solid #DCDFE5`
  return <ButtonBase onClick={onClick} sx={{
    border: border,
    p: `16px`,
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
    borderRadius: `8px`,
    width: '100%',
    boxShadow: checked ? `4px 4px 16px 4px rgba(19, 20, 22, 0.16)` : ``,
    transition: `all 0.35s ease`,
    '& *': { cursor: 'pointer !important' },
    cursor: 'pointer !important',
    "@media screen and (max-width: 600px)": {
      flexDirection: 'column',
      alignItems: 'flex-start'
    }
  }}>
    <Checkbox checked={checked} sx={{
      "@media screen and (max-width: 600px)": {
        ml: -1.5,
        mt: -1.5
      },
      '& .MuiSvgIcon-root': { fontSize: 24 }, mr: 1, transition: `all 0.35s ease`,
    }} />
    <Box>
      <Typo sx={{
        fontSize: `17px`,
        fontWeight: `700`
      }}>
        {item.label}
      </Typo>
      <Typo sx={{
        fontSize: `13px`,
      }}>
        {item.desc}
      </Typo>
    </Box>
  </ButtonBase>
}

const inputStyle = {
  '& .MuiOutlinedInput-root': {
    height: 48,
    borderRadius: '8px',
    backgroundColor: '#ffffff',
    '& fieldset': {
      borderColor: '#DCDFE5',
    },
    '&:hover fieldset': {
      borderColor: '#A0A4B1',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#0657F9',
      borderWidth: 2,
    },
  },
  '& input': {
    fontSize: `15px !important`,
    paddingLeft: '16px',
  },
  '& textarea': {
    fontSize: `15px !important`,
    paddingLeft: '16px',
  }
};

const multilineStyle = {
  '& .MuiOutlinedInput-root': {
    minHeight: 120,
    borderRadius: '8px',
    backgroundColor: '#ffffff',
    p: `0 !important`,
    '& fieldset': {
      borderColor: '#DCDFE5',
    },
    '&:hover fieldset': {
      borderColor: '#A0A4B1',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#0657F9',
      borderWidth: 2,
    },
  },
  '& textarea': {
    fontSize: `15px !important`,
    padding: '13.5px 16px !important',
  }
};
const toggleStyle = {
  flex: 1,
  height: 48,
  borderRadius: '8px !important',
  border: '1px solid #DCDFE5 !important',
  '&.Mui-selected': {
    border: '2px solid #0657F9 !important',
    backgroundColor: '#ffffff !important',
    boxShadow: `4px 4px 16px 4px rgba(19, 20, 22, 0.16)`,
    transition: `all 0.35s ease`
  },
  fontSize: `15px !important`
};

function FormSection({ formData, onChange, onCheckboxGroupChange, presetValue }: any) {
  return (
    <Stack direction={'row'} gap={2} sx={{
      "@media screen and (max-width: 600px)": {
        flexDirection: 'column !important'
      }
    }}>
      <Box sx={{ flex: 1 }}>
        <Box sx={{ mb: 3 }}>
          <Typo sx={{ fontSize: 15, color: '#515867', mb: 1, ' span': { color: '#ff0000' } }}>환아명<span> *</span></Typo>
          <TextField
            placeholder="환아의 이름을 입력하세요."
            variant="outlined"
            fullWidth
            sx={inputStyle}
            value={formData.patient_name || ''}
            onChange={onChange('patient_name')}
          />
        </Box>
        <Box sx={{ mb: 3 }}>
          <Typo sx={{ fontSize: 15, color: '#515867', mb: 1, ' span': { color: '#ff0000' } }}>나이<span> *</span></Typo>
          <TextField
            placeholder="환아의 만 나이를 입력하세요."
            type="number"
            fullWidth
            sx={inputStyle}
            value={formData.age || ''}
            onChange={onChange("age")}
            InputProps={{
              endAdornment: (
                <Typo sx={{ ml: 1, mr: 0.5, fontSize: '15px', color: '#515867' }}>
                  세
                </Typo>
              )
            }}
          />
        </Box>
        <Box sx={{ mb: 3 }}>
          <Typo sx={{ fontSize: 15, color: '#515867', mb: 1 }}>성별</Typo>
          <ToggleButtonGroup
            exclusive
            fullWidth
            sx={{ gap: 1 }}
            value={formData.sex || ''}
            onChange={(e, val) => {
              if (formData.sex === val) {
                onChange("sex")({ target: { value: '' } }); // 해제
              } else {
                onChange("sex")({ target: { value: val } }); // 선택
              }
            }}
          >
            <ToggleButton value="남" sx={toggleStyle}>남아</ToggleButton>
            <ToggleButton value="여" sx={toggleStyle}>여아</ToggleButton>
            <ToggleButton value="무관" sx={toggleStyle}>무관</ToggleButton>
          </ToggleButtonGroup>
        </Box>
        <Box sx={{ mb: 3 }}>
          <Typo sx={{ fontSize: 15, color: '#515867', mb: 1 }}>신장</Typo>
          <TextField
            placeholder="환아의 신장을 입력하세요."
            type="number"
            fullWidth
            sx={inputStyle}
            value={formData.height_cm || ''}
            onChange={onChange("height_cm")}
            InputProps={{
              endAdornment: (
                <Typo sx={{ ml: 1, mr: 0.5, fontSize: '15px', color: '#515867' }}>
                  cm
                </Typo>
              )
            }}
          />
        </Box>
        <Box sx={{ mb: 3 }}>
          <Typo sx={{ fontSize: 15, color: '#515867', mb: 1 }}>체중</Typo>
          <TextField
            placeholder="환아의 체중을 입력하세요."
            type="number"
            fullWidth
            sx={inputStyle}
            value={formData.weight_kg || ''}
            onChange={onChange("weight_kg")}
            InputProps={{
              endAdornment: (
                <Typo sx={{ ml: 1, mr: 0.5, fontSize: '15px', color: '#515867' }}>
                  kg
                </Typo>
              )
            }}
          />
        </Box>
        <CheckboxGroup
          label="진단명"
          field="diagnosis"
          items={options.diagnosis}
          formData={formData}
          onChange={onCheckboxGroupChange}
        />

        <CheckboxGroup
          label="발달 혹은 영양 상태"
          field="nutritional_status"
          items={options.nutritional_status}
          formData={formData}
          onChange={onCheckboxGroupChange}
        />

        <CheckboxGroup
          label="간호 요구 항목"
          field="nursing_requirements"
          items={options.nursing_requirements}
          formData={formData}
          onChange={onCheckboxGroupChange}
        />

        <CheckboxGroup
          label="기저 질환 및 과거력"
          field="past_history"
          items={options.past_history}
          formData={formData}
          onChange={onCheckboxGroupChange}
        />
        <CheckboxGroup
          label="주 증상"
          field="symptoms"
          items={options.symptoms}
          formData={formData}
          onChange={onCheckboxGroupChange}
        />
      </Box>
      <Box sx={{ flex: 1 }}>
        <CheckboxGroup
          label="신체 진찰 소견"
          field="physical_exam"
          items={options.physical_exam}
          formData={formData}
          onChange={onCheckboxGroupChange}
        />
        <CheckboxGroup
          label="임상 관찰 정보"
          field="clinical_observation"
          items={options.clinical_observation}
          formData={formData}
          onChange={onCheckboxGroupChange}
        />
        <Box sx={{ mb: 3 }}>
          <Typo sx={{ fontSize: 15, color: '#515867', mb: 1 }}>혈액 검사 결과</Typo>
          <TextField
            placeholder="혈액 검사 결과를 입력하세요."
            fullWidth
            multiline
            minRows={3}
            sx={multilineStyle}
            value={formData.lab_test_summary || ''}
            onChange={onChange("lab_test_summary")}
          />
        </Box>
        <Box sx={{ mb: 3 }}>
          <Typo sx={{ fontSize: 15, color: '#515867', mb: 1 }}>영상 검사 결과</Typo>
          <TextField
            placeholder="영상 검사 결과를 입력하세요."
            fullWidth
            multiline
            minRows={3}
            sx={multilineStyle}
            value={formData.imaging_findings || ''}
            onChange={onChange("imaging_findings")}
          />
        </Box>
        <CheckboxGroup
          label="확인된 병원균"
          field="confirmed_pathogen"
          items={options.confirmed_pathogen}
          formData={formData}
          onChange={onCheckboxGroupChange}
        />
        {presetValue === 'inpatient_care' && <>
          <CheckboxGroup
            label="사용 항생제"
            field="antibiotics_administered"
            items={options.antibiotics_administered}
            formData={formData}
            onChange={onCheckboxGroupChange}
          />

          <CheckboxGroup
            label="산소 치료 요법"
            field="oxygen_therapy"
            items={options.oxygen_therapy}
            formData={formData}
            onChange={onCheckboxGroupChange}
          />

          <Box sx={{ mb: 3 }}>
            <Typo sx={{ fontSize: 15, color: '#515867', mb: 2 }}>재원 기간</Typo>
            <Stack direction="row" spacing={1} sx={{
              alignItems: 'center'
            }}>
              <DatePicker
                inputFormat="yyyy-MM-dd"
                value={formData.hospital_stay_duration?.start || null}
                onChange={(val) => onChange("hospital_stay_duration")({
                  target: {
                    value: {
                      ...formData.hospital_stay_duration,
                      start: val,
                    },
                  },
                })}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="시작일"
                    fullWidth
                    sx={{
                      ...inputStyle,
                      '& input': {
                        ...inputStyle['& input'],
                        fontSize: '15px !important',
                        paddingLeft: '16px !important',
                        pt: 1.5,
                      },
                      '& .MuiOutlinedInput-root': {
                        ...inputStyle['& .MuiOutlinedInput-root'],
                        height: 48,
                      },
                      '& .MuiInputBase-input': {
                        fontSize: '15px !important',
                      },
                      '& .MuiOutlinedInput-notchedOutline legend': {
                        display: 'none',
                      },
                    }}
                    InputProps={{
                      ...params.InputProps,
                      readOnly: true,
                      endAdornment: (
                        <CalendarMonthIcon sx={{ color: '#000000', mr: 1 }} />
                      ),
                    }}
                    InputLabelProps={{ shrink: true }}
                  />
                )}
              />
              <Typo sx={{
                fontSize: 15,
                color: '#8D95A5'
              }}>~</Typo>
              <DatePicker
                inputFormat="yyyy-MM-dd"
                value={formData.hospital_stay_duration?.end || null}
                onChange={(val) => onChange("hospital_stay_duration")({ target: { value: { ...formData.hospital_stay_duration, end: val } } })}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="종료일"
                    fullWidth
                    sx={{
                      ...inputStyle,
                      '& input': {
                        ...inputStyle['& input'],
                        fontSize: '15px !important',
                        paddingLeft: '16px !important',
                        pt: 1.5,
                      },
                      '& .MuiOutlinedInput-root': {
                        ...inputStyle['& .MuiOutlinedInput-root'],
                        height: 48,
                      },
                      '& .MuiInputBase-input': {
                        fontSize: '15px !important',
                      },
                      '& .MuiOutlinedInput-notchedOutline legend': {
                        display: 'none',
                      },
                    }}
                    InputProps={{
                      ...params.InputProps,
                      readOnly: true,
                      endAdornment: (
                        <CalendarMonthIcon sx={{ color: '#000000', mr: 1 }} />
                      ),
                    }}
                    InputLabelProps={{ shrink: true }}
                  />
                )}
              />
            </Stack>
          </Box>
          <Box sx={{ mb: 3 }}>
            <Typo sx={{ fontSize: 15, color: '#515867', mb: 1 }}>중환자실 입실 여부</Typo>
            <ToggleButtonGroup
              exclusive
              fullWidth
              sx={{ gap: 1 }}
              value={formData.icu_admission || ''}
              onChange={(e, val) => {
                if (formData.sex === val) {
                  onChange("icu_admission")({ target: { value: '' } }); // 해제
                } else {
                  onChange("icu_admission")({ target: { value: val } }); // 선택
                }
              }}
            >
              <ToggleButton value="Yes" sx={toggleStyle}>YES</ToggleButton>
              <ToggleButton value="No" sx={toggleStyle}>NO</ToggleButton>
            </ToggleButtonGroup>
          </Box>
        </>}
      </Box>
    </Stack >
  );
}

type CheckboxGroupProps = {
  label: string;
  field: string;
  items: { value: string; label: string }[];
  formData: any;
  onChange: (field: string, value: string) => void;
};


function CheckboxGroup({
  label,
  field,
  items,
  formData,
  onChange
}: CheckboxGroupProps) {
  return (
    <Box sx={{ mb: 3 }}>
      <FormControl component="fieldset">
        <FormLabel component="legend" sx={{ fontSize: 15, color: '#515867 !important', mb: 1 }}>{label}</FormLabel>
        <FormGroup>
          {items.map((item) => (
            <Box key={item.value} sx={{ display: 'flex', alignItems: 'center', pt: 0.5, pb: 0.5 }}>
              <Checkbox
                disableRipple
                checked={(formData[field] || []).includes(item.value)}
                onChange={() => onChange(field, item.value)}
                sx={{
                  mr: 1,
                  p: 0,
                  '&.Mui-checked': { color: '#0657F9' },
                  '& .MuiSvgIcon-root': {
                    fontSize: 24,
                    borderRadius: '4px',
                    // border: '1px solid #DCDFE5'
                  }
                }}
              />
              <Typography sx={{ fontSize: 15 }}>{item.label}</Typography>
            </Box>
          ))}
          <Box sx={{ display: 'flex', alignItems: 'center', pt: 0, pb: 0 }}>
            <Checkbox
              checked={(formData[field] || []).includes('기타')}
              onChange={() => onChange(field, '기타')}
              sx={{
                mr: 0.5,
                p: 0,
                '&.Mui-checked': { color: '#0657F9' },
                '& .MuiSvgIcon-root': {
                  fontSize: 24,
                  borderRadius: '4px',
                  // border: '1px solid #DCDFE5'
                }
              }}
            />
            <TextField
              placeholder="기타"
              size="small"
              sx={{
                flex: 1,
                '& .MuiOutlinedInput-root': {
                  height: 32,
                  fontSize: 15,
                  borderRadius: '4px !important',
                  '& fieldset': {
                    borderColor: '#DCDFE5',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#0657F9',
                    borderWidth: 2,
                  },
                  '& input': {
                    pl: `12px !important`,
                  }
                }
              }}
              value={formData[`${field}_etc`] || ''}
              onChange={(e) => onChange(`${field}_etc`, e.target.value)}
            />
          </Box>
        </FormGroup>
      </FormControl>
    </Box>
  );
}

const fieldLabels: { [key: string]: string } = {
  patient_name: "환아명",
  age: "연령",
  sex: "성별",
  height_cm: "신장",
  weight_kg: "체중",
  diagnosis: "진단명",
  nutritional_status: "영양/발달 상태",
  nursing_requirements: "간호 요구",
  past_history: "과거력",
  symptoms: "주 증상",
  physical_exam: "신체 진찰 소견",
  clinical_observation: "임상 관찰 정보",
  lab_test_summary: "혈액 검사 결과",
  imaging_findings: "영상 검사 결과",
  confirmed_pathogen: "확인된 병원균",
  antibiotics_administered: "사용 항생제",
  oxygen_therapy: "산소 치료 요법",
  icu_admission: "중환자실 입실 여부",
  hospital_stay_duration: "재원 기간",
};

function displayValue(value: any): string {
  if (!value || (Array.isArray(value) && value.length === 0)) return "-";
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "object") {
    if (value.start || value.end) {
      const start = value.start ? new Date(value.start).toLocaleDateString() : "-";
      const end = value.end ? new Date(value.end).toLocaleDateString() : "-";
      return `${start} ~ ${end}`;
    }
    return JSON.stringify(value);
  }
  return String(value);
}

function PatientSummary({ formData, onEdit }: { formData: any, onEdit: any }) {
  const entries = Object.entries(fieldLabels).filter(
    ([key]) => formData[key] !== undefined && formData[key] !== ""
  );
  return (
    <Box sx={{
      "@media screen and (min-width: 601px)": {
        minHeight: 0,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        width: '320px',
      },
    }}>
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        p: 3,
        flexShrink: 0,
      }}>
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          flex: 1,
        }}>
          <Typo sx={{
            fontSize: `17px`,
            fontWeight: '700',
            mr: 1,
            ' span': {
              fontWeight: `700`,
            }
          }}>
            환아 정보
          </Typo>
        </Box>
        <ButtonBase onClick={onEdit}>
          <EditIcon sx={{
            fontSize: 15,
            color: '#8D95A5',
            mr: 0.5
          }} />
          <Typo sx={{
            fontSize: 13,

            color: '#8D95A5',
          }}>
            조건 수정하기
          </Typo>
        </ButtonBase>
      </Box>
      <Box sx={{
        flex: 1,
        minHeight: 0,
        overflowY: 'auto',
      }}>
        <Stack spacing={1} sx={{ p: 3, mt: -3 }}>
          {entries.map(([key, label]) =>
            <InfoRow
              key={key}
              label={label}
              value={displayValue(formData[key])}
            />
          )}
        </Stack>
      </Box>
    </Box>
  );
}

function InfoRow({ label, value }: { label: string, value: string }) {
  return (
    <Stack spacing={1} sx={{
      ' span': {
        display: 'block',
        minWidth: '48px !important',
        color: '#515867'
      },
    }}>
      <Typo sx={{ fontSize: 13, color: '#8D95A5' }}>
        <span>{label}</span> {value}
      </Typo>
    </Stack>
  );
}

function ResultCard({ item, onClick }: { item: any, onClick: any }) {
  return <ButtonBase sx={{
    borderRadius: '4px',
    border: `1px solid #DCDFE5`,
    display: 'flex',
    flexDirection: 'column',
  }}
    onClick={onClick}
  >
    <Box sx={{
      width: '100%',
      display: 'flex',
      p: `12px 16px`,
      alignItems: 'center',
      borderBottom: `1px solid #DCDFE5`,
    }}>
      <Typo sx={{ fontSize: 13, fontWeight: '700', flex: 1, }}>
        증례 id : {item.case_id}
      </Typo>
      <FullscreenIcon />
    </Box>
    <Stack
      spacing={2}
      sx={{
        p: `12px 16px`,
        width: '100%',
      }}>
      <Stack spacing={1} sx={{
        ' span': {
          display: 'inline-block',
          minWidth: '48px !important',
          color: '#515867'
        },
      }}>
        <Typo sx={{ fontSize: 13, color: '#8D95A5' }}>
          <span>진단명</span> {item.diagnosis}
        </Typo>
        <Typo sx={{ fontSize: 13, color: '#8D95A5' }}>
          <span>나이</span> {item.age}세
        </Typo>
        <Typo sx={{ fontSize: 13, color: '#8D95A5' }}>
          <span>성별</span> {item.sex}
        </Typo>
      </Stack>
      <Box sx={{
        borderRadius: '4px',
        p: `12px 16px`,
        backgroundColor: '#F5F6F7',
        flex: 1,
      }}>
        <Typo
          lines={4}
          sx={{
            fontSize: 13,
            color: '#515867'
          }}>
          {item.case_summary}
        </Typo>
      </Box>
    </Stack>
  </ButtonBase>
}

function CaseDetailModal({ item, onClose }: { item: any, onClose: () => void }) {
  if (!item) return null;
  const formData = item
  const entries = Object.entries(fieldLabels).filter(
    ([key]) => formData[key] !== undefined && formData[key] !== ""
  );
  return (
    <Dialog open={!!item} onClose={onClose} maxWidth="md" fullWidth sx={{
      ' .MuiPaper-root': {
        borderRadius: 1,
      }
    }}>
      <Box sx={{
        width: '100%',
        display: 'flex',
        p: `20px 24px`,
        alignItems: 'center',
        borderBottom: `1px solid #DCDFE5`,
      }}>
        <Typo sx={{ fontSize: 17, fontWeight: '700', flex: 1, }}>
          증례 id : {item.case_id}
        </Typo>
        <CloseIcon onClick={onClose} sx={{ fontSize: 20 }} />
      </Box>
      <Box sx={{
        flex: 1,
        overflowY: 'auto',
      }}>
        <Box sx={{
          width: '100%',
          p: 3,
          mb: -3,
        }}>
          <Typo sx={{
            fontSize: `15px`,
            fontWeight: '700',
            mb: 2,
          }}>
            환아 기본정보
          </Typo>
          <Box sx={{
            "@media screen and (min-width: 601px)": {
              width: '100%',
              display: 'flex',
            },
          }}>
            <Stack spacing={1} sx={{
              flex: 1,
              ' span': {
                display: 'inline-block',
                minWidth: '48px !important',
                color: '#515867'
              },
            }}>
              <Typo sx={{ fontSize: 13, color: '#8D95A5' }}>
                <span>진단명</span> {item.diagnosis}
              </Typo>
              <Typo sx={{ fontSize: 13, color: '#8D95A5' }}>
                <span>나이</span> {item.age}세
              </Typo>
              <Typo sx={{ fontSize: 13, color: '#8D95A5' }}>
                <span>성별</span> {item.sex}
              </Typo>
            </Stack>
            <Box sx={{
              flex: 1,
              borderRadius: '4px',
              p: `12px 16px`,
              backgroundColor: '#F5F6F7',
              "@media screen and (max-width: 600px)": {
                mt: 2,
              },
            }}>
              <Typo
                lines={100}
                sx={{
                  fontSize: 13,
                  color: '#515867'
                }}>
                {item.case_summary}
              </Typo>
            </Box>
          </Box>
        </Box>
        <Box sx={{
          width: '100%',
          p: 3,
        }}>
          <Typo sx={{
            fontSize: `15px`,
            fontWeight: '700',
            mb: 2,
          }}>
            상세정보
          </Typo>
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: "1fr 1fr",
            gap: 2,
            "@media screen and (max-width: 600px)": {
              gridTemplateColumns: "1fr",
            }
          }}>
            {entries.map(([key, label]) =>
              <InfoRow
                key={key}
                label={label}
                value={displayValue(formData[key])}
              />
            )}
          </Box>
        </Box>
      </Box>
    </Dialog>
  );
}
