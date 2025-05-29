export interface InputDataType {
  patient_name: string;
  age: number;
  sex: '남' | '여' | null;
  height_cm: number;
  weight_kg: number;
  nutritional_status: string[];          // ex: ["정상", "영양부족"]
  nursing_requirements: string[];        // ex: ["침상생활", "I-tube"]
  past_history: string[];                // ex: ["선천심장병"]
  symptoms: string[];                    // ex: ["기침", "고열"]
  physical_exam: string[];               // ex: ["청색증"]
  clinical_observation: string[];        // ex: ["체온 39도"]
  lab_test_summary: string;              // 자유 텍스트
  imaging_findings: string;              // 자유 텍스트
  confirmed_pathogen: string[];          // ex: ["HMPV"]
  antibiotics_administered: string[];    // ex: ["Vancomycin", "Cefotaxime"]
  oxygen_therapy: string[];              // ex: ["HFNC", "NC"]
  hospital_stay_duration: { start: string; end: string };  // ISO date string
  icu_admission: boolean
  diagnosis: string[];                   // ex: ["폐렴"]
}

export interface OutputDataType {
  case_id: string;
  age: number;
  sex: '남' | '여' | null;
  height_cm: number;
  weight_kg: number;
  nutritional_status: string[];          // ex: ["정상", "영양부족"]
  nursing_requirements: string[];        // ex: ["침상생활", "I-tube"]
  past_history: string[];                // ex: ["선천심장병"]
  symptoms: string[];                    // ex: ["기침", "고열"]
  physical_exam: string[];               // ex: ["청색증"]
  clinical_observation: string[];        // ex: ["체온 39도"]
  lab_test_summary: string;              // 자유 텍스트
  imaging_findings: string;              // 자유 텍스트
  confirmed_pathogen: string[];          // ex: ["HMPV"]
  antibiotics_administered: string[];    // ex: ["Vancomycin", "Cefotaxime"]
  oxygen_therapy: string[];              // ex: ["HFNC", "NC"]
  hospital_stay_duration: { start: string; end: string };  // ISO date string
  icu_admission: boolean
  diagnosis: string[];                   // ex: ["폐렴"]
  case_summary: string;
  timestamp: string;                     // ISO date string
}