import { getPineconeIndex } from './pinecone';
import { embedOne } from './embeddings';

export type RagSource = {
  id: string;
  page: number;
  content: string;
  score: number;
};

export async function searchSimilar(
  query: string,
  k = 6
): Promise<RagSource[]> {
  const queryEmbedding = await embedOne(query);
  const pineconeIndex = getPineconeIndex();

  const results = await pineconeIndex.query({
    vector: queryEmbedding,
    topK: k,
    includeMetadata: true
  });

  return results.matches.map((match) => ({
    id: match.id,
    page: (match.metadata?.page as number) || 0,
    content: (match.metadata?.content as string) || '',
    score: match.score || 0
  }));
}

export function buildContext(sources: RagSource[]) {
  return sources
    .map(
      (s, i) =>
        `[#${i + 1}] page ${s.page} — id=${s.id}\n${s.content}`
    )
    .join('\n\n---\n\n');
}
