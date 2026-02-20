import api from './api';

export type DisputeReason =
  | 'ITEM_NOT_RETURNED'
  | 'ITEM_DAMAGED'
  | 'NO_SHOW'
  | 'PAYMENT_ISSUE'
  | 'MISREPRESENTATION'
  | 'OTHER';

export type DisputeStatus = 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED' | 'CLOSED';

export interface DisputeResponse {
  id: string;
  transactionId: string;
  reporterId: string;
  reporterName: string;
  reason: DisputeReason;
  details: string | null;
  status: DisputeStatus;
  resolution: string | null;
  resolvedByName: string | null;
  createdAt: string;
  resolvedAt: string | null;
}

const disputeService = {
  async createDispute(transactionId: string, reason: DisputeReason, details: string): Promise<DisputeResponse> {
    const { data } = await api.post('/disputes', { transactionId, reason, details });
    return data.data;
  },

  async getDispute(id: string): Promise<DisputeResponse> {
    const { data } = await api.get(`/disputes/${id}`);
    return data.data;
  },

  async getDisputeByTransaction(transactionId: string): Promise<DisputeResponse | null> {
    try {
      const { data } = await api.get(`/disputes/transaction/${transactionId}`);
      return data.data;
    } catch {
      return null;
    }
  },

  async getMyDisputes(): Promise<DisputeResponse[]> {
    const { data } = await api.get('/disputes/my');
    return data.data;
  },

  async resolveDispute(id: string, status: 'RESOLVED' | 'CLOSED', resolution: string): Promise<DisputeResponse> {
    const { data } = await api.put(`/disputes/${id}/resolve`, { status, resolution });
    return data.data;
  },
};

export default disputeService;
