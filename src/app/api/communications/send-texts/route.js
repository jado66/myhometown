import twilio from "twilio";
import { headers } from "next/headers";
import { sendMessageToStream, completeStream } from "./stream/route";
export const maxDuration = 60;
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

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

  const sendWithDelay = async (recipient, index) => {
    let messageOptions;
    try {
      // Ensure stream is active before proceeding
      await sendMessageToStream(messageId, {
        type: "status",
        message: `Processing message ${index + 1} of ${recipients.length}`,
      });

      // Convert phoneNumber to a string for replace to work
      const phoneNumber = recipient.label.toString();
      const formattedPhone = phoneNumber.replace(/\D/g, "");

      messageOptions = {
        body: message,
        to:
          formattedPhone.length === 10
            ? `+1${formattedPhone}`
            : `+${formattedPhone}`,
        from: process.env.TWILIO_PHONE_NUMBER,
      };

      if (mediaUrls?.length > 0) {
        messageOptions.mediaUrl = mediaUrls.filter(Boolean).map((url) => {
          try {
            return decodeURIComponent(url);
          } catch {
            return url;
          }
        });
      }

      // Send message through Twilio
      const messageResponse = await client.messages.create(messageOptions);

      const timestamp = new Date().toISOString();

      // Immediately send success status to stream
      const success = await sendMessageToStream(messageId, {
        recipient: recipient.label || recipient.name,
        status: "success",
        messageId: messageResponse.sid,
        timestamp,
        mediaCount: messageOptions.mediaUrl?.length || 0,
      });

      if (!success) {
        throw new Error("Failed to send status to stream");
      }

      return true;
    } catch (error) {
      console.error("Error in sendWithDelay:", error);

      // Try to send error status to stream
      await sendMessageToStream(messageId, {
        recipient: recipient.label || recipient.name,
        status: "failed",
        error: error.message,
        timestamp: new Date().toISOString(),
      });

      return false;
    }
  };

  try {
    // Process one message at a time
    for (const [index, recipient] of recipients.entries()) {
      await sendWithDelay(recipient, index);
    }

    // Send completion message
    const completionSent = await sendMessageToStream(messageId, {
      type: "complete",
      timestamp: new Date().toISOString(),
    });

    if (!completionSent) {
      throw new Error("Failed to send completion status");
    }

    // Close the stream
    await completeStream(messageId);

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        messageId,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error in send-texts API:", error);

    // Try to send error status to stream
    await sendMessageToStream(messageId, {
      type: "error",
      error: error.message,
      timestamp: new Date().toISOString(),
    });

    // Ensure stream is closed
    await completeStream(messageId);

    return new Response(
      JSON.stringify({
        error: error.message,
        messageId,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
