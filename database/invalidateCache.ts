import redis from "./redis";

export const invalidateCache = (key: string) => {
  redis.del(key);
};
