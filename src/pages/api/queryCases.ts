// ✅ /pages/api/queryCases.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getEmbedding } from '../../lib/getEmbeddings';
import { getCollection } from '../../utils/chromaClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const formData = req.body;
    const embedding = await getEmbedding(formData);

    const collection = await getCollection('drlike-case-collection');
    const result = await collection.query({
      queryEmbeddings: [embedding],
      nResults: 5,
    });

    const retrievedCases = result.metadatas?.[0] || [];
    res.status(200).json({ retrievedCases });
  } catch (error) {
    console.error('❌ API Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}