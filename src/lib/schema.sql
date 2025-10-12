-- Enable pgvector
CREATE EXTENSION IF NOT EXISTS vector;

-- Chunks table
CREATE TABLE IF NOT EXISTS rag_chunks (
  id TEXT PRIMARY KEY,
  page INTEGER NOT NULL,
  content TEXT NOT NULL,
  tokens INTEGER NOT NULL DEFAULT 0,
  embedding VECTOR(1536) NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'
);

-- HNSW index for fast cosine search
CREATE INDEX IF NOT EXISTS rag_chunks_embedding_hnsw
ON rag_chunks USING hnsw (embedding vector_cosine_ops);
