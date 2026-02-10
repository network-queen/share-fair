-- Insert test users
INSERT INTO users (id, email, name, avatar, neighborhood, trust_score, carbon_saved, verification_status, created_at, updated_at)
VALUES
    ('550e8400-e29b-41d4-a716-446655440001', 'alice@example.com', 'Alice Johnson', 'https://i.pravatar.cc/150?img=1', 'Brooklyn', 4, 125, 'VERIFIED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('550e8400-e29b-41d4-a716-446655440002', 'bob@example.com', 'Bob Smith', 'https://i.pravatar.cc/150?img=2', 'Manhattan', 3, 89, 'VERIFIED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('550e8400-e29b-41d4-a716-446655440003', 'charlie@example.com', 'Charlie Brown', 'https://i.pravatar.cc/150?img=3', 'Queens', 2, 45, 'UNVERIFIED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('550e8400-e29b-41d4-a716-446655440004', 'diana@example.com', 'Diana Prince', 'https://i.pravatar.cc/150?img=4', 'Shevchenko', 5, 234, 'VERIFIED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('550e8400-e29b-41d4-a716-446655440005', 'eve@example.com', 'Eve Wilson', 'https://i.pravatar.cc/150?img=5', 'Desnyansky', 4, 156, 'VERIFIED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Insert test listings
INSERT INTO listings (id, title, description, category, condition, owner_id, price, price_per_day, images, latitude, longitude, neighborhood, available, created_at, updated_at)
VALUES
    ('660e8400-e29b-41d4-a716-446655440001', 'Mountain Bike', 'Excellent condition bike, barely used', 'Sports', 'Excellent', '550e8400-e29b-41d4-a716-446655440001', 150.00, 15.00, ARRAY['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500'], 40.6782, -73.9442, 'Brooklyn', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('660e8400-e29b-41d4-a716-446655440002', 'Camping Tent', 'Large 4-person tent, waterproof', 'Outdoor', 'Good', '550e8400-e29b-41d4-a716-446655440002', 80.00, 8.00, ARRAY['https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=500'], 40.7128, -74.0060, 'Manhattan', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('660e8400-e29b-41d4-a716-446655440003', 'Laptop Stand', 'Adjustable aluminum stand for laptops', 'Electronics', 'Like New', '550e8400-e29b-41d4-a716-446655440003', 45.00, 5.00, ARRAY['https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500'], 40.7282, -73.7949, 'Queens', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('660e8400-e29b-41d4-a716-446655440004', 'Guitar Amplifier', 'Marshall MG100FX, great sound', 'Music', 'Good', '550e8400-e29b-41d4-a716-446655440004', 200.00, 25.00, ARRAY['https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500'], 50.4501, 30.5234, 'Shevchenko', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('660e8400-e29b-41d4-a716-446655440005', 'DSLR Camera', 'Canon 5D Mark IV, excellent for photography', 'Electronics', 'Excellent', '550e8400-e29b-41d4-a716-446655440005', 800.00, 100.00, ARRAY['https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=500'], 50.3875, 30.6363, 'Desnyansky', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('660e8400-e29b-41d4-a716-446655440006', 'Yoga Mat', 'Premium non-slip yoga mat', 'Fitness', 'New', '550e8400-e29b-41d4-a716-446655440001', 20.00, 2.00, ARRAY['https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=500'], 40.6782, -73.9442, 'Brooklyn', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Insert test transactions
INSERT INTO transactions (id, listing_id, borrower_id, owner_id, status, start_date, end_date, total_amount, service_fee, payment_status, stripe_payment_id, created_at, completed_at)
VALUES
    ('880e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'COMPLETED', CURRENT_DATE, CURRENT_DATE + INTERVAL '7 days', 105.00, 15.00, 'COMPLETED', 'pi_test_001', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('880e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 'COMPLETED', CURRENT_DATE - INTERVAL '14 days', CURRENT_DATE - INTERVAL '7 days', 56.00, 8.00, 'COMPLETED', 'pi_test_002', CURRENT_TIMESTAMP - INTERVAL '7 days', CURRENT_TIMESTAMP - INTERVAL '7 days');

-- Insert test reviews
INSERT INTO reviews (id, transaction_id, reviewer_id, reviewee_id, rating, comment, created_at)
VALUES
    ('770e8400-e29b-41d4-a716-446655440001', '880e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 5, 'Great item and prompt delivery!', CURRENT_TIMESTAMP),
    ('770e8400-e29b-41d4-a716-446655440002', '880e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 4, 'Good condition, very responsive seller', CURRENT_TIMESTAMP);

-- Insert trust scores
INSERT INTO trust_scores (user_id, score, tier, completed_transactions, average_rating, updated_at)
VALUES
    ('550e8400-e29b-41d4-a716-446655440001', 4.50, 'SILVER', 8, 4.75, CURRENT_TIMESTAMP),
    ('550e8400-e29b-41d4-a716-446655440002', 4.00, 'SILVER', 6, 4.00, CURRENT_TIMESTAMP),
    ('550e8400-e29b-41d4-a716-446655440003', 2.50, 'BRONZE', 2, 2.50, CURRENT_TIMESTAMP),
    ('550e8400-e29b-41d4-a716-446655440004', 5.00, 'GOLD', 15, 4.95, CURRENT_TIMESTAMP),
    ('550e8400-e29b-41d4-a716-446655440005', 4.20, 'SILVER', 10, 4.20, CURRENT_TIMESTAMP);

-- Insert carbon saved records
INSERT INTO carbon_saved (id, transaction_id, user_id, carbon_saved_kg, estimated_new_product_carbon, created_at)
VALUES
    ('990e8400-e29b-41d4-a716-446655440001', '880e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 12.50, 25.00, CURRENT_TIMESTAMP),
    ('990e8400-e29b-41d4-a716-446655440002', '880e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 8.30, 16.60, CURRENT_TIMESTAMP);
