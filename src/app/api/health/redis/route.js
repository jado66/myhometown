import { checkRedisConnection } from "@/util/redis/redis";

export const dynamic = "force-dynamic"; // Disable cache for health checks
export const revalidate = 0;

export async function GET() {
  const health = await checkRedisConnection();

  return new Response(JSON.stringify(health), {
    status: health.isConnected ? 200 : 503,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
    },
  });
}
