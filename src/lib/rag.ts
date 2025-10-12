import { sql } from './db';
import { embedOne } from './embeddings';

export type RagSource = {
  id: string;
  page: number;
  content: string;
  score: number; // similarity converted from distance
};

function toVectorLiteral(vec: number[]) {
  // pgvector expects '[v1,v2,...]'
  return `[${vec.join(',')}]`;
}

export async function searchSimilar(
  query: string,
  k = 6
): Promise<RagSource[]> {
  const q = await embedOne(query);
  const vec = toVectorLiteral(q);

  // cosine distance (<=>) lower is better; convert to similarity 1 - distance
  const { rows } = await sql<RagSource>`
    SELECT id, page, content,
           1 - (embedding <=> ${vec}::vector) AS score
    FROM rag_chunks
    ORDER BY embedding <=> ${vec}::vector
    LIMIT ${k};
  `;

  // Normalize score into [0,1] clamp
  return rows.map((r) => ({
    ...r,
    score: Math.max(0, Math.min(1, Number(r.score)))
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
