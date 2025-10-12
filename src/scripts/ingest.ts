import fs from 'node:fs/promises';
import path from 'node:path';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
import { embedTexts } from '../lib/embeddings';
import { chunkPageText } from '../lib/chunk';
import { sql } from '@vercel/postgres';

const PDF_WORKER = require.resolve('pdfjs-dist/build/pdf.worker.js');
GlobalWorkerOptions.workerSrc = PDF_WORKER;

const THESIS_PATH =
  process.env.THESIS_FILE_PATH || path.join(process.cwd(), 'public', 'thesis.pdf');

/** Extract text per page using pdfjs-dist */
async function extractPages(filePath: string): Promise<string[]> {
  const data = await fs.readFile(filePath);
  const loadingTask = getDocument({ data });
  const pdf = await loadingTask.promise;

  const pages: string[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const text = content.items
      .map((it) => ('str' in it ? (it.str as string) : ''))
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
    pages.push(text);
  }
  return pages;
}

async function main() {
  console.log('🔎 Reading PDF:', THESIS_PATH);
  const pages = await extractPages(THESIS_PATH);

  console.log('✂️  Chunking...');
  const chunks: { id: string; page: number; content: string }[] = [];
  pages.forEach((t, i) => {
    const page = i + 1;
    const c = chunkPageText(t, page);
    chunks.push(...c);
  });

  console.log(`🧠 Embedding ${chunks.length} chunks...`);
  const embeddings = await embedTexts(chunks.map((c) => c.content));

  console.log('🗄️  Upserting into Postgres...');
  for (let i = 0; i < chunks.length; i++) {
    const c = chunks[i];
    const e = embeddings[i];
    const vec = `[${e.join(',')}]`;
    await sql`
      INSERT INTO rag_chunks (id, page, content, tokens, embedding, metadata)
      VALUES (${c.id}, ${c.page}, ${c.content}, ${c.content.length}, ${vec}::vector, ${JSON.stringify({
        source: 'thesis.pdf'
      })})
      ON CONFLICT (id) DO NOTHING;
    `;
  }

  console.log('✅ Ingestion complete');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
