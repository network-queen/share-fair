import api from './api';
import type { Listing, PaginatedResponse } from '../types';

class ListingService {
  // Get all listings
  async getListings(
    page: number = 0,
    limit: number = 20
  ): Promise<PaginatedResponse<Listing>> {
    const response = await api.get<PaginatedResponse<Listing>>('/listings', {
      params: { page, limit },
    });
    return response.data;
  }

  // Get listing by ID
  async getListing(id: string): Promise<Listing> {
    const response = await api.get<Listing>(`/listings/${id}`);
    return response.data;
  }

  // Create listing
  async createListing(listing: Omit<Listing, 'id' | 'createdAt' | 'updatedAt'>): Promise<Listing> {
    const response = await api.post<Listing>('/listings', listing);
    return response.data;
  }

  // Update listing
  async updateListing(id: string, listing: Partial<Listing>): Promise<Listing> {
    const response = await api.put<Listing>(`/listings/${id}`, listing);
    return response.data;
  }

  // Delete listing
  async deleteListing(id: string): Promise<void> {
    await api.delete(`/listings/${id}`);
  }

  // Update listing status
  async updateListingStatus(id: string, status: string): Promise<Listing> {
    const response = await api.patch<Listing>(`/listings/${id}/status`, null, {
      params: { status },
    });
    return response.data;
  }

  // Get listings by user
  async getUserListings(userId: string): Promise<Listing[]> {
    const response = await api.get<Listing[]>(`/listings/user/${userId}`);
    return response.data;
  }

  // Upload listing images
  async uploadImages(listingId: string, files: File[]): Promise<string[]> {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));

    const response = await api.post<string[]>(`/listings/${listingId}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // Delete a listing image
  async deleteImage(listingId: string, imageUrl: string): Promise<string[]> {
    const response = await api.delete<string[]>(`/listings/${listingId}/images`, {
      params: { imageUrl },
    });
    return response.data;
  }
}

export default new ListingService();
