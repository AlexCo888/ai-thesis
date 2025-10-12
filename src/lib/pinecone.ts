import { Pinecone, Index } from '@pinecone-database/pinecone';

let pc: Pinecone | null = null;
let indexInstance: Index | null = null;

export function getPineconeIndex() {
  if (!indexInstance) {
    if (!pc) {
      pc = new Pinecone({
        apiKey: process.env.PINECONE_API_KEY!
      });
    }
    indexInstance = pc.index('ai-thesis');
  }
  return indexInstance;
}
