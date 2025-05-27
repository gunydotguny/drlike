import { PageTabPros } from "../components/molecules/PageTabs";

export const projectListTypes: PageTabPros[] = [
    {
        label: '참여 프로젝트',
        value: 'invited'
    },
    {
        label: '공개 프로젝트',
        value: 'shared'
    }
]

export const codeCategories = [
    {
        label: '진단',
        value: 'diagnosis',
        subCategories: [
            {
                label: 'local',
                value: 'local',
            },
            {
                label: 'KCD',
                value: 'kcd',
            },
            {
                label: 'SNOMED CT',
                value: 'snomed_ct',
            },
        ]
    },
    {
        label: '약품',
        value: 'medicine',
        subCategories: [
            {
                label: 'local',
                value: 'local',
            },
        ]
    },
    {
        label: '검사',
        value: 'test',
        subCategories: [
            {
                label: 'local',
                value: 'local',
            },
            {
                label: 'SNOMED CT',
                value: 'snomed_ct',
            },
        ]
    },
    {
        label: '수술/시술',
        value: 'surgery',
        subCategories: [
            {
                label: 'local',
                value: 'local',
            },
            {
                label: 'ICD9CM',
                value: 'icd9cm',
            },
            {
                label: 'SNOMED CT',
                value: 'snomed_ct',
            },
        ]
    },
    {
        label: '처방',
        value: 'prescription',
        subCategories: [
            {
                label: 'local',
                value: 'local',
            },
        ]
    },
    {
        label: '처방',
        value: 'rehabilitation',
        subCategories: [
            {
                label: 'local',
                value: 'local',
            },
        ]
    },
    {
        label: '간호기록',
        value: 'nursing_records',
        subCategories: [
            {
                label: 'local',
                value: 'local',
            },
        ]
    },
    {
        label: '진료기록',
        value: 'medical_records',
        subCategories: [
            {
                label: 'local',
                value: 'local',
            },
        ]
    },
    {
        label: '임상관찰 항목코드',
        value: 'clinical_observation',
        subCategories: [
            {
                label: 'local',
                value: 'local',
            },
        ]
    },
    {
        label: 'CC',
        value: 'cc',
        subCategories: [
            {
                label: 'local',
                value: 'local',
            },
        ]
    },
    {
        label: '방사선치료',
        value: 'radiation_therapy',
        subCategories: [
            {
                label: 'local',
                value: 'local',
            },
        ]
    }
]