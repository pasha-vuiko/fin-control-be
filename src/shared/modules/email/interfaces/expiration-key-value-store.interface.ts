export interface IExpirationKeyValueStore {
  checkIfExists(cacheKey: string): Promise<boolean>;
  set<T>(cacheKey: string, value: T, ttl: number): Promise<T>;
  update<T>(key: string, value: T): Promise<T>;
  get<T>(cacheKey: string): Promise<T | null>;
  delete(cacheKey: string): Promise<boolean>;
}
