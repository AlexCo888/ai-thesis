import { config } from 'dotenv';
import path from 'node:path';
import { Pinecone } from '@pinecone-database/pinecone';

// Load .env.local
config({ path: path.join(process.cwd(), '.env.local') });

async function main() {
  const pc = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY!
  });

  const indexName = 'ai-thesis';

  // Check if index exists
  const indexes = await pc.listIndexes();
  const existingIndex = indexes.indexes?.find(i => i.name === indexName);

  if (existingIndex) {
    console.log(`⚠️  Index "${indexName}" already exists. Deleting...`);
    await pc.deleteIndex(indexName);
    // Wait a bit for deletion to complete
    await new Promise(resolve => setTimeout(resolve, 5000));
  }

  console.log(`🔨 Creating Pinecone index "${indexName}"...`);
  
  await pc.createIndex({
    name: indexName,
    dimension: 3072, // gemini-embedding-001 dimensions
    metric: 'cosine',
    spec: {
      serverless: {
        cloud: 'aws',
        region: 'us-east-1'
      }
    }
  });

  // Wait for index to be ready
  console.log('⏳ Waiting for index to be ready...');
  await new Promise(resolve => setTimeout(resolve, 10000));

  console.log('✅ Pinecone migration complete');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
