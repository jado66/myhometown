import { sendSimpleText } from "@/util/communication/sendTexts";

export const maxDuration = 10; // 10 seconds should be plenty for a single text
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req) {
  console.log("Running test text cron job...");

  try {
    const result = await sendSimpleText({
      message: "This is a test message from the cron job",
      phone: "18012548871",
      name: "Test User"
    });

    return new Response(
      JSON.stringify({
        success: true,
        result,
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
