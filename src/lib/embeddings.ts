import { embedMany, embed } from 'ai';
import { openai } from '@ai-sdk/openai';

const EMBEDDING_MODEL = process.env.EMBEDDING_MODEL ?? 'text-embedding-3-large';

export async function embedTexts(values: string[]) {
  const { embeddings } = await embedMany({
    model: openai.textEmbeddingModel(EMBEDDING_MODEL),
    values
  });
  return embeddings;
}

export async function embedOne(value: string) {
  const { embedding } = await embed({
    model: openai.textEmbeddingModel(EMBEDDING_MODEL),
    value
  });
  return embedding;
}
