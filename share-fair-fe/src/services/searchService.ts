import api from './api';
import type { Listing, SearchParams, SearchResult } from '../types';

class SearchService {
  // Search listings with filters
  async search(params: SearchParams): Promise<SearchResult> {
    const response = await api.get<SearchResult>('/search', {
      params: {
        query: params.query,
        neighborhood: params.neighborhood,
        category: params.category,
        radius: params.radius,
        sortBy: params.sortBy || 'relevance',
        limit: params.limit || 20,
        offset: params.offset || 0,
      },
    });
    return response.data;
  }

  // Geolocation-based search
  async searchByLocation(
    latitude: number,
    longitude: number,
    radius: number = 5
  ): Promise<Listing[]> {
    const response = await api.get<Listing[]>('/search/location', {
      params: {
        latitude,
        longitude,
        radius,
      },
    });
    return response.data;
  }

  // Get neighborhoods
  async getNeighborhoods(): Promise<Array<{ id: string; name: string }>> {
    const response = await api.get<Array<{ id: string; name: string }>>('/search/neighborhoods');
    return response.data;
  }

  // Get categories
  async getCategories(): Promise<string[]> {
    const response = await api.get<string[]>('/search/categories');
    return response.data;
  }

  // Advanced search with autocomplete
  async autocomplete(query: string): Promise<string[]> {
    const response = await api.get<string[]>('/search/autocomplete', {
      params: { query },
    });
    return response.data;
  }
}

export default new SearchService();
