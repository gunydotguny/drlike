import { CaseType, options } from "../options";

// ✅ 항목의 label 가져오기 유틸
const getLabel = (field: keyof typeof options, values: string[] = []): string => {
  const map = options[field];
  return values
    .map((val) => map.find((opt) => opt.value === val)?.label)
    .filter(Boolean)
    .join(", ");
};

export const summarizeCase = (data: CaseType): string => {
  const sexLabel = data.sex === "남" ? "남아" : data.sex === "여" ? "여아" : "소아";

  const summary: string[] = [];

  summary.push(`${data.age}세 ${sexLabel} 환자`);

  if (data.symptoms?.length) {
    summary.push(`기초 증상은 ${getLabel("symptoms", data.symptoms)}`);
  }

  if (data.physical_exam?.length) {
    summary.push(`신체 진찰 소견은 ${getLabel("physical_exam", data.physical_exam)}`);
  }

  if (data.clinical_observation?.length) {
    summary.push(`임상 관찰은 ${getLabel("clinical_observation", data.clinical_observation)}`);
  }

  if (data.diagnosis?.length) {
    summary.push(`진단명은 ${getLabel("diagnosis", data.diagnosis)}`);
  }

  if (data.confirmed_pathogen?.length) {
    summary.push(`확인된 병원체는 ${getLabel("confirmed_pathogen", data.confirmed_pathogen)}`);
  }

  if (data.antibiotics_administered?.length) {
    summary.push(`투여된 항생제는 ${getLabel("antibiotics_administered", data.antibiotics_administered)}`);
  }

  if (data.oxygen_therapy?.length) {
    summary.push(`산소 치료는 ${getLabel("oxygen_therapy", data.oxygen_therapy)}`);
  }

  if (data.hospital_stay_duration?.start && data.hospital_stay_duration?.end) {
    summary.push(`입원 기간은 ${data.hospital_stay_duration.start}부터 ${data.hospital_stay_duration.end}까지`);
  }

  if (data.lab_test_summary) {
    summary.push(`검사 결과: ${data.lab_test_summary}`);
  }

  if (data.imaging_findings) {
    summary.push(`영상 소견: ${data.imaging_findings}`);
  }

  if (data.case_summary) {
    summary.push(`임상요약: ${data.case_summary}`);
  }

  return summary.join(". ") + ".";
};
