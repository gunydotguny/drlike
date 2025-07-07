export function generateUserOutputPrompt(
    formData: Record<string, any>,
    retrievedCases: Record<string, any>[],
    presetValue: string
): string {
    const header = `다음은 ${presetValue} 환경에서 입력된 사용자 증례와 유사한 증례 목록입니다. 아래 정보를 참고하여 의료진에게 추천할 증례를 요약, 설명하세요.`;

    const userInputSummary = `사용자 입력 정보:\n${JSON.stringify(formData, null, 2)}`;

    const casesSummary = retrievedCases
        .map((c, idx) => `유사 증례 ${idx + 1}:\n${JSON.stringify(c, null, 2)}`)
        .join("\n\n");

    return `${header}\n\n${userInputSummary}\n\n${casesSummary}`;
}
