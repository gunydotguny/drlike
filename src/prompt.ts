import { presetWeights } from "./preset";

export const generatePrompt = (
  formData: any,
  retrievedCases: any[],
  presetValue: "first_visit" | "inpatient_care"
) => {
  const weights = presetWeights[presetValue];

  return `
당신은 소아 감염/호흡기/알레르기 질환에 특화된 의료 AI입니다.
입력된 환자 정보와 유사한 증례 목록을 기반으로 가장 유사한 3건을 **JSON 배열만** 출력하세요.

⚠️ 반드시 다음을 지키세요:
- 출력은 반드시 **순수 JSON 배열** (예: [ {...}, {...} ])이어야 합니다.
- 절대로 객체로 감싸지 마세요 (예: { "cases": [...] } ❌)
- 설명, 마크다운 (\`\`\`) 없이 배열만 출력하세요.
- 아래의 각 필드를 모두 포함하세요. (case_summary는 필수)

--- 프리셋 ---
"${presetValue}"

--- 가중치 기준 ---
${JSON.stringify(weights, null, 2)}

--- 입력 환자 정보 ---
${JSON.stringify(formData, null, 2)}

--- 유사 증례 목록 (최대 5건) ---
${JSON.stringify(retrievedCases, null, 2)}

--- 출력 형식 예시 ---
[
  {
    "case_id": "001",
    "age": 5,
    "sex": "여",
    "height_cm": 105,
    "weight_kg": 19,
    "nutritional_status": ["정상"],
    "nursing_requirements": ["침상생활"],
    "past_history": ["천식"],
    "symptoms": ["기침", "고열"],
    "physical_exam": ["호흡음 감소"],
    "clinical_observation": ["체온 38.5도"],
    "lab_test_summary": "WBC 15000, CRP 6.5",
    "imaging_findings": "CXR: RLL infiltration",
    "confirmed_pathogen": ["RSV"],
    "antibiotics_administered": ["Cefotaxime"],
    "oxygen_therapy": ["HFNC"],
    "hospital_stay_duration": {
      "start": "2024-01-01",
      "end": "2024-01-07"
    },
    "icu_admission": false,
    "diagnosis": ["폐렴"],
    "case_summary": "5세 여아로, 고열과 기침 증상을 보이며 호흡음 감소 소견이 관찰됨. 체온은 38.5도이며, WBC 15000 및 CRP 6.5로 염증 수치가 상승함. 흉부 엑스레이에서 우하엽 폐렴 소견이 확인되어 Cefotaxime 항생제를 투여 중이며 HFNC를 이용한 산소 치료를 받고 있음. 과거력상 천식을 앓은 병력이 있음.",
    "timestamp": "2024-08-01"
  }
]

위와 같이 출력하세요. 설명 없이 배열만 반환해야 합니다.
`;
};
