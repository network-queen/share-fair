import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { Listing, PaginatedResponse } from '../../types';
import listingService from '../../services/listingService';

interface ListingState {
  listings: Listing[];
  currentListing: Listing | null;
  isLoading: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalElements: number;
  };
}

const initialState: ListingState = {
  listings: [],
  currentListing: null,
  isLoading: false,
  error: null,
  pagination: {
    currentPage: 0,
    totalPages: 0,
    totalElements: 0,
  },
};

export const fetchListings = createAsyncThunk(
  'listing/fetchListings',
  async ({ page, limit }: { page: number; limit: number }, { rejectWithValue }) => {
    try {
      return await listingService.getListings(page, limit);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An unexpected error occurred';
      return rejectWithValue(message);
    }
  }
);

export const fetchListing = createAsyncThunk(
  'listing/fetchListing',
  async (id: string, { rejectWithValue }) => {
    try {
      return await listingService.getListing(id);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An unexpected error occurred';
      return rejectWithValue(message);
    }
  }
);

const listingSlice = createSlice({
  name: 'listing',
  initialState,
  reducers: {
    clearCurrentListing: (state) => {
      state.currentListing = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchListings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchListings.fulfilled, (state, action) => {
        state.isLoading = false;
        const response = action.payload as PaginatedResponse<Listing>;
        state.listings = response.content;
        state.pagination = {
          currentPage: response.currentPage,
          totalPages: response.totalPages,
          totalElements: response.totalElements,
        };
      })
      .addCase(fetchListings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchListing.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchListing.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentListing = action.payload;
      })
      .addCase(fetchListing.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearCurrentListing, clearError } = listingSlice.actions;
export default listingSlice.reducer;
