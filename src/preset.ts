export const presets: {
    value: "first_visit" | "inpatient_care",
    label: string,
    desc: string
}[] = [
        {
            value: "first_visit",
            label: "첫 진료 환경", // 처음 환자를 진료하는 시점에서 증례 추천이 필요한 경우
            desc: "처음 환자를 진료하는 시점에서 증례 추천이 필요할 경우"
        },
        {
            value: "inpatient_care",
            label: "입원 치료 중", // 입원 경과 중 중례 추천이 필요한 경우
            desc: "입원 경과 중 증례 추천이 필요한 경우"
        }
    ];

export const presetWeights = {
    "first_visit": {
        "age": 13.8,
        "sex": 3,
        "height_cm": 3.4,
        "weight_kg": 3.6,
        "nutritional_status": 6.9,
        "nursing_requirements": 7.1,
        "past_history": 13.7,
        "symptoms": 1,
        "physical_exam": 7.5,
        "clinical_observation": 9,
        "lab_test_summary": 13,
        "imaging_findings": 9,
        "confirmed_pathogen": 16,
        "antibiotics_administered": 12.2,
        "oxygen_therapy": 11.2,
        "hospital_stay_duration": 6,
        "diagnosis": 13.7,
        "icu_admission": 6
    },
    "inpatient_care": {
        "age": 15,
        "sex": 3,
        "height_cm": 4,
        "weight_kg": 4,
        "nutritional_status": 6.9,
        "nursing_requirements": 7.3,
        "past_history": 13.4,
        "symptoms": 1,
        "physical_exam": 7.5,
        "clinical_observation": 9,
        "lab_test_summary": 13,
        "imaging_findings": 9,
        "confirmed_pathogen": 16,
        "antibiotics_administered": 13.3,
        "oxygen_therapy": 10,
        "hospital_stay_duration": 6,
        "diagnosis": 13.7,
        "icu_admission": 7.2
    }
};