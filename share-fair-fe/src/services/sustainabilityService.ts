import api from './api';

export interface CategoryStat {
  category: string;
  totalCarbon: number;
  transactionCount: number;
}

export interface MonthlyTrend {
  month: string;
  carbonSaved: number;
  transactions: number;
}

export interface TopContributor {
  userId: string;
  name: string;
  avatar: string | null;
  totalCarbon: number;
  transactionCount: number;
}

export interface SustainabilityReport {
  totalCarbonSavedKg: number;
  totalCompletedTransactions: number;
  totalActiveUsers: number;
  avgCarbonPerTransaction: number;
  carbonByCategory: CategoryStat[];
  monthlyTrend: MonthlyTrend[];
  topContributors: TopContributor[];
  // user-specific (null in community report)
  userTotalCarbonSavedKg: number | null;
  userCompletedTransactions: number | null;
  userTier: string | null;
  userRank: number | null;
}

const sustainabilityService = {
  async getCommunityReport(): Promise<SustainabilityReport> {
    const { data } = await api.get('/sustainability/report/community');
    return data.data;
  },

  async getUserReport(userId: string): Promise<SustainabilityReport> {
    const { data } = await api.get(`/sustainability/report/user/${userId}`);
    return data.data;
  },
};

export default sustainabilityService;
