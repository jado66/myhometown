import { sendTextWithStream } from "@/util/communication/sendTexts";

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
    const results = [];
    for (const [index, recipient] of recipients.entries()) {
      const result = await sendTextWithStream({
        message,
        recipient: {
          phone: recipient.label,
          name: recipient.name || recipient.label,
        },
        mediaUrls,
        messageId, // Pass through the original messageId
      });
      results.push(result);
    }

    return new Response(
      JSON.stringify({
        success: true,
        results,
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
