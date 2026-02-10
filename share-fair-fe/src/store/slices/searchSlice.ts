import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { Listing, SearchParams, SearchResult } from '../../types';
import searchService from '../../services/searchService';

interface SearchState {
  results: Listing[];
  isLoading: boolean;
  error: string | null;
  searchParams: SearchParams;
  neighborhoods: Array<{ id: string; name: string }>;
  categories: string[];
  total: number;
  hasMore: boolean;
}

const initialState: SearchState = {
  results: [],
  isLoading: false,
  error: null,
  searchParams: {},
  neighborhoods: [],
  categories: [],
  total: 0,
  hasMore: false,
};

export const search = createAsyncThunk(
  'search/search',
  async (params: SearchParams, { rejectWithValue }) => {
    try {
      return await searchService.search(params);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An unexpected error occurred';
      return rejectWithValue(message);
    }
  }
);

export const loadMore = createAsyncThunk(
  'search/loadMore',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = (getState() as { search: SearchState }).search;
      const params = {
        ...state.searchParams,
        offset: state.results.length,
      };
      return await searchService.search(params);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An unexpected error occurred';
      return rejectWithValue(message);
    }
  }
);

export const fetchNeighborhoods = createAsyncThunk(
  'search/fetchNeighborhoods',
  async (_, { rejectWithValue }) => {
    try {
      return await searchService.getNeighborhoods();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An unexpected error occurred';
      return rejectWithValue(message);
    }
  }
);

export const fetchCategories = createAsyncThunk(
  'search/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      return await searchService.getCategories();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An unexpected error occurred';
      return rejectWithValue(message);
    }
  }
);

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    updateSearchParams: (state, action) => {
      state.searchParams = { ...state.searchParams, ...action.payload };
    },
    clearResults: (state) => {
      state.results = [];
      state.total = 0;
      state.hasMore = false;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(search.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(search.fulfilled, (state, action) => {
        state.isLoading = false;
        const response = action.payload as SearchResult;
        state.results = response.listings;
        state.total = response.total;
        state.hasMore = response.hasMore;
      })
      .addCase(search.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(loadMore.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loadMore.fulfilled, (state, action) => {
        state.isLoading = false;
        const response = action.payload as SearchResult;
        state.results = [...state.results, ...response.listings];
        state.total = state.results.length;
        state.hasMore = response.hasMore;
      })
      .addCase(loadMore.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchNeighborhoods.fulfilled, (state, action) => {
        state.neighborhoods = action.payload;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categories = action.payload;
      });
  },
});

export const { updateSearchParams, clearResults, clearError } = searchSlice.actions;
export default searchSlice.reducer;
