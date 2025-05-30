import Redis from "ioredis";
import "dotenv/config";

const redis = new Redis({
  host: process.env["REDIS_HOST"],
  port: parseInt(process.env["REDIS_PORT"]!, 10),
  password: process.env["REDIS_PASSWORD"],
});

redis
  .once("ready", () => console.log("Redis ready"))
  .on("error", (err) => console.error("Redis", "Error", err.message))
  .on("close", () => console.warn("Redis", "Warn", "Redis connection closed"))
  .on("connect", () => console.log("Redis connected"));

export default redis;
