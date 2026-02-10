import { describe, it, expect, vi, beforeEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import searchReducer, {
  search,
  loadMore,
  fetchNeighborhoods,
  fetchCategories,
  updateSearchParams,
  clearResults,
  clearError,
} from '../searchSlice';
import type { SearchResult } from '../../../types';

vi.mock('../../../services/searchService', () => ({
  default: {
    search: vi.fn(),
    getNeighborhoods: vi.fn(),
    getCategories: vi.fn(),
  },
}));

import searchService from '../../../services/searchService';

function createStore() {
  return configureStore({ reducer: { search: searchReducer } });
}

describe('searchSlice', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('initial state', () => {
    it('has correct initial values', () => {
      const store = createStore();
      const state = store.getState().search;

      expect(state.results).toEqual([]);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
      expect(state.searchParams).toEqual({});
      expect(state.neighborhoods).toEqual([]);
      expect(state.categories).toEqual([]);
      expect(state.total).toBe(0);
      expect(state.hasMore).toBe(false);
    });
  });

  describe('reducers', () => {
    it('updateSearchParams merges new params', () => {
      const store = createStore();

      store.dispatch(updateSearchParams({ query: 'bike' }));
      expect(store.getState().search.searchParams).toEqual({ query: 'bike' });

      store.dispatch(updateSearchParams({ category: 'Sports' }));
      expect(store.getState().search.searchParams).toEqual({ query: 'bike', category: 'Sports' });
    });

    it('clearResults resets results, total, and hasMore', () => {
      const store = createStore();
      // Manually set some state via a fulfilled search
      const mockResult: SearchResult = {
        listings: [{ id: '1', title: 'Bike', description: '', category: 'Sports', condition: 'GOOD', ownerId: '1', price: 10, images: [], latitude: 0, longitude: 0, neighborhood: 'Brooklyn', available: true, createdAt: '', updatedAt: '' }],
        total: 1,
        hasMore: true,
      };
      vi.mocked(searchService.search).mockResolvedValueOnce(mockResult);

      return store.dispatch(search({})).then(() => {
        store.dispatch(clearResults());
        const state = store.getState().search;
        expect(state.results).toEqual([]);
        expect(state.total).toBe(0);
        expect(state.hasMore).toBe(false);
      });
    });

    it('clearError sets error to null', () => {
      const store = createStore();
      vi.mocked(searchService.search).mockRejectedValueOnce(new Error('Network error'));

      return store.dispatch(search({})).then(() => {
        expect(store.getState().search.error).toBe('Network error');
        store.dispatch(clearError());
        expect(store.getState().search.error).toBeNull();
      });
    });
  });

  describe('search thunk', () => {
    it('sets isLoading to true when pending', () => {
      const store = createStore();
      vi.mocked(searchService.search).mockReturnValueOnce(new Promise(() => {}));

      store.dispatch(search({ query: 'bike' }));
      expect(store.getState().search.isLoading).toBe(true);
      expect(store.getState().search.error).toBeNull();
    });

    it('sets results on fulfilled', async () => {
      const store = createStore();
      const mockResult: SearchResult = {
        listings: [
          { id: '1', title: 'Mountain Bike', description: 'Great bike', category: 'Sports', condition: 'GOOD', ownerId: '1', price: 25, images: ['img.jpg'], latitude: 40.0, longitude: -74.0, neighborhood: 'Brooklyn', available: true, createdAt: '2025-01-01', updatedAt: '2025-01-01' },
        ],
        total: 1,
        hasMore: false,
      };
      vi.mocked(searchService.search).mockResolvedValueOnce(mockResult);

      await store.dispatch(search({ query: 'bike' }));
      const state = store.getState().search;
      expect(state.isLoading).toBe(false);
      expect(state.results).toHaveLength(1);
      expect(state.results[0].title).toBe('Mountain Bike');
      expect(state.total).toBe(1);
      expect(state.hasMore).toBe(false);
    });

    it('sets error on rejected', async () => {
      const store = createStore();
      vi.mocked(searchService.search).mockRejectedValueOnce(new Error('Server error'));

      await store.dispatch(search({ query: 'fail' }));
      const state = store.getState().search;
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe('Server error');
    });

    it('handles non-Error rejection with generic message', async () => {
      const store = createStore();
      vi.mocked(searchService.search).mockRejectedValueOnce('string error');

      await store.dispatch(search({}));
      expect(store.getState().search.error).toBe('An unexpected error occurred');
    });
  });

  describe('loadMore thunk', () => {
    it('appends listings to existing results', async () => {
      const store = createStore();
      const firstPage: SearchResult = {
        listings: [{ id: '1', title: 'Item 1', description: '', category: 'Tools', condition: 'GOOD', ownerId: '1', price: 10, images: [], latitude: 0, longitude: 0, neighborhood: 'Brooklyn', available: true, createdAt: '', updatedAt: '' }],
        total: 1,
        hasMore: true,
      };
      vi.mocked(searchService.search).mockResolvedValueOnce(firstPage);
      await store.dispatch(search({}));
      expect(store.getState().search.results).toHaveLength(1);

      const secondPage: SearchResult = {
        listings: [{ id: '2', title: 'Item 2', description: '', category: 'Tools', condition: 'GOOD', ownerId: '1', price: 20, images: [], latitude: 0, longitude: 0, neighborhood: 'Manhattan', available: true, createdAt: '', updatedAt: '' }],
        total: 1,
        hasMore: false,
      };
      vi.mocked(searchService.search).mockResolvedValueOnce(secondPage);
      await store.dispatch(loadMore());

      const state = store.getState().search;
      expect(state.results).toHaveLength(2);
      expect(state.results[0].title).toBe('Item 1');
      expect(state.results[1].title).toBe('Item 2');
      expect(state.hasMore).toBe(false);
    });
  });

  describe('fetchNeighborhoods thunk', () => {
    it('sets neighborhoods on fulfilled', async () => {
      const store = createStore();
      const mockNeighborhoods = [
        { id: '1', name: 'Brooklyn' },
        { id: '2', name: 'Manhattan' },
      ];
      vi.mocked(searchService.getNeighborhoods).mockResolvedValueOnce(mockNeighborhoods);

      await store.dispatch(fetchNeighborhoods());
      expect(store.getState().search.neighborhoods).toEqual(mockNeighborhoods);
    });
  });

  describe('fetchCategories thunk', () => {
    it('sets categories on fulfilled', async () => {
      const store = createStore();
      const mockCategories = ['Sports', 'Tools', 'Electronics'];
      vi.mocked(searchService.getCategories).mockResolvedValueOnce(mockCategories);

      await store.dispatch(fetchCategories());
      expect(store.getState().search.categories).toEqual(mockCategories);
    });
  });
});
