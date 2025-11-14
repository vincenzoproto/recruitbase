import { useEffect, useState, useCallback } from "react";

interface CacheConfig {
  key: string;
  ttl?: number; // Time to live in milliseconds (default: 5 minutes)
}

interface CachedData<T> {
  data: T;
  timestamp: number;
}

const cache = new Map<string, CachedData<any>>();

export const useCachedQuery = <T>(
  queryFn: () => Promise<T>,
  config: CacheConfig
) => {
  const { key, ttl = 5 * 60 * 1000 } = config;
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);

      // Check cache first
      if (!forceRefresh) {
        const cached = cache.get(key);
        if (cached && Date.now() - cached.timestamp < ttl) {
          setData(cached.data);
          setLoading(false);
          return;
        }
      }

      // Fetch fresh data
      const result = await queryFn();
      
      // Update cache
      cache.set(key, {
        data: result,
        timestamp: Date.now(),
      });

      setData(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [key, queryFn, ttl]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = useCallback(() => {
    return fetchData(true);
  }, [fetchData]);

  const invalidate = useCallback(() => {
    cache.delete(key);
  }, [key]);

  return { data, loading, error, refetch, invalidate };
};

export const clearCache = (key?: string) => {
  if (key) {
    cache.delete(key);
  } else {
    cache.clear();
  }
};
