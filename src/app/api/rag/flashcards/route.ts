import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import { searchSimilar } from '@/lib/rag';

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
  const { topic, n = 10 } = await req.json();
  
  // Get locale from URL params
  const url = new URL(req.url);
  const locale = url.searchParams.get('locale') || 'en';
  
  const sources = await searchSimilar(topic || 'key concepts', 12);

  const localeInstruction = locale !== 'en' && localeInstructions[locale] 
    ? `\n${localeInstructions[locale]} Generate the questions and answers in ${locale} language.`
    : '';

  const prompt = `
Build ${n} concise flashcards (JSON array) from the provided RAG sources.${localeInstruction}
Each item: { "q": string, "a": string, "page": number, "source": "id" }.
Focus on definitions, formulas, key results, limitations. Pages MUST be correct.
SOURCES:
${sources
  .map((s, i) => `[#${i + 1}] page ${s.page}, id=${s.id}\n${s.content}`)
  .join('\n\n---\n\n')}
  `.trim();

  const { text } = await generateText({
    model: google(process.env.GENERATION_MODEL || 'gemini-2.5-flash-preview-09-2025'),
    prompt,
    temperature: 0.3
  });

  // attempt to parse JSON; fallback to empty
  interface Flashcard {
    q: string;
    a: string;
    page: number;
    source: string;
  }

  let cards: Flashcard[] = [];
  let parseError: string | undefined;
  
  try {
    // Try to extract JSON from markdown code blocks if present
    let jsonText = text.trim();
    
    // Remove markdown code block markers if present
    const codeBlockMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (codeBlockMatch) {
      jsonText = codeBlockMatch[1].trim();
    }
    
    const arr = JSON.parse(jsonText);
    if (Array.isArray(arr)) {
      cards = arr.slice(0, n);
    } else {
      parseError = 'Response is not an array';
    }
  } catch (err) {
    parseError = err instanceof Error ? err.message : 'JSON parse failed';
    console.error('Flashcard parse error:', parseError);
    console.error('Raw text:', text);
  }
  
  return Response.json({ 
    cards, 
    used: sources.map((s, i) => ({ n: i + 1, id: s.id, page: s.page })),
    ...(parseError && { error: parseError, rawResponse: text.substring(0, 500) })
  });
}
