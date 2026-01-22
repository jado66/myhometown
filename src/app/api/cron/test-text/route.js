import { sendSimpleText } from "@/util/communication/sendTexts";

export const maxDuration = 10; // 10 seconds should be plenty for a single text
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req) {
  console.log("Running test text cron job...");

  try {
    // Get last month's name
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const monthName = lastMonth.toLocaleString("en-US", { month: "long" });

    const phoneNumbers = ["18012548871", "13852508633", "18014554526"]; // Test phone numbers
    const results = [];
    for (const phone of phoneNumbers) {
      const result = await sendSimpleText({
        message: `Please submit your missionary hours for the month of ${monthName}. Thank you!`,
        phone,
        name: "Test User",
      });
      results.push({ phone, result });
    }

    return new Response(
      JSON.stringify({
        success: true,
        results,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in test-text cron job:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

// Also support POST method for manual triggering
export async function POST(req) {
  return GET(req);
}
