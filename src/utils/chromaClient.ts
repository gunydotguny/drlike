import { ChromaClient } from "chromadb";

export const chromaClient = new ChromaClient({
  path: "https://chroma-production-889a.up.railway.app", 
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