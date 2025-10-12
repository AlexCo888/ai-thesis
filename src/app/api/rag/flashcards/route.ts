import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';
import { searchSimilar } from '@/lib/rag';

export async function POST(req: Request) {
  const { topic, n = 10 } = await req.json();
  const sources = await searchSimilar(topic || 'key concepts', 12);

  const prompt = `
Build ${n} concise flashcards (JSON array) from the provided RAG sources.
Each item: { "q": string, "a": string, "page": number, "source": "id" }.
Focus on definitions, formulas, key results, limitations. Pages MUST be correct.
SOURCES:
${sources
  .map((s, i) => `[#${i + 1}] page ${s.page}, id=${s.id}\n${s.content}`)
  .join('\n\n---\n\n')}
  `.trim();

  const { text } = await generateText({
    model: openai(process.env.GENERATION_MODEL || 'gpt-4o-mini'),
    prompt
  });

  // attempt to parse JSON; fallback to empty
  interface Flashcard {
    q: string;
    a: string;
    page: number;
    source: string;
  }

  let cards: Flashcard[] = [];
  try {
    const arr = JSON.parse(text);
    if (Array.isArray(arr)) cards = arr.slice(0, n);
  } catch {
    // Ignore parse errors
  }
  return Response.json({ cards, used: sources.map((s, i) => ({ n: i + 1, id: s.id, page: s.page })) });
}
