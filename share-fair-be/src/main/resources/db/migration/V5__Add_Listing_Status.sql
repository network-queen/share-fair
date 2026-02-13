-- Add status column to listings table
ALTER TABLE listings ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'ACTIVE';

-- Migrate existing data: set status based on available boolean
UPDATE listings SET status = CASE WHEN available = true THEN 'ACTIVE' ELSE 'ARCHIVED' END WHERE status IS NULL;

-- Add index on status for filtering
CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status);
