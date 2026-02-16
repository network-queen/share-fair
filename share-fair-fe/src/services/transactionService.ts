import api from './api';

export interface TransactionResponse {
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

class TransactionService {
  async createTransaction(data: { listingId: string; startDate: string; endDate: string }): Promise<TransactionResponse> {
    const response = await api.post<TransactionResponse>('/transactions', data);
    return response.data;
  }

  async getTransaction(id: string): Promise<TransactionResponse> {
    const response = await api.get<TransactionResponse>(`/transactions/${id}`);
    return response.data;
  }

  async getMyTransactions(): Promise<TransactionResponse[]> {
    const response = await api.get<TransactionResponse[]>('/transactions/my');
    return response.data;
  }

  async updateTransactionStatus(id: string, status: string): Promise<TransactionResponse> {
    const response = await api.put<TransactionResponse>(`/transactions/${id}/status`, { status });
    return response.data;
  }
}

export default new TransactionService();
