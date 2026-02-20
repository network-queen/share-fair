import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Sensitive data (tokens) → SecureStore (encrypted)
export const secureGet = (key: string): Promise<string | null> =>
  SecureStore.getItemAsync(key);

export const secureSet = (key: string, value: string): Promise<void> =>
  SecureStore.setItemAsync(key, value);

export const secureDel = (key: string): Promise<void> =>
  SecureStore.deleteItemAsync(key);

// Non-sensitive data → AsyncStorage
export const storageGet = (key: string): Promise<string | null> =>
  AsyncStorage.getItem(key);

export const storageSet = (key: string, value: string): Promise<void> =>
  AsyncStorage.setItem(key, value);

export const storageDel = (key: string): Promise<void> =>
  AsyncStorage.removeItem(key);
