export function detectCaseRecommendationIntent(message: string): boolean {
    const intentRegex = /증례|사례|비슷한 경우|추천|유사/;
    return intentRegex.test(message);
}