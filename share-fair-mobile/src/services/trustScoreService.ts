import api from './api';
import type { TrustScore } from '../types';

class TrustScoreService {
  async getTrustScore(userId: string): Promise<TrustScore> {
    const response = await api.get<TrustScore>(`/trust-scores/user/${userId}`);
    return response.data;
  }
}

export default new TrustScoreService();
