import api from './api';
import type { Review } from '../types';

export interface ReviewResponse {
  id: string;
  transactionId: string;
  reviewerId: string;
  reviewerName?: string;
  reviewerAvatar?: string;
  revieweeId: string;
  revieweeName?: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface CreateReviewData {
  transactionId: string;
  revieweeId: string;
  rating: number;
  comment: string;
}

class ReviewService {
  async createReview(data: CreateReviewData): Promise<ReviewResponse> {
    const response = await api.post<ReviewResponse>('/reviews', data);
    return response.data;
  }

  async getUserReviews(userId: string): Promise<ReviewResponse[]> {
    const response = await api.get<ReviewResponse[]>(`/reviews/user/${userId}`);
    return response.data;
  }

  async getReviewsByUser(userId: string): Promise<ReviewResponse[]> {
    const response = await api.get<ReviewResponse[]>(`/reviews/by-user/${userId}`);
    return response.data;
  }

  async checkReviewForTransaction(transactionId: string): Promise<ReviewResponse | null> {
    const response = await api.get<ReviewResponse | null>(`/reviews/transaction/${transactionId}/check`);
    const data = response.data;
    // ApiResponse with null data may not be unwrapped by interceptor (NON_NULL serialization)
    if (data && typeof data === 'object' && 'id' in data) {
      return data;
    }
    return null;
  }
}

export default new ReviewService();
