import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export const checkRedisConnection = async () => {
  try {
    const startTime = Date.now();
    await redis.ping();
    const latency = Date.now() - startTime;

    return {
      isConnected: true,
      latency,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Redis connection failed:", error);
    return {
      isConnected: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    };
  }
};

export default redis;
