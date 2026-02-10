-- Enable pgvector extension for vector similarity search
CREATE EXTENSION IF NOT EXISTS vector;

-- Add embedding column to listings table (384 dimensions for all-MiniLM-L6-v2)
ALTER TABLE listings ADD COLUMN embedding vector(384);

-- Create HNSW index for cosine similarity search
CREATE INDEX idx_listings_embedding ON listings
    USING hnsw (embedding vector_cosine_ops)
    WITH (m = 16, ef_construction = 64);
