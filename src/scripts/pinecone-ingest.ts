import { config } from 'dotenv';
import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { embedTexts } from '../lib/embeddings';
import { chunkPageText } from '../lib/chunk';
import { getPineconeIndex } from '../lib/pinecone';

// Load .env.local
config({ path: path.join(process.cwd(), '.env.local') });

const PDF_WORKER = require.resolve('pdfjs-dist/legacy/build/pdf.worker.mjs');
GlobalWorkerOptions.workerSrc = pathToFileURL(PDF_WORKER).href;

const THESIS_PATH =
  process.env.THESIS_FILE_PATH || path.join(process.cwd(), 'public', 'thesis.pdf');

/** Extract text per page using pdfjs-dist */
async function extractPages(filePath: string): Promise<string[]> {
  const buffer = await fs.readFile(filePath);
  const data = new Uint8Array(buffer);
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

  console.log('🗄️  Upserting into Pinecone...');
  
  const pineconeIndex = getPineconeIndex();
  
  // Pinecone upsert in batches of 100
  const BATCH_SIZE = 100;
  for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
    const batch = chunks.slice(i, i + BATCH_SIZE);
    const vectors = batch.map((chunk, idx) => ({
      id: chunk.id,
      values: embeddings[i + idx],
      metadata: {
        page: chunk.page,
        content: chunk.content,
        tokens: chunk.content.length
      }
    }));

    await pineconeIndex.upsert(vectors);
    console.log(`  Upserted batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(chunks.length / BATCH_SIZE)}`);
  }

  console.log('✅ Ingestion complete');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
