export const options = {
    "diagnosis": [
        {
            "value": "pneumonia",
            "label": "폐렴"
        },
        {
            "value": "bronchiolitis",
            "label": "모세기관지염"
        },
        {
            "value": "laryngitis",
            "label": "후두염"
        }
    ],
    "nutritional_status": [
        {
            "value": "developmental_delay",
            "label": "발달 지연이 있음"
        },
        {
            "value": "small_frame",
            "label": "체구가 또래보다 작음"
        },
        {
            "value": "poor_appetite",
            "label": "최근 식이 수행 저하"
        }
    ],
    "nursing_requirements": [
        {
            "value": "bedridden",
            "label": "홀로 생활 불가"
        },
        {
            "value": "bed_care",
            "label": "침상 생활"
        },
        {
            "value": "t_tube",
            "label": "T-tube 삽입"
        },
        {
            "value": "mobility_assistance",
            "label": "이동 시 전적인 도움이 필요"
        }
    ],
    "past_history": [
        {
            "value": "congenital_heart",
            "label": "순환계통의 선천기형"
        },
        {
            "value": "respiratory_issues",
            "label": "호흡계통의 선천기형"
        },
        {
            "value": "gi_issues",
            "label": "소화계통의 기타 선천기형"
        },
        {
            "value": "neurologic",
            "label": "신경계통의 질환"
        },
        {
            "value": "renal_or_hypertension",
            "label": "신생물(고혈압, 혈액종양 등)"
        },
        {
            "value": "immunologic",
            "label": "혈액 및 조혈기관의 면역계 이상"
        },
        {
            "value": "respiratory_chronic",
            "label": "호흡계통의 질환"
        },
        {
            "value": "prematurity",
            "label": "출생시 미숙아 혹은 저체중"
        }
    ],
    "symptoms": [
        {
            "value": "cough",
            "label": "기침"
        },
        {
            "value": "sputum",
            "label": "가래(객담)"
        },
        {
            "value": "dyspnea",
            "label": "호흡곤란"
        },
        {
            "value": "fever",
            "label": "고열"
        },
        {
            "value": "chills",
            "label": "오한"
        },
        {
            "value": "fatigue",
            "label": "피로감"
        },
        {
            "value": "chest_pain",
            "label": "가슴통증"
        },
        {
            "value": "weakness",
            "label": "무기력감"
        },
        {
            "value": "sweating",
            "label": "발한"
        }
    ],
    "physical_exam": [
        {
            "value": "crackles",
            "label": "수포음"
        },
        {
            "value": "diminished_breath_sounds",
            "label": "호흡음 감소"
        },
        {
            "value": "wheezing",
            "label": "천명음"
        },
        {
            "value": "rhonchi",
            "label": "흉부 함몰"
        },
        {
            "value": "asymmetry",
            "label": "정부 림프절 비대"
        },
        {
            "value": "heart_issue",
            "label": "심음 이상"
        },
        {
            "value": "abdominal_distension",
            "label": "복부 팽만"
        }
    ],
    "clinical_observation": [
        {
            "value": "fever_obs",
            "label": "체온 (발열)"
        },
        {
            "value": "tachypnea",
            "label": "호흡수 증가"
        },
        {
            "value": "low_spo2",
            "label": "산소포화도 저하"
        },
        {
            "value": "altered_mental_status",
            "label": "의식 저하"
        },
        {
            "value": "vomiting",
            "label": "구토"
        },
        {
            "value": "diarrhea",
            "label": "설사"
        },
        {
            "value": "sweating_obs",
            "label": "발한"
        },
        {
            "value": "chest_pain_obs",
            "label": "가슴통증"
        },
        {
            "value": "fatigue_obs",
            "label": "무기력감"
        }
    ],
    confirmed_pathogen: [
        { value: "HMPV", label: "HMPV" },
        { value: "RSV", label: "RSV" },
        { value: "Adenovirus", label: "Adenovirus" },
        { value: "Influenza_A", label: "Influenza A virus" },
        { value: "Influenza_B", label: "Influenza B virus" },
        { value: "SARS_CoV_2", label: "SARS-CoV-2" },
        { value: "Streptococcus_pneumoniae", label: "Streptococcus pneumoniae" },
        { value: "Haemophilus_influenzae", label: "Haemophilus influenzae" },
        { value: "Mycoplasma_pneumoniae", label: "Mycoplasma pneumoniae" },
        { value: "Klebsiella_pneumoniae", label: "Klebsiella pneumoniae" },
        { value: "Pseudomonas_aeruginosa", label: "Pseudomonas aeruginosa" },
        { value: "Staphylococcus_aureus", label: "Staphylococcus aureus" }
    ],
    antibiotics_administered: [
        { value: "Amoxicillin", label: "Amoxicillin" },
        { value: "Ceftriaxone", label: "Ceftriaxone" },
        { value: "Azithromycin", label: "Azithromycin" },
        { value: "Vancomycin", label: "Vancomycin" },
        { value: "Piperacillin_tazobactam", label: "Piperacillin-tazobactam" },
        { value: "Meropenem", label: "Meropenem" },
        { value: "Levofloxacin", label: "Levofloxacin" },
        { value: "Clarithromycin", label: "Clarithromycin" },
        { value: "Cefotaxime", label: "Cefotaxime" }
    ],
    oxygen_therapy: [
        { value: "nasal_cannula", label: "비강 캐뉼라" },
        { value: "oxygen_mask", label: "산소 마스크" },
        { value: "high_flow_nc", label: "고유량 비강 캐뉼라" },
        { value: "mechanical_ventilation", label: "기계적 인공호흡기" }
    ]
};

export type CaseType = {
  case_id: string;
  age: number;
  sex: string;
  height_cm?: number;
  weight_kg?: number;
  nutritional_status?: string[];
  nursing_requirements?: string[];
  past_history?: string[];
  symptoms?: string[];
  physical_exam?: string[];
  clinical_observation?: string[];
  lab_test_summary?: string;
  imaging_findings?: string;
  confirmed_pathogen?: string[];
  antibiotics_administered?: string[];
  oxygen_therapy?: string[];
  hospital_stay_duration?: {
    start: string;
    end: string;
  };
  diagnosis?: string[];
  case_summary?: string;
  timestamp?: string;
};


export const getInitialFormData = (preset: 'first_visit' | 'inpatient_care') => ({
  patient_name: '',
  age: '',
  sex: '',
  height_cm: '',
  weight_kg: '',
  diagnosis: [],
  nutritional_status: [],
  nursing_requirements: [],
  past_history: [],
  symptoms: [],
  physical_exam: [],
  clinical_observation: [],
  lab_test_summary: '',
  imaging_findings: '',
  confirmed_pathogen: [],
  ...(preset === 'inpatient_care' && {
    antibiotics_administered: [],
    oxygen_therapy: [],
    hospital_stay_duration: {
      start: null,
      end: null
    },
    icu_admission: '',
  }),
});