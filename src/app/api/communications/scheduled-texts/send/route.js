// src/app/api/communications/scheduled-texts/send/route.js
import { sendTextWithStream } from "@/util/communication/sendTexts";
import { createClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export const maxDuration = 60;
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req) {
  try {
    const { id } = await req.json();
    const messageId = uuidv4(); // Generate unique messageId for streaming

    if (!id) {
      return new Response(
        JSON.stringify({ error: "No scheduled text ID provided" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Fetch the scheduled text from database
    const { data: scheduledText, error } = await supabase
      .from("scheduled_texts")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !scheduledText) {
      console.error("Error fetching scheduled text:", error);
      return new Response(
        JSON.stringify({
          error: error?.message || "Scheduled text not found",
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Extract data
    const { message_content, recipients, media_urls } = scheduledText;

    // Process recipients
    const results = [];
    const parsedRecipients =
      typeof recipients === "string" ? JSON.parse(recipients) : recipients;

    const parsedMediaUrls = media_urls
      ? typeof media_urls === "string"
        ? JSON.parse(media_urls)
        : media_urls
      : [];

    // Decode media URLs (they are URL-encoded in the database)
    const decodedMediaUrls = parsedMediaUrls.map((url) =>
      typeof url === "string" ? decodeURIComponent(url) : url
    );

    console.log("Decoded media URLs:", decodedMediaUrls);

    // Send messages sequentially
    for (const recipient of parsedRecipients) {
      try {
        // Use sendTextWithStream instead of sendSimpleText
        const result = await sendTextWithStream({
          message: message_content,
          recipient: {
            phone: recipient.phone || recipient.label,
            name: recipient.name || recipient.value,
          },
          mediaUrls: decodedMediaUrls.length > 0 ? decodedMediaUrls : undefined,
          messageId, // Required for sendTextWithStream
        });

        results.push({
          recipient: recipient.name || recipient.value,
          status: result.success ? "delivered" : "failed",
          messageId: result.messageId,
          error: result.error,
        });
      } catch (error) {
        console.error(
          `Error sending to ${recipient.name || recipient.value}:`,
          error
        );
        results.push({
          recipient: recipient.name || recipient.value,
          status: "failed",
          error: error.message,
        });
      }
    }

    // Update the status in the database
    const { error: updateError } = await supabase
      .from("scheduled_texts")
      .update({
        metadata: {
          ...scheduledText.metadata,
          sent_at: new Date().toISOString(),
          delivery_results: results,
        },
      })
      .eq("id", id);

    if (updateError) {
      console.error("Error updating scheduled text status:", updateError);
    }

    // Delete the scheduled text after successful processing
    const { error: deleteError } = await supabase
      .from("scheduled_texts")
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error("Error deleting scheduled text:", deleteError);
      // Continue even if deletion fails - the message was already sent
    }

    return new Response(
      JSON.stringify({
        success: true,
        id,
        messageId,
        results,
        deleted: !deleteError,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in scheduled-texts API:", error);

    return new Response(
      JSON.stringify({
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
