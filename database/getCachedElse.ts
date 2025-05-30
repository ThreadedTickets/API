import mongoose from "mongoose";
import redis from "./redis";

/**
 * Get cached data from Redis or compute and cache it if not found.
 *
 * @param key The Redis key to search
 * @param ttl The time to cache the result for in seconds
 * @param functionIfNotFound A function to run if the data requested is not found in cache
 * @returns The data and whether it was from cache or not
 */
export const getCachedDataElse = async <T>(
  key: string,
  ttl: number,
  functionIfNotFound: () => Promise<T>,
  hydrateModel?: mongoose.Model<any>
): Promise<{ cached: boolean; data: T }> => {
  const cached = await redis.get(key);
  if (cached) {
    const parsed = JSON.parse(cached);
    return {
      cached: true,
      data: hydrateModel ? hydrateModel.hydrate(parsed) : (parsed as T),
    };
  }

  const functionResult = await functionIfNotFound();
  await redis.set(key, JSON.stringify(functionResult), "EX", ttl);

  return {
    cached: false,
    data: functionResult,
  };
};
