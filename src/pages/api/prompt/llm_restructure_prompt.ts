// api/prompts/llmRestructurePrompt.ts

export async function llmRestructurePrompt(recommendationList: any[]): Promise<string> {
    const prompt = `
다음은 소아 호흡기 질환 관련 추천 증례 목록입니다.

각 증례는 JSON 객체 형식으로 주어져 있으며, 아래 요구사항을 반드시 충족하는 새로운 JSON 데이터를 생성하세요.

✅ 요구사항:
1. 각 증례에서 반드시 다음 필드를 추출하여 "fixed_fields"에 포함하세요:
   - "patient_name" (환아명)
   - "age_months" (나이, 개월)
   - "sex" (성별)
   - "diagnosis" (진단명)

2. 그 외 모든 정보는 "other_fields"에 항목명-값 쌍으로 정리하세요.
   항목명은 반드시 아래 제공된 영어 출력 항목명을 그대로 사용해야 합니다:
   - nutrition_summary, nursing_summary, past_history_summary, underlying_disease_summary,
     symptoms_summary, physical_exam_summary, body_temperature, respiratory_rate, oxygen_saturation,
     wbc_result, crp_result, pct_result, cxr_summary, ct_summary, pathogen_summary,
     medication_summary, antibiotics_summary, oxygen_therapy_summary, admission_summary, icu_summary

3. "summaries" 객체를 추가하여 아래 두 개의 요약문을 각각 생성하세요:
   - "short_summary" → 목록 화면용 짧은 요약문 (진단명, 나이, 성별, 주요 증상 중심으로 간결하게 작성)
   - "long_summary" → 상세 화면용 긴 요약문 (모든 주요 정보를 자연스러운 흐름으로 상세하게 작성)

✅ 출력 JSON 구조 (반드시 준수할 것):
\`\`\`json
{
  "fixed_fields": {
    "patient_name": "...",
    "age_months": "...",
    "sex": "...",
    "diagnosis": "..."
  },
  "other_fields": {
    "nutrition_summary": "...",
    "nursing_summary": "...",
    ...
  },
  "summaries": {
    "short_summary": "...",
    "long_summary": "..."
  }
}
\`\`\`

✅ 추천 증례 목록 (JSON):
\`\`\`json
${JSON.stringify(recommendationList, null, 2)}
\`\`\`
  `.trim();

    return prompt;
}
