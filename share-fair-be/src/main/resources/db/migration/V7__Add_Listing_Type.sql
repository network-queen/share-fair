-- Add listing_type column to distinguish free borrowing from paid rentals
ALTER TABLE listings ADD COLUMN listing_type VARCHAR(20) NOT NULL DEFAULT 'RENTAL';

CREATE INDEX idx_listings_type ON listings(listing_type);
