import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresIn: number;
}

interface AppCacheContextType {
  getCache: <T>(key: string) => T | null;
  setCache: <T>(key: string, data: T, expiresIn?: number) => void;
  clearCache: (key?: string) => void;
  invalidateCache: (pattern: string) => void;
}

const AppCacheContext = createContext<AppCacheContextType | undefined>(undefined);

const DEFAULT_CACHE_TIME = 5 * 60 * 1000; // 5 minutes

export const AppCacheProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const cacheRef = useRef<Map<string, CacheEntry<any>>>(new Map());

  const getCache = useCallback(<T,>(key: string): T | null => {
    const entry = cacheRef.current.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > entry.expiresIn) {
      cacheRef.current.delete(key);
      return null;
    }

    return entry.data as T;
  }, []);

  const setCache = useCallback(<T,>(key: string, data: T, expiresIn = DEFAULT_CACHE_TIME) => {
    cacheRef.current.set(key, {
      data,
      timestamp: Date.now(),
      expiresIn
    });
  }, []);

  const clearCache = useCallback((key?: string) => {
    if (key) {
      cacheRef.current.delete(key);
    } else {
      cacheRef.current.clear();
    }
  }, []);

  const invalidateCache = useCallback((pattern: string) => {
    const keys = Array.from(cacheRef.current.keys());
    keys.forEach(key => {
      if (key.includes(pattern)) {
        cacheRef.current.delete(key);
      }
    });
  }, []);

  return (
    <AppCacheContext.Provider value={{ getCache, setCache, clearCache, invalidateCache }}>
      {children}
    </AppCacheContext.Provider>
  );
};

export const useAppCache = () => {
  const context = useContext(AppCacheContext);
  if (!context) {
    throw new Error('useAppCache must be used within AppCacheProvider');
  }
  return context;
};
