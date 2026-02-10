-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    avatar VARCHAR(500),
    neighborhood VARCHAR(255) NOT NULL,
    trust_score INTEGER DEFAULT 0,
    carbon_saved INTEGER DEFAULT 0,
    verification_status VARCHAR(50) DEFAULT 'UNVERIFIED',
    oauth_provider VARCHAR(50),
    oauth_id VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(oauth_provider, oauth_id)
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_oauth ON users(oauth_provider, oauth_id);
CREATE INDEX idx_users_neighborhood ON users(neighborhood);

-- Listings table
CREATE TABLE listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    condition VARCHAR(50) NOT NULL,
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    price NUMERIC(10, 2) NOT NULL,
    price_per_day NUMERIC(10, 2),
    images TEXT[] DEFAULT '{}',
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    neighborhood VARCHAR(255) NOT NULL,
    available BOOLEAN DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_listings_owner ON listings(owner_id);
CREATE INDEX idx_listings_category ON listings(category);
CREATE INDEX idx_listings_neighborhood ON listings(neighborhood);
CREATE INDEX idx_listings_available ON listings(available);
CREATE INDEX idx_listings_location ON listings USING GIST (ST_MakePoint(longitude, latitude));

-- Transactions table
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    borrower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_amount NUMERIC(10, 2) NOT NULL,
    service_fee NUMERIC(10, 2) NOT NULL,
    payment_status VARCHAR(50) DEFAULT 'PENDING',
    stripe_payment_id VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    CONSTRAINT check_dates CHECK (end_date >= start_date)
);

CREATE INDEX idx_transactions_borrower ON transactions(borrower_id);
CREATE INDEX idx_transactions_owner ON transactions(owner_id);
CREATE INDEX idx_transactions_listing ON transactions(listing_id);
CREATE INDEX idx_transactions_status ON transactions(status);

-- Reviews table
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reviewee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reviews_reviewer ON reviews(reviewer_id);
CREATE INDEX idx_reviews_reviewee ON reviews(reviewee_id);
CREATE INDEX idx_reviews_transaction ON reviews(transaction_id);

-- Trust Scores table
CREATE TABLE trust_scores (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    score NUMERIC(5, 2) DEFAULT 0,
    tier VARCHAR(50) DEFAULT 'BRONZE',
    completed_transactions INTEGER DEFAULT 0,
    average_rating NUMERIC(3, 2) DEFAULT 0,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Carbon Saved table
CREATE TABLE carbon_saved (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    carbon_saved_kg NUMERIC(10, 2) NOT NULL,
    estimated_new_product_carbon NUMERIC(10, 2),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_carbon_user ON carbon_saved(user_id);
CREATE INDEX idx_carbon_transaction ON carbon_saved(transaction_id);

-- Service Fees table
CREATE TABLE service_fees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    percentage NUMERIC(5, 2) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Neighborhoods table
CREATE TABLE neighborhoods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    city VARCHAR(255) NOT NULL,
    country VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_neighborhoods_name ON neighborhoods(name);

-- Insert default neighborhoods
INSERT INTO neighborhoods (name, city, country) VALUES
('Brooklyn', 'New York', 'USA'),
('Manhattan', 'New York', 'USA'),
('Queens', 'New York', 'USA'),
('Shevchenko', 'Kyiv', 'Ukraine'),
('Desnyansky', 'Kyiv', 'Ukraine'),
('Holosiivsky', 'Kyiv', 'Ukraine');

-- Insert default service fee
INSERT INTO service_fees (percentage, is_active) VALUES (10.0, true);
