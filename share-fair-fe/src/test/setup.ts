// Ensure localStorage is available before any module imports that depend on it (e.g. uiSlice)
const _store: Record<string, string> = {};
const localStorageImpl = {
  getItem: (key: string) => _store[key] ?? null,
  setItem: (key: string, value: string) => { _store[key] = value; },
  removeItem: (key: string) => { delete _store[key]; },
  clear: () => { Object.keys(_store).forEach((k) => delete _store[k]); },
  get length() { return Object.keys(_store).length; },
  key: (index: number) => Object.keys(_store)[index] ?? null,
};

try {
  if (!globalThis.localStorage || typeof globalThis.localStorage.getItem !== 'function') {
    Object.defineProperty(globalThis, 'localStorage', {
      value: localStorageImpl,
      writable: true,
      configurable: true,
    });
  }
} catch {
  Object.defineProperty(globalThis, 'localStorage', {
    value: localStorageImpl,
    writable: true,
    configurable: true,
  });
}

import '@testing-library/jest-dom';
