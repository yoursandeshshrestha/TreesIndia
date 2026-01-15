import AsyncStorage from '@react-native-async-storage/async-storage';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface CacheConfig {
  ttl: number; // Time to live in milliseconds
}

const DEFAULT_TTL = 30 * 60 * 1000; // 30 minutes

/**
 * Cache utility for storing and retrieving data with TTL support
 */
class CacheManager {
  private prefix = '@TreesIndia:cache:';

  /**
   * Get cached data if available and not expired
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const cacheKey = this.prefix + key;
      const cached = await AsyncStorage.getItem(cacheKey);

      if (!cached) {
        return null;
      }

      const entry: CacheEntry<T> = JSON.parse(cached);
      const now = Date.now();

      // Check if cache is expired
      if (now > entry.expiresAt) {
        // Cache expired, remove it
        await AsyncStorage.removeItem(cacheKey);
        return null;
      }

      return entry.data;
    } catch (error) {
      // Error handling
      return null;
    }
  }

  /**
   * Set data in cache with TTL
   */
  async set<T>(key: string, data: T, config?: CacheConfig): Promise<void> {
    try {
      const ttl = config?.ttl || DEFAULT_TTL;
      const now = Date.now();

      const entry: CacheEntry<T> = {
        data,
        timestamp: now,
        expiresAt: now + ttl,
      };

      const cacheKey = this.prefix + key;
      await AsyncStorage.setItem(cacheKey, JSON.stringify(entry));
    } catch (error) {
      // Error handling
    }
  }

  /**
   * Check if cache exists and is valid
   */
  async has(key: string): Promise<boolean> {
    const data = await this.get(key);
    return data !== null;
  }

  /**
   * Remove specific cache entry
   */
  async remove(key: string): Promise<void> {
    try {
      const cacheKey = this.prefix + key;
      await AsyncStorage.removeItem(cacheKey);
    } catch (error) {
      // Error handling
    }
  }

  /**
   * Clear all cache entries
   */
  async clear(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter((key) => key.startsWith(this.prefix));
      await AsyncStorage.multiRemove(cacheKeys);
    } catch (error) {
      // Error handling
    }
  }

  /**
   * Get cache timestamp (when it was last set)
   */
  async getTimestamp(key: string): Promise<number | null> {
    try {
      const cacheKey = this.prefix + key;
      const cached = await AsyncStorage.getItem(cacheKey);

      if (!cached) {
        return null;
      }

      const entry: CacheEntry<unknown> = JSON.parse(cached);
      return entry.timestamp;
    } catch (error) {
      // Error handling
      return null;
    }
  }
}

// Export singleton instance
export const cache = new CacheManager();

// Cache TTL configurations for different data types
export const CACHE_TTL = {
  // Static content - long cache
  CATEGORIES: 6 * 60 * 60 * 1000, // 6 hours
  HOMEPAGE_ICONS: 6 * 60 * 60 * 1000, // 6 hours

  // Dynamic content - medium cache
  BANNERS: 1 * 60 * 60 * 1000, // 1 hour
  POPULAR_SERVICES: 30 * 60 * 1000, // 30 minutes

  // Frequently changing - short cache
  PROPERTIES: 15 * 60 * 1000, // 15 minutes
  SERVICES: 15 * 60 * 1000, // 15 minutes
  PROJECTS: 15 * 60 * 1000, // 15 minutes
  WORKERS: 30 * 60 * 1000, // 30 minutes
  VENDORS: 30 * 60 * 1000, // 30 minutes
};

// Cache keys
export const CACHE_KEYS = {
  BANNERS: 'banners',
  CATEGORIES: 'categories',
  HOMEPAGE_ICONS: 'homepage_icons',
  POPULAR_SERVICES: 'popular_services',
  HOME_SERVICES: 'home_services',
  CONSTRUCTION_SERVICES: 'construction_services',
  FIXED_PRICE_SERVICES: 'fixed_price_services',
  INQUIRY_SERVICES: 'inquiry_services',
  PROPERTIES: 'properties',
  PROPERTIES_2BHK: 'properties_2bhk',
  PROPERTIES_3BHK: 'properties_3bhk',
  PROPERTIES_UNDER_10K: 'properties_under_10k',
  PROJECTS: 'projects',
  TOP_WORKERS: 'top_workers',
  TOP_VENDORS: 'top_vendors',
};
