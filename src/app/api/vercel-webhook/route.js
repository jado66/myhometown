// src/app/api/vercel-webhook/route.js
import { sendSimpleText } from "@/util/communication/sendTexts";
import crypto from "crypto";

export const maxDuration = 30; // 30 seconds should be plenty
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Verify the Vercel webhook signature
async function verifySignature(request, rawBody) {
  // Get the signature from the headers
  const signature = request.headers.get("x-vercel-signature");

  if (!signature) {
    console.error("Missing x-vercel-signature header");
    return false;
  }

  // Get the webhook secret from environment variables
  const webhookSecret = process.env.WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("WEBHOOK_SECRET environment variable is not set");
    return false;
  }

  // Calculate the expected signature
  const expectedSignature = crypto
    .createHmac("sha1", webhookSecret)
    .update(rawBody)
    .digest("hex");

  // Compare the signatures
  const isValid = signature === expectedSignature;

  if (!isValid) {
    console.error("Signature verification failed");
  }

  return isValid;
}

export async function POST(req) {
  console.log("Vercel webhook received");

  try {
    // Clone the request to read the body twice (once for verification, once for processing)
    const clonedReq = req.clone();

    // Get raw body for signature verification
    const rawBody = await clonedReq.text();

    // Verify the signature before processing
    const isSignatureValid = await verifySignature(req, rawBody);

    if (!isSignatureValid) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Signature verification failed. Unauthorized request.",
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Parse the webhook payload
    const payload = JSON.parse(rawBody);

    // Get your phone number - consider moving this to an environment variable
    const notificationPhoneNumber = process.env.NOTIFICATION_PHONE_NUMBER;

    // Extract event type and project info
    const eventType = payload.type || "";
    const projectName =
      payload.payload?.project?.name ||
      payload.payload?.deployment?.name ||
      "Unknown project";
    const deploymentUrl = payload.payload?.deployment?.url || "";

    console.log("Event type:", eventType);
    console.log("Project name:", projectName);

    // Handle different event types
    switch (eventType) {
      case "deployment-succeeded":
        await sendSimpleText({
          message: `✅ BUILD SUCCESS: ${projectName} was successfully deployed to ${deploymentUrl}`,
          phone: notificationPhoneNumber,
          name: "Build Notification",
        });
        break;

      case "deployment-error":
        await sendSimpleText({
          message: `❌ BUILD FAILED: ${projectName} deployment failed. Check Vercel dashboard for details.`,
          phone: notificationPhoneNumber,
          name: "Build Notification",
        });
        break;

      case "firewall-attack-detected":
        // Extract attack details
        const attackType = payload.payload?.attack?.type || "Unknown";
        const attackTarget = payload.payload?.attack?.target || "Unknown";
        const attackMagnitude = payload.payload?.attack?.magnitude || "Unknown";
        const attackRegion = payload.payload?.region || "Unknown";

        await sendSimpleText({
          message: `🚨 ATTACK DETECTED: ${projectName} is under a ${attackType} attack. Magnitude: ${attackMagnitude}. Region: ${attackRegion}. Vercel firewall is mitigating.`,
          phone: notificationPhoneNumber,
          name: "Security Alert",
        });
        break;

      default:
        console.log(`Received event type ${eventType}, no action taken`);
    }

    // Return a success response to acknowledge receipt
    return new Response(
      JSON.stringify({
        success: true,
        message: "Webhook processed successfully",
        eventType,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error processing webhook:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

// Optional: Support GET method for testing
export async function GET(req) {
  return new Response(
    JSON.stringify({
      success: true,
      message:
        "Vercel webhook endpoint is active. Send POST requests to this URL.",
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
}
