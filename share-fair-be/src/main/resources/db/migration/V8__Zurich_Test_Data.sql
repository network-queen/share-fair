-- Insert Zurich test users
INSERT INTO users (id, email, name, avatar, neighborhood, trust_score, carbon_saved, verification_status, created_at, updated_at)
VALUES
    ('550e8400-e29b-41d4-a716-446655440010', 'hans@example.com', 'Hans Mueller', 'https://i.pravatar.cc/150?img=11', 'Zurich Altstadt', 5, 210, 'VERIFIED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('550e8400-e29b-41d4-a716-446655440011', 'sara@example.com', 'Sara Weber', 'https://i.pravatar.cc/150?img=12', 'Zurich Wiedikon', 4, 178, 'VERIFIED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Insert test listings near Zurich (coordinates around Zurich city center ~47.37, 8.54)
INSERT INTO listings (id, title, description, category, condition, owner_id, price, price_per_day, images, latitude, longitude, neighborhood, available, listing_type, created_at, updated_at)
VALUES
    ('660e8400-e29b-41d4-a716-446655440010', 'Electric Drill Bosch', 'Professional Bosch cordless drill with two batteries and charger. Perfect for home projects.', 'Tools', 'EXCELLENT', '550e8400-e29b-41d4-a716-446655440010', 120.00, 12.00, ARRAY['https://images.unsplash.com/photo-1504148455328-c376907d081c?w=500'], 47.3769, 8.5417, 'Zurich Altstadt', true, 'RENTAL', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

    ('660e8400-e29b-41d4-a716-446655440011', 'Stand-Up Paddleboard', 'Inflatable SUP board with paddle and pump. Great for Lake Zurich!', 'Sports & Outdoors', 'GOOD', '550e8400-e29b-41d4-a716-446655440010', 200.00, 25.00, ARRAY['https://images.unsplash.com/photo-1526188717906-ab4a2f949f48?w=500'], 47.3667, 8.5500, 'Zurich Enge', true, 'RENTAL', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

    ('660e8400-e29b-41d4-a716-446655440012', 'Camping Gear Set', 'Complete set: 2-person tent, sleeping bags, cooking stove. Perfect for Swiss Alps trips.', 'Sports & Outdoors', 'GOOD', '550e8400-e29b-41d4-a716-446655440011', 150.00, 20.00, ARRAY['https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=500'], 47.3744, 8.5311, 'Zurich Wiedikon', true, 'RENTAL', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

    ('660e8400-e29b-41d4-a716-446655440013', 'Fondue Set', 'Traditional Swiss fondue set for 6 people. Includes burner and forks. Free to borrow!', 'Other', 'GOOD', '550e8400-e29b-41d4-a716-446655440011', 0.00, 0.00, ARRAY['https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=500'], 47.3783, 8.5396, 'Zurich Wiedikon', true, 'FREE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

    ('660e8400-e29b-41d4-a716-446655440014', 'Sony A7 III Camera', 'Full-frame mirrorless camera with 28-70mm lens. Ideal for weekend photography.', 'Electronics', 'EXCELLENT', '550e8400-e29b-41d4-a716-446655440010', 500.00, 60.00, ARRAY['https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500'], 47.3856, 8.5340, 'Zurich Oerlikon', true, 'RENTAL', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

    ('660e8400-e29b-41d4-a716-446655440015', 'Kids Ski Set', 'Childrens ski set (skis, boots size 32-34, poles). Free to borrow for the season!', 'Sports & Outdoors', 'FAIR', '550e8400-e29b-41d4-a716-446655440011', 0.00, 0.00, ARRAY['https://images.unsplash.com/photo-1551524559-8af4e6624178?w=500'], 47.3520, 8.5320, 'Zurich Wollishofen', true, 'FREE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

    ('660e8400-e29b-41d4-a716-446655440016', 'Projector Epson', 'HD projector with HDMI. Perfect for movie nights or presentations.', 'Electronics', 'GOOD', '550e8400-e29b-41d4-a716-446655440010', 90.00, 15.00, ARRAY['https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=500'], 47.3903, 8.5158, 'Zurich Hongg', true, 'RENTAL', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Insert trust scores for Zurich users
INSERT INTO trust_scores (user_id, score, tier, completed_transactions, average_rating, updated_at)
VALUES
    ('550e8400-e29b-41d4-a716-446655440010', 4.80, 'GOLD', 12, 4.80, CURRENT_TIMESTAMP),
    ('550e8400-e29b-41d4-a716-446655440011', 4.50, 'SILVER', 8, 4.50, CURRENT_TIMESTAMP);
