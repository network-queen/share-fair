import api from './api'
import type { Listing } from '../types'

const recommendationService = {
  async getPersonalized(limit = 10): Promise<Listing[]> {
    const { data } = await api.get('/recommendations', { params: { limit } })
    return data.data
  },

  async getSimilar(listingId: string, limit = 6): Promise<Listing[]> {
    const { data } = await api.get(`/recommendations/similar/${listingId}`, { params: { limit } })
    return data.data
  },
}

export default recommendationService
