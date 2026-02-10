import type { User, Listing, SearchResult } from '../types';

export const mockUser: User = {
    id: 'user-1',
    email: 'testuser@example.com',
    name: 'Test User',
    avatar: 'https://example.com/avatar.jpg',
    neighborhood: 'Downtown',
    trustScore: 85,
    carbonSaved: 12.5,
    createdAt: '2025-01-15T10:00:00Z',
    verificationStatus: 'EMAIL_VERIFIED',
};

export const mockListing: Listing = {
    id: 'listing-1',
    title: 'Electric Drill',
    description: 'High-quality electric drill, perfect for home projects.',
    category: 'Tools',
    condition: 'GOOD',
    ownerId: 'user-1',
    owner: mockUser,
    price: 15,
    pricePerDay: 5,
    images: ['https://example.com/drill1.jpg', 'https://example.com/drill2.jpg'],
    latitude: 50.4501,
    longitude: 30.5234,
    neighborhood: 'Downtown',
    available: true,
    createdAt: '2025-02-01T12:00:00Z',
    updatedAt: '2025-02-05T08:30:00Z',
    ratings: 4.5,
    reviewCount: 10,
};

export const mockSearchResult: SearchResult = {
    listings: [mockListing],
    total: 1,
    hasMore: false,
};
