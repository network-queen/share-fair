import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { SearchParams } from '../types';

interface SavedSearch {
  id: string;
  label: string;
  params: SearchParams;
  savedAt: string;
}

const KEY = 'savedSearches';

export const useSavedSearches = () => {
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(KEY).then((raw) => {
      if (raw) {
        setSavedSearches(JSON.parse(raw));
      }
    });
  }, []);

  const saveSearch = async (label: string, params: SearchParams) => {
    const entry: SavedSearch = {
      id: Date.now().toString(),
      label,
      params,
      savedAt: new Date().toISOString(),
    };
    const updated = [entry, ...savedSearches];
    setSavedSearches(updated);
    await AsyncStorage.setItem(KEY, JSON.stringify(updated));
  };

  const removeSavedSearch = async (id: string) => {
    const updated = savedSearches.filter((s) => s.id !== id);
    setSavedSearches(updated);
    await AsyncStorage.setItem(KEY, JSON.stringify(updated));
  };

  return { savedSearches, saveSearch, removeSavedSearch };
};
