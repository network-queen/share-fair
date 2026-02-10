import { describe, it, expect, vi, beforeEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import listingReducer, {
  fetchListings,
  fetchListing,
  clearCurrentListing,
  clearError,
} from '../listingSlice';
import type { Listing, PaginatedResponse } from '../../../types';

vi.mock('../../../services/listingService', () => ({
  default: {
    getListings: vi.fn(),
    getListing: vi.fn(),
  },
}));

import listingService from '../../../services/listingService';

const mockListing: Listing = {
  id: 'listing-1',
  title: 'Electric Drill',
  description: 'High-quality electric drill',
  category: 'Tools',
  condition: 'GOOD',
  ownerId: 'user-1',
  price: 15,
  pricePerDay: 5,
  images: ['https://example.com/drill.jpg'],
  latitude: 50.45,
  longitude: 30.52,
  neighborhood: 'Downtown',
  available: true,
  createdAt: '2025-02-01T12:00:00Z',
  updatedAt: '2025-02-05T08:30:00Z',
};

function createStore() {
  return configureStore({ reducer: { listing: listingReducer } });
}

describe('listingSlice', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('initial state', () => {
    it('has correct initial values', () => {
      const store = createStore();
      const state = store.getState().listing;

      expect(state.listings).toEqual([]);
      expect(state.currentListing).toBeNull();
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
      expect(state.pagination).toEqual({
        currentPage: 0,
        totalPages: 0,
        totalElements: 0,
      });
    });
  });

  describe('reducers', () => {
    it('clearCurrentListing sets currentListing to null', async () => {
      const store = createStore();
      vi.mocked(listingService.getListing).mockResolvedValueOnce(mockListing);

      await store.dispatch(fetchListing('listing-1'));
      expect(store.getState().listing.currentListing).not.toBeNull();

      store.dispatch(clearCurrentListing());
      expect(store.getState().listing.currentListing).toBeNull();
    });

    it('clearError sets error to null', async () => {
      const store = createStore();
      vi.mocked(listingService.getListings).mockRejectedValueOnce(new Error('Failed'));

      await store.dispatch(fetchListings({ page: 0, limit: 20 }));
      expect(store.getState().listing.error).toBe('Failed');

      store.dispatch(clearError());
      expect(store.getState().listing.error).toBeNull();
    });
  });

  describe('fetchListings thunk', () => {
    it('sets isLoading to true when pending', () => {
      const store = createStore();
      vi.mocked(listingService.getListings).mockReturnValueOnce(new Promise(() => {}));

      store.dispatch(fetchListings({ page: 0, limit: 20 }));
      expect(store.getState().listing.isLoading).toBe(true);
      expect(store.getState().listing.error).toBeNull();
    });

    it('sets listings and pagination on fulfilled', async () => {
      const store = createStore();
      const mockResponse: PaginatedResponse<Listing> = {
        content: [mockListing],
        totalElements: 1,
        totalPages: 1,
        currentPage: 0,
        pageSize: 20,
      };
      vi.mocked(listingService.getListings).mockResolvedValueOnce(mockResponse);

      await store.dispatch(fetchListings({ page: 0, limit: 20 }));

      const state = store.getState().listing;
      expect(state.isLoading).toBe(false);
      expect(state.listings).toHaveLength(1);
      expect(state.listings[0].title).toBe('Electric Drill');
      expect(state.pagination).toEqual({
        currentPage: 0,
        totalPages: 1,
        totalElements: 1,
      });
    });

    it('sets error on rejected', async () => {
      const store = createStore();
      vi.mocked(listingService.getListings).mockRejectedValueOnce(new Error('Server error'));

      await store.dispatch(fetchListings({ page: 0, limit: 20 }));

      const state = store.getState().listing;
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe('Server error');
    });
  });

  describe('fetchListing thunk', () => {
    it('sets isLoading to true when pending', () => {
      const store = createStore();
      vi.mocked(listingService.getListing).mockReturnValueOnce(new Promise(() => {}));

      store.dispatch(fetchListing('listing-1'));
      expect(store.getState().listing.isLoading).toBe(true);
    });

    it('sets currentListing on fulfilled', async () => {
      const store = createStore();
      vi.mocked(listingService.getListing).mockResolvedValueOnce(mockListing);

      await store.dispatch(fetchListing('listing-1'));

      const state = store.getState().listing;
      expect(state.isLoading).toBe(false);
      expect(state.currentListing).toEqual(mockListing);
    });

    it('sets error on rejected', async () => {
      const store = createStore();
      vi.mocked(listingService.getListing).mockRejectedValueOnce(new Error('Not found'));

      await store.dispatch(fetchListing('nonexistent'));

      const state = store.getState().listing;
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe('Not found');
    });

    it('handles non-Error rejection with generic message', async () => {
      const store = createStore();
      vi.mocked(listingService.getListing).mockRejectedValueOnce(null);

      await store.dispatch(fetchListing('bad'));
      expect(store.getState().listing.error).toBe('An unexpected error occurred');
    });
  });
});
