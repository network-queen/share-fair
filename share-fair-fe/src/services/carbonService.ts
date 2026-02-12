import api from './api';
import type { CarbonSavedRecord } from '../types';

export interface LeaderboardEntry {
  userId: string;
  name: string;
  totalCarbonSaved: number;
}

class CarbonService {
  async getUserHistory(userId: string): Promise<CarbonSavedRecord[]> {
    const response = await api.get<CarbonSavedRecord[]>(`/carbon/user/${userId}`);
    return response.data;
  }

  async getUserTotal(userId: string): Promise<number> {
    const response = await api.get<number>(`/carbon/user/${userId}/total`);
    return response.data;
  }

  async getLeaderboard(limit: number = 10): Promise<LeaderboardEntry[]> {
    const response = await api.get<LeaderboardEntry[]>(`/carbon/leaderboard?limit=${limit}`);
    return response.data;
  }
}

export default new CarbonService();
