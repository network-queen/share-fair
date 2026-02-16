import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import transactionService from '../../services/transactionService';

interface TransactionData {
  id: string;
  listingId: string;
  listingTitle: string;
  borrowerId: string;
  borrowerName: string;
  ownerId: string;
  ownerName: string;
  status: string;
  startDate: string;
  endDate: string;
  totalAmount: number;
  serviceFee: number;
  paymentStatus: string;
  createdAt: string;
  completedAt?: string;
  isFree?: boolean;
}

interface TransactionState {
  transactions: TransactionData[];
  currentTransaction: TransactionData | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: TransactionState = {
  transactions: [],
  currentTransaction: null,
  isLoading: false,
  error: null,
};

export const fetchMyTransactions = createAsyncThunk(
  'transaction/fetchMy',
  async (_, { rejectWithValue }) => {
    try {
      return await transactionService.getMyTransactions();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to fetch transactions';
      return rejectWithValue(message);
    }
  }
);

export const fetchTransaction = createAsyncThunk(
  'transaction/fetchOne',
  async (id: string, { rejectWithValue }) => {
    try {
      return await transactionService.getTransaction(id);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to fetch transaction';
      return rejectWithValue(message);
    }
  }
);

export const createTransaction = createAsyncThunk(
  'transaction/create',
  async (data: { listingId: string; startDate: string; endDate: string }, { rejectWithValue }) => {
    try {
      return await transactionService.createTransaction(data);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to create transaction';
      return rejectWithValue(message);
    }
  }
);

export const updateTransactionStatus = createAsyncThunk(
  'transaction/updateStatus',
  async ({ id, status }: { id: string; status: string }, { rejectWithValue }) => {
    try {
      return await transactionService.updateTransactionStatus(id, status);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to update transaction';
      return rejectWithValue(message);
    }
  }
);

const transactionSlice = createSlice({
  name: 'transaction',
  initialState,
  reducers: {
    clearTransactionError: (state) => {
      state.error = null;
    },
    clearCurrentTransaction: (state) => {
      state.currentTransaction = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyTransactions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMyTransactions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.transactions = action.payload;
      })
      .addCase(fetchMyTransactions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchTransaction.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTransaction.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentTransaction = action.payload;
      })
      .addCase(fetchTransaction.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(createTransaction.fulfilled, (state, action) => {
        state.transactions.unshift(action.payload);
      })
      .addCase(updateTransactionStatus.fulfilled, (state, action) => {
        state.currentTransaction = action.payload;
        const idx = state.transactions.findIndex(t => t.id === action.payload.id);
        if (idx !== -1) {
          state.transactions[idx] = action.payload;
        }
      });
  },
});

export const { clearTransactionError, clearCurrentTransaction } = transactionSlice.actions;
export default transactionSlice.reducer;
