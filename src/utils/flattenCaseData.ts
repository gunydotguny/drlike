export const flattenCaseData = (caseData: any) => {
    return {
        case_id: caseData.case_id,
        age: caseData.age,
        sex: caseData.sex,
        height_cm: caseData.height_cm,
        weight_kg: caseData.weight_kg,
        nutritional_status: (caseData.nutritional_status || []).join(", "),
        nursing_requirements: (caseData.nursing_requirements || []).join(", "),
        past_history: (caseData.past_history || []).join(", "),
        symptoms: (caseData.symptoms || []).join(", "),
        physical_exam: (caseData.physical_exam || []).join(", "),
        clinical_observation: (caseData.clinical_observation || []).join(", "),
        lab_test_summary: caseData.lab_test_summary,
        imaging_findings: caseData.imaging_findings,
        confirmed_pathogen: (caseData.confirmed_pathogen || []).join(", "),
        antibiotics_administered: (caseData.antibiotics_administered || []).join(", "),
        oxygen_therapy: (caseData.oxygen_therapy || []).join(", "),
        icu_admission: caseData.icu_admission,
        diagnosis: (caseData.diagnosis || []).join(", "),
        timestamp: caseData.timestamp,
        // 병원 입원 기간은 문자열로 변환
        hospital_stay_duration: caseData.hospital_stay_duration
            ? `${caseData.hospital_stay_duration.start} ~ ${caseData.hospital_stay_duration.end}`
            : ""
    };
};
