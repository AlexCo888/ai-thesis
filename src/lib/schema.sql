-- Enable pgvector
CREATE EXTENSION IF NOT EXISTS vector;

-- Drop existing table to change vector dimensions
DROP TABLE IF EXISTS rag_chunks;

-- Chunks table with Google gemini-embedding-001 dimensions (3072)
CREATE TABLE rag_chunks (
  id TEXT PRIMARY KEY,
  page INTEGER NOT NULL,
  content TEXT NOT NULL,
  tokens INTEGER NOT NULL DEFAULT 0,
  embedding VECTOR(3072) NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'
);

-- IVFFlat index for fast cosine search (supports any dimension, but requires training)
-- lists=100 is good for ~10k-100k vectors
CREATE INDEX rag_chunks_embedding_ivfflat
ON rag_chunks USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
