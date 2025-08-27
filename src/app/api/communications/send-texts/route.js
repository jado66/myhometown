// src\app\api\communications\send-texts\route.js
import { sendTextWithStream } from "@/util/communication/sendTexts";
import { completeStream, sendMessageToStream } from "./stream/route";

export const maxDuration = 60;
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req) {
  const url = new URL(req.url);
  const messageId = url.searchParams.get("messageId");

  if (!messageId) {
    return new Response(JSON.stringify({ error: "No messageId provided" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { message, recipients, mediaUrls } = await req.json();

  try {
    // Process messages sequentially
    for (const recipient of recipients) {
      try {
        const result = await sendTextWithStream({
          message,
          recipient: {
            phone: recipient.label, // Changed from label to value
            name: recipient.label || recipient.value,
          },
          mediaUrls,
          messageId,
        });

        // Send status update to stream
        await sendMessageToStream(messageId, {
          type: "status",
          status: "success",
          recipient: recipient.value,
          messageId,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        console.error(`Error sending to ${recipient.label}:`, error);

        // Send failure status to stream
        await sendMessageToStream(messageId, {
          type: "status",
          status: "failed",
          recipient: recipient.value,
          error: error.message,
          messageId,
          timestamp: new Date().toISOString(),
        });
      }
    }

    // Mark stream as complete
    await completeStream(messageId);

    return new Response(
      JSON.stringify({
        success: true,
        messageId,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in send-texts API:", error);

    // Ensure stream completion even on error
    await completeStream(messageId);

    return new Response(
      JSON.stringify({
        error: error.message,
        messageId,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
