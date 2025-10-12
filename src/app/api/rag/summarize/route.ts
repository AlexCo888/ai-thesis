import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { sql } from '@/lib/db';

export const maxDuration = 30;

export async function POST(req: Request) {
  const { fromPage, toPage } = await req.json();
  const fp = Math.max(1, Number(fromPage));
  const tp = Math.max(fp, Number(toPage ?? fp));

  const { rows } = await sql`
    SELECT content, page FROM rag_chunks
    WHERE page BETWEEN ${fp} AND ${tp}
    ORDER BY page ASC, tokens DESC
    LIMIT 100;
  `;
  const context = rows
    .map((r) => `Page ${r.page}\n${r.content}`)
    .join('\n\n---\n\n');

  const result = streamText({
    model: openai(process.env.GENERATION_MODEL || 'gpt-5-mini'),
    system: `Summarize these pages of the thesis for a researcher. Include key findings, methods, definitions, and caveats. Use bullet points and keep citations like (p. X).`,
    prompt: context
  });

  return result.toTextStreamResponse();
}
