// src/app/api/cron/process-scheduled-texts/route.js
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export const maxDuration = 300; // Allow longer runtime for processing multiple texts
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req) {
  console.log("Processing scheduled texts...");

  try {
    // Get current timestamp
    const now = new Date();

    // Fetch scheduled texts that are due
    const { data: scheduledTexts, error } = await supabase
      .from("scheduled_texts")
      .select("id")
      .lt("scheduled_time", now.toISOString())
      .or("metadata->>sent_at.is.null,metadata.is.null"); // Handle both null metadata and null sent_at

    if (error) {
      console.error("Error fetching scheduled texts:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    console.log(
      `Found ${scheduledTexts?.length || 0} scheduled texts to process`
    );

    if (!scheduledTexts || scheduledTexts.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: "No scheduled texts to process",
          count: 0,
          timestamp: now.toISOString(),
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Process each scheduled text by calling the send endpoint
    const results = await Promise.all(
      scheduledTexts.map(async (text) => {
        const requestBody = { id: text.id };
        const bodyString = JSON.stringify(requestBody);

        // Determine the base URL (considers both production and development environments)
        const baseUrl = process.env.VERCEL_URL
          ? `https://${process.env.VERCEL_URL}`
          : process.env.NEXT_PUBLIC_DOMAIN
          ? process.env.NEXT_PUBLIC_DOMAIN
          : "http://localhost:3000";

        const apiUrl = `${baseUrl}/api/communications/scheduled-texts/send`;

        console.log(`Sending request to: ${apiUrl} for text ID: ${text.id}`);

        try {
          const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Content-Length": Buffer.byteLength(
                bodyString,
                "utf8"
              ).toString(),
            },
            body: bodyString,
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.error(`Error response for text ${text.id}:`, errorText);
            return {
              id: text.id,
              success: false,
              error: `HTTP error ${response.status}: ${errorText}`,
            };
          }

          const result = await response.json();
          return { id: text.id, success: true, ...result };
        } catch (fetchError) {
          console.error(`Fetch error for text ${text.id}:`, fetchError);
          return {
            id: text.id,
            success: false,
            error: fetchError.message || "Failed to process text",
          };
        }
      })
    );

    // Count successful and failed texts
    const successCount = results.filter((result) => result.success).length;
    const failedCount = results.length - successCount;

    return new Response(
      JSON.stringify({
        success: true,
        total: results.length,
        successCount,
        failedCount,
        results,
        timestamp: now.toISOString(),
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in process-scheduled-texts API:", error);

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
