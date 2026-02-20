import api from './api';
import type { SearchParams, SearchResult } from '../types';

class SearchService {
  async search(params: SearchParams): Promise<SearchResult> {
    const response = await api.get<SearchResult>('/search', {
      params: {
        query: params.query,
        neighborhood: params.neighborhood,
        category: params.category,
        radius: params.radius,
        lat: params.lat,
        lng: params.lng,
        sortBy: params.sortBy || 'relevance',
        limit: params.limit || 20,
        offset: params.offset || 0,
      },
    });
    return response.data;
  }

  async searchByLocation(
    latitude: number,
    longitude: number,
    radius: number = 5,
    limit: number = 20,
    offset: number = 0
  ): Promise<SearchResult> {
    const response = await api.get<SearchResult>('/search/location', {
      params: { latitude, longitude, radius, limit, offset },
    });
    return response.data;
  }

  async getNeighborhoods(): Promise<Array<{ id: string; name: string }>> {
    const response = await api.get<Array<{ id: string; name: string }>>('/search/neighborhoods');
    return response.data;
  }

  async getCategories(): Promise<string[]> {
    const response = await api.get<string[]>('/search/categories');
    return response.data;
  }

  async autocomplete(query: string): Promise<string[]> {
    const response = await api.get<string[]>('/search/autocomplete', {
      params: { query },
    });
    return response.data;
  }
}

export default new SearchService();
