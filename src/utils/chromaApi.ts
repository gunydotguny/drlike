// utils/chromaApi.ts
import axios from "axios";

const HOST = process.env.NEXT_PUBLIC_CHROMA_HOST!; // ex) "https://chroma-production-889a.up.railway.app"
const V1 = `${HOST}/api/v1`;

export interface CollectionInfo {
  id: string;
  name: string;
  metadata?: Record<string, any>;
}

// 1) 컬렉션 목록 조회
export async function listCollections(): Promise<CollectionInfo[]> {
  const { data } = await axios.get<CollectionInfo[]>(`${V1}/collections`);
  return data;
}

// 2) 새 컬렉션 생성
export async function createCollection(
  name: string,
  metadata?: Record<string, any>
): Promise<CollectionInfo> {
  const { data } = await axios.post<CollectionInfo>(
    `${V1}/collections`,
    { name, metadata },
    { headers: { "Content-Type": "application/json" } }
  );
  return data;
}

// 3) 문서+임베딩 upsert
export async function upsertDocuments(
  collectionId: string,
  ids: string[],
  documents: string[],
  embeddings: number[][],
  metadatas: Record<string, any>[]
): Promise<void> {
  await axios.post(
    `${V1}/collections/${encodeURIComponent(collectionId)}/upsert`,
    { ids, documents, embeddings, metadatas },
    { headers: { "Content-Type": "application/json" } }
  );
}
