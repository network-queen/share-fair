import api from './api';

export interface NotificationPreferences {
  emailTransactions: boolean;
  emailReviews: boolean;
  emailMarketing: boolean;
  inAppTransactions: boolean;
  inAppReviews: boolean;
}

class NotificationPreferenceService {
  async getPreferences(): Promise<NotificationPreferences> {
    const response = await api.get<NotificationPreferences>('/notification-preferences');
    return response.data;
  }

  async updatePreferences(prefs: Partial<NotificationPreferences>): Promise<NotificationPreferences> {
    const response = await api.put<NotificationPreferences>('/notification-preferences', prefs);
    return response.data;
  }
}

export default new NotificationPreferenceService();
