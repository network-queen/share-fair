import api from './api';

export interface PaymentIntentResponse {
  clientSecret: string;
  publishableKey: string;
  amount: number;
  currency: string;
}

class PaymentService {
  async createPaymentIntent(transactionId: string): Promise<PaymentIntentResponse> {
    const response = await api.post<PaymentIntentResponse>('/payments/intent', { transactionId });
    return response.data;
  }
}

export default new PaymentService();
