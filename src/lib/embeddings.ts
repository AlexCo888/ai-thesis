import { embed } from 'ai';
import { google } from '@ai-sdk/google';

const EMBEDDING_MODEL = process.env.EMBEDDING_MODEL ?? 'gemini-embedding-001';
const DELAY_MS = 2000; // 2 second delay for ingestion (safe for free tier)

// Helper to add delay between requests
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function embedTexts(values: string[]) {
  // Free tier: process one at a time with delays to respect rate limits
  const allEmbeddings: number[][] = [];
  const total = values.length;
  
  console.log(`  Starting embedding process (${total} items, ~${Math.ceil(total * DELAY_MS / 1000 / 60)} minutes)...`);
  
  for (let i = 0; i < total; i++) {
    if (i % 10 === 0) {
      console.log(`  Progress: ${i + 1}/${total}...`);
    }
    
    const { embedding } = await embed({
      model: google.textEmbedding(EMBEDDING_MODEL),
      value: values[i]
    });
    
    allEmbeddings.push(embedding);
    
    // Add delay between requests (except for the last one)
    if (i < total - 1) {
      await delay(DELAY_MS);
    }
  }
  
  console.log(`  ✅ Completed all ${total} embeddings!`);
  return allEmbeddings;
}

export async function embedOne(value: string) {
  const { embedding } = await embed({
    model: google.textEmbedding(EMBEDDING_MODEL),
    value
  });
  return embedding;
}
