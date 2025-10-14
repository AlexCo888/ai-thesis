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
  const { fromPage, toPage, customPrompt } = await req.json();
  
  // Get locale from URL params
  const url = new URL(req.url);
  const locale = url.searchParams.get('locale') || 'en';
  
  const fp = Math.max(1, Number(fromPage));
  const tp = Math.max(fp, Number(toPage ?? fp));

  const { rows } = await sql`
    SELECT content, page FROM rag_chunks
    WHERE page BETWEEN ${fp} AND ${tp}
    ORDER BY page ASC, tokens DESC
    LIMIT 800;
  `;
  const context = rows
    .map((r) => `Page ${r.page}\n${r.content}`)
    .join('\n\n---\n\n');

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
    
    systemMessage = `${customPrompt}

${detailLevel}

Guidelines:
- Use the thesis content provided below to generate your response
- Always include page citations in the format (p. X)
- Structure your response with clear headings and sections when appropriate
- Use markdown formatting (headings, bullet points, bold text) for better readability
- For detailed summaries: cover methodology, findings, implications, and key concepts thoroughly
- For key points: use bullet lists with brief explanations
${localeInstruction}`;
  } else {
    // Default comprehensive summary
    systemMessage = `Summarize these pages of the thesis for a researcher.

Guidelines:
- Include key findings, research methods, definitions, and important caveats
- Structure with clear sections using markdown headings (##, ###)
- Use bullet points for lists
- Always include page citations like (p. X)
- Provide sufficient detail and context for academic understanding
${localeInstruction}`;
  }

  const result = streamText({
    model: google(process.env.GENERATION_MODEL || 'gemini-2.5-flash-preview-09-2025'),
    system: systemMessage,
    prompt: context
  });

  return result.toTextStreamResponse();
}
