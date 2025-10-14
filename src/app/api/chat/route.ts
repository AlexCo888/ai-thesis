import { streamText, convertToModelMessages, type UIMessage } from 'ai';
import { google } from '@ai-sdk/google';
import { buildContext, searchSimilar } from '@/lib/rag';

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
  const { messages }: { messages: UIMessage[] } = await req.json();

  // Get locale from URL params
  const url = new URL(req.url);
  const locale = url.searchParams.get('locale') || 'en';

  // Check for flashcard context in headers
  const flashcardContextHeader = req.headers.get('x-flashcard-context');
  let flashcardContext: { question: string; answer: string; page: number } | null = null;
  
  if (flashcardContextHeader) {
    try {
      flashcardContext = JSON.parse(decodeURIComponent(flashcardContextHeader));
    } catch {
      // Ignore parse errors
    }
  }

  // Pull the latest user message for retrieval
  const last = [...messages].reverse().find((m) => m.role === 'user');
  const userText =
    last?.parts
      ?.map((p) => (p.type === 'text' ? p.text : ''))
      .join(' ')
      .trim() ?? '';

  const sources = userText ? await searchSimilar(userText, 6) : [];
  const context = buildContext(sources);

  // Build system prompt with locale instruction and optional flashcard context
  const localeInstruction = locale !== 'en' && localeInstructions[locale] 
    ? `\n\nIMPORTANT: ${localeInstructions[locale]}`
    : '';

  let systemPrompt = `
You are a precise thesis assistant using a RAG knowledge base.
Use ONLY the provided CONTEXT to answer.
Cite using [#n] markers that correspond to the numbered sources below.${localeInstruction}

CONTEXT:
${context}

When relevant, reference specific page numbers. If you are unsure, say so.`;

  // Add flashcard context if available (only for first message)
  if (flashcardContext && messages.length === 1) {
    systemPrompt += `\n\nIMPORTANT CONTEXT: The user is studying a flashcard with:
- Question: "${flashcardContext.question}"
- Answer: "${flashcardContext.answer}"
- Source Page: ${flashcardContext.page}

Keep this context in mind when answering their questions, but do NOT repeat this context in your response. Answer their question directly and naturally.`;
  }

  const system = systemPrompt.trim();

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
