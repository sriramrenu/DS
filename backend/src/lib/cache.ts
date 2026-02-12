/**
 * Simple in-memory cache for API responses and expensive operations
 */

interface CacheEntry<T> {
    data: T;
    expiresAt: number;
}

class MemoryCache {
    private cache: Map<string, CacheEntry<any>> = new Map();

    /**
     * Get cached value by key
     * @param key Cache key
     * @returns Cached value or null if expired/not found
     */
    get<T>(key: string): T | null {
        const entry = this.cache.get(key);

        if (!entry) {
            return null;
        }

        // Check if expired
        if (Date.now() > entry.expiresAt) {
            this.cache.delete(key);
            return null;
        }

        return entry.data as T;
    }

    /**
     * Set cache value with TTL
     * @param key Cache key
     * @param data Data to cache
     * @param ttlSeconds Time to live in seconds
     */
    set<T>(key: string, data: T, ttlSeconds: number): void {
        const expiresAt = Date.now() + (ttlSeconds * 1000);
        this.cache.set(key, { data, expiresAt });
    }

    /**
     * Delete cache entry
     * @param key Cache key
     */
    delete(key: string): void {
        this.cache.delete(key);
    }

    /**
     * Clear all expired entries
     */
    cleanup(): void {
        const now = Date.now();
        for (const [key, entry] of this.cache.entries()) {
            if (now > entry.expiresAt) {
                this.cache.delete(key);
            }
        }
    }

    /**
     * Clear entire cache
     */
    clear(): void {
        this.cache.clear();
    }

    /**
     * Get cache statistics
     */
    stats(): { size: number; keys: string[] } {
        return {
            size: this.cache.size,
            keys: Array.from(this.cache.keys())
        };
    }
}

// Singleton instance
export const cache = new MemoryCache();

// Cleanup expired entries every 5 minutes
setInterval(() => {
    cache.cleanup();
}, 5 * 60 * 1000);
