// src/app/api/communications/send-texts/monitor/route.js
import redis from "@/util/redis/redis";

export const dynamic = "force-dynamic";

// Get monitoring stats
export async function GET(req) {
  try {
    // Get all active stream keys
    const streamKeys = await redis.keys("stream:*");
    const userStreamKeys = await redis.keys("user-stream:*");
    const controllerKeys = await redis.keys("controller:*");

    // Get daily counter
    const monitorKey = `stream-monitor:${
      new Date().toISOString().split("T")[0]
    }`;
    const dailyCounter = (await redis.get(monitorKey)) || 0;

    // Get details for each active stream
    const streamDetails = await Promise.all(
      streamKeys.map(async (key) => {
        try {
          const streamData = await redis.get(key);
          const ttl = await redis.ttl(key);

          let parsedData = {};
          try {
            parsedData = JSON.parse(streamData);
          } catch (e) {
            parsedData = { raw: streamData };
          }

          return {
            key,
            data: parsedData,
            ttl,
            messageId: key.replace("stream:", ""),
          };
        } catch (error) {
          return {
            key,
            error: error.message,
          };
        }
      })
    );

    // Calculate stream ages
    const now = Date.now();
    const streamAges = streamDetails
      .map((stream) => {
        if (stream.data?.startTime) {
          return {
            messageId: stream.messageId,
            age: Math.round((now - stream.data.startTime) / 1000), // seconds
            userId: stream.data.userId,
          };
        }
        return null;
      })
      .filter(Boolean);

    // Upstash Redis does not support the INFO command, so commandStats are omitted.

    return new Response(
      JSON.stringify(
        {
          timestamp: new Date().toISOString(),
          activeStreams: {
            count: streamKeys.length,
            details: streamDetails,
            ages: streamAges,
          },
          userStreams: {
            count: userStreamKeys.length,
            keys: userStreamKeys,
          },
          controllerQueues: {
            count: controllerKeys.length,
            keys: controllerKeys,
          },
          dailyStreamCounter: parseInt(dailyCounter),
          // commandStats omitted due to Upstash limitations
          health: {
            orphanedControllers: controllerKeys.length > streamKeys.length,
            longRunningStreams: streamAges.filter((s) => s.age > 300).length, // > 5 minutes
            recommendation:
              streamKeys.length > 10
                ? "High number of active streams detected"
                : "Normal",
          },
        },
        null,
        2
      ),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
        },
      }
    );
  } catch (error) {
    console.error("Error monitoring streams:", error);
    return new Response(
      JSON.stringify({
        error: error.message,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

// Clean up orphaned keys
export async function POST(req) {
  try {
    const { action } = await req.json();

    if (action === "cleanup-orphaned") {
      // Find orphaned controller keys (no matching stream)
      const streamKeys = await redis.keys("stream:*");
      const controllerKeys = await redis.keys("controller:*");

      const activeMessageIds = new Set(
        streamKeys.map((key) => key.replace("stream:", ""))
      );

      const orphanedControllers = controllerKeys.filter((key) => {
        const messageId = key.replace("controller:", "");
        return !activeMessageIds.has(messageId);
      });

      // Delete orphaned controllers
      if (orphanedControllers.length > 0) {
        await Promise.all(orphanedControllers.map((key) => redis.del(key)));
      }

      // Find and clean up expired streams
      const expiredStreams = [];
      for (const streamKey of streamKeys) {
        const ttl = await redis.ttl(streamKey);
        if (ttl <= 0) {
          expiredStreams.push(streamKey);
          const messageId = streamKey.replace("stream:", "");
          await Promise.all([
            redis.del(streamKey),
            redis.del(`controller:${messageId}`),
          ]);
        }
      }

      return new Response(
        JSON.stringify({
          success: true,
          cleaned: {
            orphanedControllers: orphanedControllers.length,
            expiredStreams: expiredStreams.length,
          },
          timestamp: new Date().toISOString(),
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response("Invalid action", { status: 400 });
  } catch (error) {
    console.error("Error in cleanup:", error);
    return new Response(
      JSON.stringify({
        error: error.message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
