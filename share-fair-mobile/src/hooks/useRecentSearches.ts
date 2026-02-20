import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'recentSearches';
const MAX = 10;

export const useRecentSearches = () => {
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(KEY).then((raw) => {
      if (raw) {
        setRecentSearches(JSON.parse(raw));
      }
    });
  }, []);

  const addSearch = async (query: string) => {
    if (!query.trim()) return;
    const updated = [query, ...recentSearches.filter((s) => s !== query)].slice(0, MAX);
    setRecentSearches(updated);
    await AsyncStorage.setItem(KEY, JSON.stringify(updated));
  };

  const clearSearches = async () => {
    setRecentSearches([]);
    await AsyncStorage.removeItem(KEY);
  };

  return { recentSearches, addSearch, clearSearches };
};
