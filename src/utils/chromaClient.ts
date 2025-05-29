import { ChromaClient } from "chromadb";

export const chromaClient = new ChromaClient({
  path: "https://chroma-fly.fly.dev", // 여기를 Fly.io 앱 주소로 바꾸세요!
});

export const getCollection = async (name: string) => {
  return await chromaClient.getOrCreateCollection({
    name,
    metadata: {
      "hnsw:space": "cosine"
    },
    // @ts-expect-error
    dimension: 1024
  });
};