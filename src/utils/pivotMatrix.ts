import { FIXED_ORDER } from "./constants";

function normalize(str = "") {
    return str.replace(/\s+/g, "").trim();
}

export function buildMatrix(items: any[]) {
    const suppliers = FIXED_ORDER;
    const customers = FIXED_ORDER;

    // 9×9 틀 만들어두기
    const matrix: Record<string, Record<string, any>> = {};
    for (const s of suppliers) {
        matrix[s] = {};
        for (const c of customers) matrix[s][c] = [];
    }

    // 문자열 정규화해서 매칭
    for (const item of items) {
        const supplier = normalize(item.supplier);
        const customer = normalize(item.customer);
        const sKey = suppliers.find(x => normalize(x) === supplier);
        const cKey = customers.find(x => normalize(x) === customer);
        if (sKey && cKey)
            matrix[sKey][cKey].push({
                title: item.strategyName || item.title,
                avgScore: item.avgScore,
            });
    }

    return { suppliers, customers, matrix };
}
