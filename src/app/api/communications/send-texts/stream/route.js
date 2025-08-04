// src\app\api\communications\send-texts\stream\route.js
import { headers } from "next/headers";
import redis from "@/util/redis/redis";

export const maxDuration = 60;
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Configuration constants
const POLL_INTERVAL = 1000; // 1 second instead of 100ms
const MAX_STREAM_DURATION = 5 * 60 * 1000; // 5 minutes
const HEARTBEAT_INTERVAL = 15000; // 15 seconds
const HEARTBEAT_TIMEOUT = 30000; // 30 seconds
const REDIS_KEY_TTL = 300; // 5 minutes

// Helper to generate Redis keys
const getStreamKey = (messageId) => `stream:${messageId}`;
const getControllerKey = (messageId) => `controller:${messageId}`;
const getUserStreamKey = (userId) => `user-stream:${userId}`;
const getStreamMonitorKey = () =>
  `stream-monitor:${new Date().toISOString().split("T")[0]}`; // Daily counter

export async function GET(req) {
  const url = new URL(req.url);
  const messageId = url.searchParams.get("messageId");
  const userId = url.searchParams.get("userId"); // Add userId to your request

  if (!messageId) {
    return new Response("Message ID is required", { status: 400 });
  }

  const streamKey = getStreamKey(messageId);
  const controllerKey = getControllerKey(messageId);

  // Check for existing stream (connection limit)
  if (userId) {
    const userStreamKey = getUserStreamKey(userId);
    const existingStream = await redis.get(userStreamKey);

    if (existingStream && existingStream !== messageId) {
      console.log(
        `User ${userId} already has an active stream: ${existingStream}`
      );
      return new Response("Stream already active for this user", {
        status: 409,
      });
    }

    // Set user stream key
    await redis.set(userStreamKey, messageId, { ex: REDIS_KEY_TTL });
  }

  // Increment stream counter for monitoring
  await redis.incr(getStreamMonitorKey());

  // Create a new readable stream
  const stream = new ReadableStream({
    start(controller) {
      let isActive = true;
      let pollInterval;
      let heartbeatInterval;
      const streamStartTime = Date.now();
      let lastHeartbeat = Date.now();
      let messagesSent = 0;
      let pollCount = 0;

      const cleanup = async () => {
        console.log(
          `Cleaning up stream ${messageId} - sent ${messagesSent} messages, polled ${pollCount} times`
        );

        isActive = false;

        if (pollInterval) {
          clearInterval(pollInterval);
          pollInterval = null;
        }

        if (heartbeatInterval) {
          clearInterval(heartbeatInterval);
          heartbeatInterval = null;
        }

        try {
          const keysToDelete = [streamKey, controllerKey];
          if (userId) {
            keysToDelete.push(getUserStreamKey(userId));
          }

          await Promise.all(keysToDelete.map((key) => redis.del(key)));

          // Decrement stream counter
          await redis.decr(getStreamMonitorKey());
        } catch (error) {
          console.error("Error cleaning up Redis keys:", error);
        }
      };

      const sendMessage = (data) => {
        if (!isActive) return false;

        try {
          const message =
            typeof data === "string" ? data : JSON.stringify(data);
          controller.enqueue(new TextEncoder().encode(`data: ${message}\n\n`));
          messagesSent++;
          return true;
        } catch (error) {
          if (error.code !== "ERR_INVALID_STATE") {
            console.error("Error sending message:", error);
          }
          return false;
        }
      };

      // Initialize the stream
      (async () => {
        try {
          // Set initial Redis state with TTL
          await redis.set(
            streamKey,
            JSON.stringify({
              status: "active",
              startTime: streamStartTime,
              messageId,
              userId: userId || "anonymous",
            }),
            { ex: REDIS_KEY_TTL }
          );

          // Send initial connection message
          sendMessage({
            type: "connected",
            messageId,
            timestamp: new Date().toISOString(),
          });

          // Set up heartbeat
          heartbeatInterval = setInterval(() => {
            if (!isActive) return;

            const heartbeatSuccess = sendMessage({
              type: "heartbeat",
              timestamp: new Date().toISOString(),
            });

            if (heartbeatSuccess) {
              lastHeartbeat = Date.now();
            }
          }, HEARTBEAT_INTERVAL);

          // Start polling for messages
          pollInterval = setInterval(async () => {
            if (!isActive) return;

            // Refresh TTL to prevent premature expiration
            try {
              await redis.expire(streamKey, REDIS_KEY_TTL);
            } catch (err) {
              console.error(`Failed to refresh TTL for stream ${messageId}:`, err);
            }

            pollCount++;

            // Check stream timeout
            const streamAge = Date.now() - streamStartTime;
            if (streamAge > MAX_STREAM_DURATION) {
              console.log(
                `Stream ${messageId} exceeded max duration (${streamAge}ms)`
              );
              sendMessage({
                type: "timeout",
                reason: "Stream duration exceeded",
                timestamp: new Date().toISOString(),
              });
              await cleanup();
              controller.close();
              return;
            }

            // Check heartbeat timeout
            const heartbeatAge = Date.now() - lastHeartbeat;
            if (heartbeatAge > HEARTBEAT_TIMEOUT) {
              console.log(
                `Stream ${messageId} heartbeat timeout (${heartbeatAge}ms)`
              );
              sendMessage({
                type: "timeout",
                reason: "Heartbeat timeout",
                timestamp: new Date().toISOString(),
              });
              await cleanup();
              controller.close();
              return;
            }

            try {
              // Check if stream is still active in Redis
              const streamStatus = await redis.get(streamKey);
              if (!streamStatus) {
                console.log(`Stream ${messageId} key expired in Redis`);
                await cleanup();
                controller.close();
                return;
              }

              // Poll for messages
              const messages = await redis.lrange(controllerKey, 0, -1);
              if (messages.length > 0) {
                // Clear messages immediately
                await redis.del(controllerKey);

                // Process unique messages
                const seen = new Set();
                for (const msg of messages) {
                  if (!seen.has(msg)) {
                    seen.add(msg);
                    sendMessage(msg);

                    // Check for completion message
                    try {
                      const parsedMsg = JSON.parse(msg);
                      if (parsedMsg.type === "complete") {
                        console.log(
                          `Stream ${messageId} received completion message`
                        );
                        await cleanup();
                        controller.close();
                        return;
                      }
                    } catch (e) {
                      // Not JSON, continue
                    }
                  }
                }
              }
            } catch (error) {
              console.error(
                `Error polling Redis for stream ${messageId}:`,
                error
              );
              // Don't close on Redis errors, just log
            }
          }, POLL_INTERVAL);

          // Handle client disconnect
          req.signal.addEventListener("abort", async () => {
            console.log(`Client disconnected from stream ${messageId}`);
            if (isActive) {
              await cleanup();
              try {
                controller.close();
              } catch (error) {
                if (error.code !== "ERR_INVALID_STATE") {
                  console.error("Error closing controller:", error);
                }
              }
            }
          });
        } catch (error) {
          console.error("Error initializing stream:", error);
          await cleanup();
          controller.error(error);
        }
      })();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}

// Export these helper functions for the messaging utility
export async function sendMessageToStream(messageId, data) {
  try {
    const streamKey = getStreamKey(messageId);
    const controllerKey = getControllerKey(messageId);

    // Check if stream is still active
    const streamStatus = await redis.get(streamKey);
    if (!streamStatus) {
      console.log(`Stream ${messageId} not active`);
      return false;
    }

    await redis.rpush(controllerKey, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error("Error sending message to stream:", error);
    return false;
  }
}

export async function completeStream(messageId) {
  try {
    const streamKey = getStreamKey(messageId);
    const controllerKey = getControllerKey(messageId);

    // Check if stream is still active
    const streamStatus = await redis.get(streamKey);
    if (!streamStatus) {
      console.log(`Stream ${messageId} already completed or not found`);
      return false;
    }

    // Send completion message
    await redis.rpush(
      controllerKey,
      JSON.stringify({
        type: "complete",
        timestamp: new Date().toISOString(),
      })
    );

    // Give time for the completion message to be sent
    await new Promise((resolve) => setTimeout(resolve, 200));

    // Clean up Redis keys
    await Promise.all([redis.del(streamKey), redis.del(controllerKey)]);

    return true;
  } catch (error) {
    console.error("Error completing stream:", error);
    return false;
  }
}

// Monitoring helper function
export async function getStreamMonitoringStats() {
  try {
    const monitorKey = getStreamMonitorKey();
    const activeStreams = (await redis.get(monitorKey)) || 0;

    // Get all stream keys to count actual active streams
    const streamPattern = "stream:*";
    const activeStreamKeys = await redis.keys(streamPattern);

    return {
      reportedActive: parseInt(activeStreams),
      actualActive: activeStreamKeys.length,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error getting monitoring stats:", error);
    return null;
  }
}
