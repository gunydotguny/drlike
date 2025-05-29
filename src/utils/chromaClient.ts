import { ChromaClient } from "chromadb";

export const chromaClient = new ChromaClient({
    path: "http://localhost:8000" // 로컬 Chroma 서버 주소
});

export const getCollection = async (name: string) => {
    return await chromaClient.getOrCreateCollection({
        name,
        metadata: {
            "hnsw:space": "cosine"
        },
        // @ts-expect-error - Chroma가 런타임에 지원하는 속성
        dimension: 1024
    });
};
