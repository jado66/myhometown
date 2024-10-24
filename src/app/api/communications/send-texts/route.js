import twilio from "twilio";
import { headers } from "next/headers";
import { sendMessageToStream, completeStream } from "./stream/route";

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

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

  const { message, recipients, mediaUrl } = await req.json();

  console.log(
    "Received payload:",
    JSON.stringify({ message, recipients, mediaUrl }, null, 2)
  );

  const sendWithDelay = async (recipient, index) => {
    try {
      // Add delay between messages to prevent rate limiting
      await new Promise((resolve) => setTimeout(resolve, index * 200));

      const phoneNumber = recipient.value;

      console.log("Sending message to:", phoneNumber);

      // Construct the message options
      const messageOptions = {
        body: message,
        to: phoneNumber,
        from: process.env.TWILIO_PHONE_NUMBER,
      };

      // Add mediaUrl if present
      if (mediaUrl) {
        // Ensure the URL is properly encoded
        const encodedUrl = encodeURI(mediaUrl);
        console.log("Encoded media URL:", encodedUrl);
        messageOptions.mediaUrl = encodedUrl;
      }

      console.log("Message options:", messageOptions);

      const messageResponse = await client.messages.create(messageOptions);

      const timestamp = new Date().toISOString();
      console.log("Message sent successfully:", messageResponse.sid);

      const result = {
        recipient: recipient.label || recipient.name,
        status: "success",
        messageId: messageResponse.sid,
        timestamp: timestamp,
      };

      await sendMessageToStream(messageId, result);
      return true;
    } catch (error) {
      console.error("Error details:", error);

      const timestamp = new Date().toISOString();
      const result = {
        recipient: recipient.label || recipient.name,
        status: "failed",
        error: error.message,
        timestamp: timestamp,
        details: error.code ? `Twilio Error Code: ${error.code}` : undefined,
      };

      await sendMessageToStream(messageId, result);
      return false;
    }
  };

  try {
    const sendPromises = recipients.map(sendWithDelay);
    await Promise.all(sendPromises);

    await completeStream(messageId);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error sending messages:", error);

    await sendMessageToStream(messageId, {
      status: "error",
      error: error.message,
      timestamp: new Date().toISOString(),
    });

    await completeStream(messageId);

    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
