import { google } from '@ai-sdk/google';
import { streamText } from 'ai';
import { sql } from '@/lib/db';
import { searchSimilar } from '@/lib/rag';

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
  const { fromPage, toPage, customPrompt } = await req.json();
  
  // Get locale from URL params
  const url = new URL(req.url);
  const locale = url.searchParams.get('locale') || 'en';
  
  const fp = Math.max(1, Number(fromPage));
  const tp = Math.max(fp, Number(toPage ?? fp));

  // Check if custom prompt mentions specific sections (methodology, results, conclusions, etc.)
  // If so, use semantic search instead of page range
  const useSementicSearch = customPrompt && (
    /methodology|methods|método|metodología|méthodologie|methodik|metodologia/i.test(customPrompt) ||
    /results|findings|resultados|résultats|ergebnisse/i.test(customPrompt) ||
    /conclusions|discussion|conclusiones|conclusión|diskussion/i.test(customPrompt) ||
    /introduction|background|introducción|einführung/i.test(customPrompt) ||
    /chapter \d+|capítulo \d+|chapitre \d+|kapitel \d+/i.test(customPrompt)
  );

  let context = '';

  if (useSementicSearch) {
    // Use semantic search to find relevant sections
    const sources = await searchSimilar(customPrompt, 20); // Get more chunks for comprehensive coverage
    context = sources
      .map((s) => `Page ${s.page}\n${s.content}`)
      .join('\n\n---\n\n');
  } else {
    // Use page range as before
    const { rows } = await sql`
      SELECT content, page FROM rag_chunks
      WHERE page BETWEEN ${fp} AND ${tp}
      ORDER BY page ASC, tokens DESC
      LIMIT 800;
    `;
    context = rows
      .map((r) => `Page ${r.page}\n${r.content}`)
      .join('\n\n---\n\n');
  }

  const localeInstruction = locale !== 'en' && localeInstructions[locale] 
    ? ` ${localeInstructions[locale]}`
    : '';

  // Build comprehensive system message based on custom prompt or default
  let systemMessage = '';
  
  if (customPrompt) {
    // Enhanced prompt for custom instructions
    const detailLevel = customPrompt.toLowerCase().includes('detailed') || customPrompt.toLowerCase().includes('detallado')
      ? 'IMPORTANT: Provide a comprehensive, in-depth analysis with multiple sections. Aim for at least 500-800 words. Include extensive details, explanations, and context.'
      : customPrompt.toLowerCase().includes('brief') || customPrompt.toLowerCase().includes('breve')
      ? 'IMPORTANT: Keep the summary concise and focused on the most critical points only.'
      : 'Provide a thorough analysis with good depth.';
    
    const searchMethod = useSementicSearch 
      ? '\n\nNOTE: Content has been retrieved using semantic search to find the most relevant sections across the entire thesis.'
      : `\n\nNOTE: Content is from pages ${fp}-${tp} of the thesis.`;
    
    systemMessage = `${customPrompt}

${detailLevel}${searchMethod}

**Primary Source**: Use the thesis content provided below as your main reference.
- Always include page citations in the format (p. X) when referencing thesis content
- Structure your response with clear headings and sections when appropriate

**Extended Capabilities**: If your prompt requests comparisons, external perspectives, or broader academic context:
- Supplement with relevant academic knowledge or literature
- Use google_search tool when current information or external sources are needed
- Clearly distinguish between thesis content (with page citations) and external knowledge

Guidelines:
- Use markdown formatting (headings, bullet points, bold text) for better readability
- For detailed summaries: cover methodology, findings, implications, and key concepts thoroughly
- For key points: use bullet lists with brief explanations
${localeInstruction}`;
  } else {
    // Default comprehensive summary
    systemMessage = `Summarize these pages of the thesis for a researcher.

**Primary Focus**: Summarize the thesis content provided below.
- Always include page citations like (p. X) when referencing thesis content

**Extended Capability**: You may supplement with broader academic context when relevant.
- Use google_search tool if additional context would enhance understanding
- Clearly distinguish thesis content from external knowledge

Guidelines:
- Include key findings, research methods, definitions, and important caveats
- Structure with clear sections using markdown headings (##, ###)
- Use bullet points for lists
- Provide sufficient detail and context for academic understanding
${localeInstruction}`;
  }

  const result = streamText({
    model: google(process.env.GENERATION_MODEL || 'gemini-2.5-flash-preview-09-2025'),
    system: systemMessage,
    prompt: context,
    tools: {
    google_search: google.tools.googleSearch({}),
  },
  });

  return result.toTextStreamResponse();
}
