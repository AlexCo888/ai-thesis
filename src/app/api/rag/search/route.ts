import { searchSimilar } from '@/lib/rag';

export async function POST(req: Request) {
  const { query, k = 8 } = await req.json();
  const results = await searchSimilar(String(query || ''), Number(k));
  return Response.json({
    results: results.map((r, i) => ({
      n: i + 1,
      id: r.id,
      page: r.page,
      score: r.score,
      snippet: r.content.slice(0, 280) + (r.content.length > 280 ? '…' : ''),
      href: `/thesis.pdf#page=${r.page}`
    }))
  });
}
