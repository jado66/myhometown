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
  const url = new URL(req.url);
  const hostname = url.hostname;

  console.log("Processing scheduled texts...");

  try {
    // Get current timestamp
    const now = new Date();

    // Fetch scheduled texts that are due
    const { data: scheduledTexts, error } = await supabase
      .from("scheduled_texts")
      .select("id")
      .lt("scheduled_time", now.toISOString())
      .is("metadata->sent_at", null); // Only get unsent messages

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
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_DOMAIN}/api/communications/scheduled-texts/send`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: text.id }),
          }
        );

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
        return { id: text.id, ...result };
      })
    );

    return new Response(
      JSON.stringify({
        success: true,
        count: results.length,
        results,
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

// Also support POST method for your frontend "Send NOW" button
export async function POST(req) {
  return GET(req);
}
