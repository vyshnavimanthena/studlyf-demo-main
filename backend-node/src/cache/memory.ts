class MemoryCache {
  private cache = new Map<string, { value: unknown; expiry: number }>();

  public set(key: string, value: unknown, ttlSeconds = 60): void {
    const expiry = Date.now() + ttlSeconds * 1000;
    this.cache.set(key, { value, expiry });
  }

  public get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    return item.value as T;
  }

  public delete(key: string): void {
    this.cache.delete(key);
  }

  public clear(): void {
    this.cache.clear();
  }
}

export const memoryCache = new MemoryCache();
