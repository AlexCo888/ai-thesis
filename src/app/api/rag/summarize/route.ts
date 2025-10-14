import { google } from '@ai-sdk/google';
import { streamText } from 'ai';
import { sql } from '@/lib/db';

export const maxDuration = 30;

const localeInstructions: Record<string, string> = {
  es: 'Responde SIEMPRE en español.',
  pt: 'Responda SEMPRE em português.',
  fr: 'Répondez TOUJOURS en français.',
  de: 'Antworten Sie IMMER auf Deutsch.',
  it: 'Rispondi SEMPRE in italiano.',
  zh: '始终用中文回答。',
  ja: '常に日本語で回答してください。',
  ko: '항상 한국어로 답변하세요.',
  ar: 'أجب دائمًا باللغة العربية.',
  ru: 'Всегда отвечайте на русском языке.',
  hi: 'हमेशा हिंदी में जवाब दें।'
};

export async function POST(req: Request) {
  const { fromPage, toPage } = await req.json();
  
  // Get locale from URL params
  const url = new URL(req.url);
  const locale = url.searchParams.get('locale') || 'en';
  
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

  const localeInstruction = locale !== 'en' && localeInstructions[locale] 
    ? ` ${localeInstructions[locale]}`
    : '';

  const result = streamText({
    model: google(process.env.GENERATION_MODEL || 'gemini-2.5-flash-preview-09-2025'),
    system: `Summarize these pages of the thesis for a researcher. Include key findings, methods, definitions, and caveats. Use bullet points and keep citations like (p. X).${localeInstruction}`,
    prompt: context
  });

  return result.toTextStreamResponse();
}
