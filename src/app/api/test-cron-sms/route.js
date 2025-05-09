// src/app/api/test-cron-sms/route.js
import { sendSimpleText } from "@/util/communication/sendTexts";

export const maxDuration = 30; // 30 seconds should be plenty for a single SMS
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req) {
  console.log("Test cron SMS job triggered");

  const timestamp = new Date().toISOString();
  const testPhone = "8012548871"; // Your phone number

  try {
    // Send a simple test message with timestamp to verify execution
    const result = await sendSimpleText({
      message: `Test cron SMS: ${timestamp}`,
      phone: testPhone,
      name: "Test User",
    });

    console.log("Test SMS result:", result);

    return new Response(
      JSON.stringify({
        success: true,
        timestamp,
        messageId: result.messageId,
        result,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error sending test SMS:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        timestamp,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

// Support POST method as well for manual testing
export async function POST(req) {
  return GET(req);
}
