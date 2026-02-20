import api from './api';
import type { User, Listing } from '../types';

interface UpdateUserRequest {
  name?: string;
  neighborhood?: string;
  avatar?: string;
}

class UserService {
  async getUser(id: string): Promise<User> {
    const response = await api.get<User>(`/users/${id}`);
    return response.data;
  }

  async updateUser(id: string, data: UpdateUserRequest): Promise<User> {
    const response = await api.put<User>(`/users/${id}`, data);
    return response.data;
  }

  async getUserListings(userId: string): Promise<Listing[]> {
    const response = await api.get<Listing[]>(`/users/${userId}/listings`);
    return response.data;
  }
}

export default new UserService();
