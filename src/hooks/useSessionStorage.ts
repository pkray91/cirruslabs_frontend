import { useState, useEffect } from 'react';

/**
 * Custom hook to persist state in sessionStorage
 * Data persists during navigation but clears on page refresh
 */
export function useSessionStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  // Always initialize with initialValue to avoid hydration mismatch
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  // Load from sessionStorage after mount (client-side only)
  useEffect(() => {
    try {
      const item = globalThis.window.sessionStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item));
      }
    } catch (error) {
      console.warn(`Error loading sessionStorage key "${key}":`, error);
    }
  }, [key]);

  // Update sessionStorage when state changes
  const setValue = (value: T | ((prev: T) => T)) => {
    try {
      // Allow value to be a function for same API as useState
      const valueToStore = typeof value === 'function' ? (value as (prev: T) => T)(storedValue) : value;
      
      setStoredValue(valueToStore);
      
      if (globalThis.window !== undefined) {
        globalThis.window.sessionStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.warn(`Error saving to sessionStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
}

/**
 * Clear specific sessionStorage key
 */
export function clearSessionStorage(key: string) {
  if (globalThis.window !== undefined) {
    globalThis.window.sessionStorage.removeItem(key);
  }
}

/**
 * Clear all sessionStorage for the app
 */
export function clearAllSessionStorage() {
  if (globalThis.window !== undefined) {
    // Get all keys that belong to our app
    const keys = Object.keys(globalThis.window.sessionStorage);
    keys.forEach(key => {
      if (key.startsWith('guardai_')) {
        globalThis.window.sessionStorage.removeItem(key);
      }
    });
  }
}
