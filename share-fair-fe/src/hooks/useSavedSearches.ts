import { useState, useCallback } from 'react'
import type { SearchParams } from '../types'

const STORAGE_KEY = 'sharefair_saved_searches'
const MAX_SAVED = 20

export interface SavedSearch {
  id: string
  name: string
  params: SearchParams
  createdAt: string
}

export const useSavedSearches = () => {
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })

  const saveSearch = useCallback((name: string, params: SearchParams) => {
    setSavedSearches(prev => {
      const newSearch: SavedSearch = {
        id: Date.now().toString(),
        name,
        params,
        createdAt: new Date().toISOString(),
      }
      const updated = [newSearch, ...prev].slice(0, MAX_SAVED)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      return updated
    })
  }, [])

  const removeSearch = useCallback((id: string) => {
    setSavedSearches(prev => {
      const updated = prev.filter(s => s.id !== id)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      return updated
    })
  }, [])

  return { savedSearches, saveSearch, removeSearch }
}
