import { headers } from "next/headers";
import redis from "@/util/redis/redis";

export const maxDuration = 60;
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Helper to generate Redis keys
const getStreamKey = (messageId) => `stream:${messageId}`;
const getControllerKey = (messageId) => `controller:${messageId}`;

export async function GET(req) {
  const url = new URL(req.url);
  const messageId = url.searchParams.get("messageId");

  if (!messageId) {
    return new Response("Message ID is required", { status: 400 });
  }

  const streamKey = getStreamKey(messageId);
  const controllerKey = getControllerKey(messageId);

  // Create a new readable stream
  const stream = new ReadableStream({
    start(controller) {
      let isActive = true;
      let pollInterval;

      const cleanup = async () => {
        isActive = false;
        if (pollInterval) {
          clearInterval(pollInterval);
        }
        try {
          await Promise.all([redis.del(streamKey), redis.del(controllerKey)]);
        } catch (error) {
          console.error("Error cleaning up Redis keys:", error);
        }
      };

      const sendMessage = (data) => {
        if (!isActive) return;
        try {
          const message =
            typeof data === "string" ? data : JSON.stringify(data);
          controller.enqueue(new TextEncoder().encode(`data: ${message}\n\n`));
        } catch (error) {
          // Ignore controller closed errors
          if (error.code !== "ERR_INVALID_STATE") {
            console.error("Error sending message:", error);
          }
        }
      };

      // Initialize the stream
      (async () => {
        try {
          // Set initial Redis state
          await redis.set(streamKey, "active", { ex: 300 });

          // Send initial connection message
          sendMessage({ type: "connected" });

          // Start polling for messages
          pollInterval = setInterval(async () => {
            if (!isActive) return;

            try {
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
                  }
                }
              }
            } catch (error) {
              console.error("Error polling Redis:", error);
            }
          }, 100);

          // Handle client disconnect
          req.signal.addEventListener("abort", async () => {
            if (isActive) {
              await cleanup();
              try {
                controller.close();
              } catch (error) {
                // Ignore controller closed errors
                if (error.code !== "ERR_INVALID_STATE") {
                  console.error("Error closing controller:", error);
                }
              }
            }
          });
        } catch (error) {
          console.error("Error initializing stream:", error);
          cleanup();
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

// Helper function to send messages through the stream
export async function sendMessageToStream(messageId, data) {
  try {
    const streamKey = getStreamKey(messageId);
    const controllerKey = getControllerKey(messageId);

    // Check if stream is still active
    const isActive = await redis.get(streamKey);
    if (!isActive) {
      return false;
    }

    await redis.rpush(controllerKey, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error("Error sending message to stream:", error);
    return false;
  }
}

// Helper function to complete a stream
export async function completeStream(messageId) {
  try {
    const streamKey = getStreamKey(messageId);
    const controllerKey = getControllerKey(messageId);

    // Check if stream is still active
    const isActive = await redis.get(streamKey);
    if (!isActive) {
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
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Clean up Redis keys
    await Promise.all([redis.del(streamKey), redis.del(controllerKey)]);

    return true;
  } catch (error) {
    console.error("Error completing stream:", error);
    return false;
  }
}
