import { headers } from "next/headers";

// Store active connections in memory
const activeConnections = new Map();

export const maxDuration = 60;
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req) {
  const url = new URL(req.url);
  const messageId = url.searchParams.get("messageId");

  if (!messageId) {
    return new Response("Message ID is required", { status: 400 });
  }

  // Create a new readable stream
  const stream = new ReadableStream({
    start(controller) {
      console.log("Starting stream for messageId:", messageId);

      // Store controller reference
      activeConnections.set(messageId, controller);

      // Send initial message
      const initialMessage = `data: ${JSON.stringify({
        type: "connected",
      })}\n\n`;
      controller.enqueue(new TextEncoder().encode(initialMessage));

      // Handle client disconnect
      req.signal.addEventListener("abort", () => {
        console.log("Client disconnected, cleaning up:", messageId);
        activeConnections.delete(messageId);
        controller.close();
      });
    },
    cancel() {
      console.log("Stream cancelled for messageId:", messageId);
      activeConnections.delete(messageId);
    },
  });

  // Create and return the response
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
  const controller = activeConnections.get(messageId);
  if (controller) {
    const message = `data: ${JSON.stringify(data)}\n\n`;
    controller.enqueue(new TextEncoder().encode(message));
    return true;
  }
  return false;
}

// Helper function to complete a stream
export async function completeStream(messageId) {
  const controller = activeConnections.get(messageId);
  if (controller) {
    const completeMessage = `event: complete\ndata: true\n\n`;
    controller.enqueue(new TextEncoder().encode(completeMessage));
    controller.close();
    activeConnections.delete(messageId);
    return true;
  }
  return false;
}
