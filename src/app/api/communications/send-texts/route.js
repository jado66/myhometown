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

  const { message, recipients } = await req.json();

  console.log(JSON.stringify({ message, recipients }));

  const sendWithDelay = async (recipient, index) => {
    try {
      // Add delay between messages to prevent rate limiting
      await new Promise((resolve) => setTimeout(resolve, index * 200));

      const phoneNumber = recipient.value;

      console.log("Sending message to:", phoneNumber);

      const messageResponse = await client.messages.create({
        body: message,
        to: phoneNumber,
        from: process.env.TWILIO_PHONE_NUMBER,
      });

      const timestamp = new Date().toISOString();
      console.log("Created timestamp:", timestamp); // Debug log

      const result = {
        recipient: recipient.label || recipient.name,
        status: "success",
        messageId: messageResponse.sid,
        timestamp: timestamp,
      };

      console.log("Sending result to stream:", result); // Debug log
      await sendMessageToStream(messageId, result);
      return true;
    } catch (error) {
      const timestamp = new Date().toISOString();
      console.log("Created error timestamp:", timestamp); // Debug log

      const result = {
        recipient: recipient.label || recipient.name,
        status: "failed",
        error: error.message,
        timestamp: timestamp,
      };

      console.log("Sending error result to stream:", result); // Debug log
      await sendMessageToStream(messageId, result);
      return false;
    }
  };

  try {
    const sendPromises = recipients.map(sendWithDelay);
    await Promise.all(sendPromises);

    // Complete the stream
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
