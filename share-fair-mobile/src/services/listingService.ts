import api from './api';
import type { Listing, PaginatedResponse } from '../types';

class ListingService {
  async getListings(page: number = 0, limit: number = 20): Promise<PaginatedResponse<Listing>> {
    const response = await api.get<PaginatedResponse<Listing>>('/listings', {
      params: { page, limit },
    });
    return response.data;
  }

  async getListing(id: string): Promise<Listing> {
    const response = await api.get<Listing>(`/listings/${id}`);
    return response.data;
  }

  async createListing(listing: Omit<Listing, 'id' | 'createdAt' | 'updatedAt'>): Promise<Listing> {
    const response = await api.post<Listing>('/listings', listing);
    return response.data;
  }

  async updateListing(id: string, listing: Partial<Listing>): Promise<Listing> {
    const response = await api.put<Listing>(`/listings/${id}`, listing);
    return response.data;
  }

  async deleteListing(id: string): Promise<void> {
    await api.delete(`/listings/${id}`);
  }

  async updateListingStatus(id: string, status: string): Promise<Listing> {
    const response = await api.patch<Listing>(`/listings/${id}/status`, null, {
      params: { status },
    });
    return response.data;
  }

  async getUserListings(userId: string): Promise<Listing[]> {
    const response = await api.get<Listing[]>(`/listings/user/${userId}`);
    return response.data;
  }

  // Upload images from device (uses FormData with uri for React Native)
  async uploadImages(listingId: string, imageUris: string[]): Promise<string[]> {
    const formData = new FormData();
    imageUris.forEach((uri, index) => {
      const filename = uri.split('/').pop() || `image_${index}.jpg`;
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';
      formData.append('files', { uri, name: filename, type } as unknown as Blob);
    });

    const response = await api.post<string[]>(`/listings/${listingId}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }

  async deleteImage(listingId: string, imageUrl: string): Promise<string[]> {
    const response = await api.delete<string[]>(`/listings/${listingId}/images`, {
      params: { imageUrl },
    });
    return response.data;
  }
}

export default new ListingService();
