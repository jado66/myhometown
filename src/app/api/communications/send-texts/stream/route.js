// src\app\api\communications\send-texts\stream\route.js
import { headers } from "next/headers";
import redis from "@/util/redis/redis";

export const maxDuration = 60;
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Configuration constants
const POLL_INTERVAL = 100; // Back to 100ms for faster response
const MAX_STREAM_DURATION = 10 * 60 * 1000; // Increased to 10 minutes
const HEARTBEAT_INTERVAL = 30000; // 30 seconds
const HEARTBEAT_TIMEOUT = 120000; // Increased to 2 minutes
const REDIS_KEY_TTL = 600; // Increased to 10 minutes
const GRACE_PERIOD = 5000; // 5 second grace period for completion

// Helper to generate Redis keys
const getStreamKey = (messageId) => `stream:${messageId}`;
const getControllerKey = (messageId) => `controller:${messageId}`;
const getUserStreamKey = (userId) => `user-stream:${userId}`;
const getStreamMonitorKey = () =>
  `stream-monitor:${new Date().toISOString().split("T")[0]}`; // Daily counter

export async function GET(req) {
  const url = new URL(req.url);
  const messageId = url.searchParams.get("messageId");
  const userId = url.searchParams.get("userId");

  if (!messageId) {
    return new Response("Message ID is required", { status: 400 });
  }

  const streamKey = getStreamKey(messageId);
  const controllerKey = getControllerKey(messageId);

  // Check for existing stream (connection limit) - make this less strict
  if (userId) {
    const userStreamKey = getUserStreamKey(userId);
    const existingStream = await redis.get(userStreamKey);

    if (existingStream && existingStream !== messageId) {
      console.log(
        `User ${userId} has another stream (${existingStream}), but allowing new one`
      );
      // Instead of blocking, just update to new stream
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
      let completionRequested = false;
      let graceTimeout = null;

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

        if (graceTimeout) {
          clearTimeout(graceTimeout);
          graceTimeout = null;
        }

        try {
          const keysToDelete = [streamKey, controllerKey];
          if (userId) {
            keysToDelete.push(getUserStreamKey(userId));
          }

          // Delay cleanup slightly to ensure final messages are sent
          await new Promise((resolve) => setTimeout(resolve, 500));

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
          lastHeartbeat = Date.now(); // Reset heartbeat on successful send
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

          // Set up heartbeat - less aggressive
          heartbeatInterval = setInterval(() => {
            if (!isActive) return;

            // Only send heartbeat if we haven't sent any messages recently
            const timeSinceLastMessage = Date.now() - lastHeartbeat;
            if (timeSinceLastMessage > HEARTBEAT_INTERVAL) {
              sendMessage({
                type: "heartbeat",
                timestamp: new Date().toISOString(),
              });
            }
          }, HEARTBEAT_INTERVAL);

          // Start polling for messages
          pollInterval = setInterval(async () => {
            if (!isActive) return;

            pollCount++;

            // Only refresh TTL occasionally to reduce Redis load
            if (pollCount % 50 === 0) {
              try {
                await redis.expire(streamKey, REDIS_KEY_TTL);
              } catch (err) {
                console.error(
                  `Failed to refresh TTL for stream ${messageId}:`,
                  err
                );
              }
            }

            // Check stream timeout - but be lenient
            const streamAge = Date.now() - streamStartTime;
            if (streamAge > MAX_STREAM_DURATION && !completionRequested) {
              console.log(
                `Stream ${messageId} exceeded max duration (${streamAge}ms), waiting for completion`
              );

              // Give extra time for completion
              completionRequested = true;
              graceTimeout = setTimeout(async () => {
                sendMessage({
                  type: "timeout",
                  reason: "Stream duration exceeded",
                  timestamp: new Date().toISOString(),
                });
                await cleanup();
                controller.close();
              }, GRACE_PERIOD);
              return;
            }

            // Check heartbeat timeout - but only if we're not actively sending
            const heartbeatAge = Date.now() - lastHeartbeat;
            if (heartbeatAge > HEARTBEAT_TIMEOUT && messagesSent > 0) {
              console.log(
                `Stream ${messageId} heartbeat timeout (${heartbeatAge}ms), but giving grace period`
              );

              // Give a grace period in case messages are still being processed
              if (!graceTimeout) {
                graceTimeout = setTimeout(async () => {
                  sendMessage({
                    type: "timeout",
                    reason: "Heartbeat timeout",
                    timestamp: new Date().toISOString(),
                  });
                  await cleanup();
                  controller.close();
                }, GRACE_PERIOD);
              }
              return;
            }

            try {
              // Don't check stream status every time to reduce Redis load
              if (pollCount % 100 === 0) {
                const streamStatus = await redis.get(streamKey);
                if (!streamStatus && messagesSent > 0) {
                  console.log(
                    `Stream ${messageId} key expired in Redis, but continuing`
                  );
                  // Re-create the key instead of closing
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
                }
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

                        // Send a final acknowledgment
                        sendMessage({
                          type: "acknowledged",
                          timestamp: new Date().toISOString(),
                        });

                        // Give a small delay for the acknowledgment to be sent
                        setTimeout(async () => {
                          await cleanup();
                          controller.close();
                        }, 100);
                        return;
                      }
                    } catch (e) {
                      // Not JSON, continue
                    }
                  }
                }

                // Clear any grace timeout if we're receiving messages
                if (graceTimeout) {
                  clearTimeout(graceTimeout);
                  graceTimeout = null;
                  completionRequested = false;
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

    // Check if stream is still active - but don't fail if not found
    const streamStatus = await redis.get(streamKey);
    if (!streamStatus) {
      console.log(
        `Stream ${messageId} not active, but attempting to send anyway`
      );
      // Try to recreate the stream key
      await redis.set(
        streamKey,
        JSON.stringify({
          status: "active",
          messageId,
          recreated: true,
        }),
        { ex: 60 } // Short TTL for recreated streams
      );
    }

    await redis.rpush(controllerKey, JSON.stringify(data));

    // Also set a TTL on the controller key to prevent orphaned keys
    await redis.expire(controllerKey, 60);

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

    // Send completion message regardless of stream status
    await redis.rpush(
      controllerKey,
      JSON.stringify({
        type: "complete",
        timestamp: new Date().toISOString(),
      })
    );

    // Set TTL to ensure cleanup even if stream is disconnected
    await redis.expire(controllerKey, 10);

    // Give more time for the completion message to be processed
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Don't immediately delete keys - let the stream handle it
    console.log(`Completion message sent for stream ${messageId}`);

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
