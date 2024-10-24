import twilio from "twilio";
import { headers } from "next/headers";
import { sendMessageToStream, completeStream } from "./stream/route";
export const config = {
  maxDuration: 60,
};

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

  const { message, recipients, mediaUrls } = await req.json();

  console.log(
    "Received payload:",
    JSON.stringify({ message, recipients, mediaUrls }, null, 2)
  );

  const validateAndEncodeMediaUrl = (url) => {
    try {
      // First decode the URL to prevent double-encoding
      const decodedUrl = decodeURIComponent(url);

      // Split the URL into parts
      const urlObj = new URL(decodedUrl);

      // Properly encode each path segment
      const pathSegments = urlObj.pathname
        .split("/")
        .map((segment) => encodeURIComponent(segment))
        .join("/");

      // Reconstruct the URL with encoded path
      const encodedUrl = `${urlObj.protocol}//${urlObj.host}${pathSegments}`;

      // Validate the encoded URL
      if (
        urlObj.protocol !== "https:" ||
        !urlObj.hostname.includes("amazonaws.com")
      ) {
        return null;
      }

      console.log("Original URL:", url);
      console.log("Encoded URL:", encodedUrl);

      return encodedUrl;
    } catch (error) {
      console.error("URL validation error:", error);
      return null;
    }
  };

  const sendWithDelay = async (recipient, index) => {
    let messageOptions;
    try {
      await new Promise((resolve) => setTimeout(resolve, index * 200));

      const phoneNumber = recipient.value;
      const formattedPhone = phoneNumber.replace(/\D/g, "");

      messageOptions = {
        body: message,
        to:
          formattedPhone.length === 10
            ? `+1${formattedPhone}`
            : `+${formattedPhone}`,
        from: process.env.TWILIO_PHONE_NUMBER,
      };

      if (mediaUrls && Array.isArray(mediaUrls) && mediaUrls.length > 0) {
        // Process and validate URLs
        const validUrls = mediaUrls
          .filter(Boolean)
          .map(validateAndEncodeMediaUrl)
          .filter(Boolean);

        if (validUrls.length > 0) {
          messageOptions.mediaUrl = validUrls;
          console.log("Final encoded mediaUrls:", validUrls);
        }

        // Verify URLs are accessible
        for (const url of validUrls) {
          try {
            const response = await fetch(url, { method: "HEAD" });
            if (!response.ok) {
              console.warn(`Warning: Media URL is not accessible: ${url}`);
              throw new Error(`Media URL is not accessible: ${url}`);
            }
          } catch (error) {
            console.error("URL verification error:", error);
            throw new Error(`Failed to verify media URL: ${error.message}`);
          }
        }
      }

      console.log(
        "Sending message with options:",
        JSON.stringify(messageOptions, null, 2)
      );

      const messageResponse = await client.messages.create(messageOptions);

      const timestamp = new Date().toISOString();
      console.log("Message sent successfully:", messageResponse.sid);

      const result = {
        recipient: recipient.label || recipient.name,
        status: "success",
        messageId: messageResponse.sid,
        timestamp: timestamp,
        mediaCount: messageOptions.mediaUrl
          ? messageOptions.mediaUrl.length
          : 0,
      };

      await sendMessageToStream(messageId, result);
      return true;
    } catch (error) {
      console.error("Twilio Error Details:", {
        message: error.message,
        code: error.code,
        moreInfo: error.moreInfo,
        status: error.status,
        details: error,
      });

      const timestamp = new Date().toISOString();
      const result = {
        recipient: recipient.label || recipient.name,
        status: "failed",
        error: error.message,
        timestamp: timestamp,
        details: error.code ? `Twilio Error Code: ${error.code}` : undefined,
        mediaUrls: messageOptions?.mediaUrl,
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
