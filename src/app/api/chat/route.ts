import { streamText, convertToModelMessages, type UIMessage } from 'ai';
import { google } from '@ai-sdk/google';
import { buildContext, searchSimilar } from '@/lib/rag';

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  // Pull the latest user message for retrieval
  const last = [...messages].reverse().find((m) => m.role === 'user');
  const userText =
    last?.parts
      ?.map((p) => (p.type === 'text' ? p.text : ''))
      .join(' ')
      .trim() ?? '';

  const sources = userText ? await searchSimilar(userText, 6) : [];
  const context = buildContext(sources);

  const system = `
You are a precise thesis assistant using a RAG knowledge base.
Use ONLY the provided CONTEXT to answer.
Cite using [#n] markers that correspond to the numbered sources below.

CONTEXT:
${context}

When relevant, reference specific page numbers. If you are unsure, say so.
  `.trim();

  const result = streamText({
    model: google(process.env.GENERATION_MODEL || 'gemini-2.5-flash-preview-09-2025'),
    system,
    // we keep the full chat so the assistant maintains continuity
    messages: convertToModelMessages(messages)
  });

  // Return a UI stream for useChat (AI Elements example expects this)
  return result.toUIMessageStreamResponse({
    // include sources in headers so client can fetch them easily
    headers: {
      'x-rag-sources': encodeURIComponent(
        JSON.stringify(
          sources.map((s, i) => ({
            n: i + 1,
            id: s.id,
            page: s.page,
            score: s.score,
            href: `/thesis.pdf#page=${s.page}`
          }))
        )
      )
    }
  });
}
