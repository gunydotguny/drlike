import type { NextApiRequest, NextApiResponse } from "next";
import { getUserEmbedding } from "../../../lib/getUserEmbedding";

const CHROMA_HOST = process.env.CHROMA_HOST!;
const COLLECTION_NAME = "pediatric_cases_structured_test";

type RetrievedCase = {
    case_id: string;
    document: string;
    metadata: Record<string, any>;
    distance: number | null;
    score?: number;
};

// ✅ 우선도 가중치
const presetWeights = {
    "first_visit": {
        "patient_info_age_months": 13.8,
        "patient_info_sex": 3,
        "patient_info_height_cm": 3.4,
        "patient_info_weight_kg": 3.6,
        "patient_info_nutrition_summary": 6.9,
        "patient_info_nursing_summary": 7.1,
        "medical_history_past_history_summary": 13.7,
        "medical_history_underlying_disease_summary": 13.7,
        "medical_history_symptoms_summary": 1,
        "medical_history_physical_exam_summary": 7.5,
        "medical_history_body_temperature": 9,
        "medical_history_respiratory_rate": 9,
        "medical_history_oxygen_saturation": 9,
        "test_results_wbc_result": 13,
        "test_results_crp_result": 13,
        "test_results_pct_result": 13,
        "test_results_cxr_summary": 9,
        "test_results_ct_summary": 9,
        "test_results_pathogen_summary": 16,
        "treatment_progress_antibiotics_summary": 12.2,
        "treatment_progress_oxygen_therapy_summary": 11.2,
        "treatment_progress_admission_summary": 6,
        "treatment_progress_icu_summary": 6,
        "diagnosis_diagnosis": 13.7
    },
    "inpatient_care": {
        "patient_info_age_months": 15,
        "patient_info_sex": 3,
        "patient_info_height_cm": 4,
        "patient_info_weight_kg": 4,
        "patient_info_nutrition_summary": 6.9,
        "patient_info_nursing_summary": 7.3,
        "medical_history_past_history_summary": 13.4,
        "medical_history_underlying_disease_summary": 13.4,
        "medical_history_symptoms_summary": 1,
        "medical_history_physical_exam_summary": 7.5,
        "medical_history_body_temperature": 9,
        "medical_history_respiratory_rate": 9,
        "medical_history_oxygen_saturation": 9,
        "test_results_wbc_result": 13,
        "test_results_crp_result": 13,
        "test_results_pct_result": 13,
        "test_results_cxr_summary": 9,
        "test_results_ct_summary": 9,
        "test_results_pathogen_summary": 16,
        "treatment_progress_antibiotics_summary": 13.3,
        "treatment_progress_oxygen_therapy_summary": 10,
        "treatment_progress_admission_summary": 6,
        "treatment_progress_icu_summary": 7.2,
        "diagnosis_diagnosis": 13.7
    }
};

// ✅ 점수 계산 함수
const computeCaseScore = (input: any, caseMetadata: any, weights: any) => {
    let score = 0;
    for (const key in weights) {
        const weight = weights[key];
        const inputValue = input[key];
        const caseValue = caseMetadata[key];

        if (inputValue != null && caseValue != null) {
            let fieldScore = 0;
            if (typeof inputValue === "number" && typeof caseValue === "number") {
                fieldScore = Math.max(0, 1 - Math.abs(inputValue - caseValue) / 36);
            } else {
                fieldScore = inputValue === caseValue ? 1 : 0;
            }
            score += fieldScore * weight;
        }
    }
    return score;
};

// ✅ API Handler
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method Not Allowed" });
    }

    try {
        const { formData, presetPriority, promptType, careEnvironment } = req.body;

        const result = await getUserEmbedding(formData, presetPriority);
        if (!result) {
            return res.status(400).json({ error: "User embedding failed" });
        }
        const embedding = result.embedding;

        if (!embedding || embedding.length !== 4096) {
            return res.status(400).json({ error: "Invalid embedding result" });
        }

        const listRes = await fetch(`${CHROMA_HOST}/api/v1/collections`);
        const data = await listRes.json();
        const collections = Array.isArray(data) ? data : data.collections || [];

        const collection = collections.find((c: any) => c.name === COLLECTION_NAME);
        if (!collection) {
            return res.status(500).json({ error: "Collection not found" });
        }

        const collectionId = collection.id;
        const queryRes = await fetch(`${CHROMA_HOST}/api/v1/collections/${collectionId}/query`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                query_embeddings: [embedding],
                n_results: 30,  // Top 30 검색
                include: ["documents", "metadatas", "distances"],
            }),
        });

        if (!queryRes.ok) {
            const errorText = await queryRes.text();
            throw new Error(`Vector query failed with status ${queryRes.status}: ${errorText}`);
        }

        const queryData = await queryRes.json();
        const retrievedCases = (queryData.metadatas?.[0] || []).map((metadata: any, idx: number) => ({
            case_id: queryData.ids?.[0]?.[idx] || metadata.case_id,
            document: queryData.documents?.[0]?.[idx] || "",
            metadata,
            distance: queryData.distances?.[0]?.[idx] || null,
        }));

        const weights = presetWeights[careEnvironment as keyof typeof presetWeights];
        const scoredCases = retrievedCases.map((caseItem: RetrievedCase) => ({
            ...caseItem,
            score: computeCaseScore(formData, caseItem.metadata, weights)
        }));

        const topCases = scoredCases.sort((a: RetrievedCase & { score: number }, b: RetrievedCase & { score: number }) => b.score - a.score).slice(0, 5);

        return res.status(200).json({
            recommendationList: topCases,
            debug: {
                promptType,
                COLLECTION_NAME,
                retrieved: topCases.length,
            },
        });
    } catch (e: any) {
        return res.status(500).json({ error: "Internal Server Error", detail: e.message });
    }
}
