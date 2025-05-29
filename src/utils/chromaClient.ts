// import { ChromaClient } from "chromadb";

// export const chromaClient = new ChromaClient({
//   url: process.env.NEXT_PUBLIC_CHROMA_HOST + "/api/v1",   // ← path → url, v2 경로 포함
// });

// export const getCollection = async (name: string) => {
//   // dimension, metadata 옵션은 첫 생성 시에만 적용됩니다
//   return await chromaClient.getOrCreateCollection({
//     name,
//     metadata: { "hnsw:space": "cosine" },
//     dimension: 1024,
//   });
// };

//chromaClient.ts
import { ChromaClient } from "chromadb";

export const chromaClient = new ChromaClient({
  path: `${process.env.NEXT_PUBLIC_CHROMA_HOST}`,
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