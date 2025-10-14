// src/app/api/communications/scheduled-texts/send/route.js
import { supabaseServer } from "@/util/supabaseServer";
import { twilioClient } from "@/util/twilio";
import { v4 as uuidv4 } from "uuid";

// GET handler for Vercel Cron jobs and manual triggers
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const isManual = searchParams.get("manual") === "true";

  try {
    // Fetch all scheduled texts that are due
    const now = new Date();
    const { data: scheduledTexts, error: fetchError } = await supabaseServer
      .from("scheduled_texts")
      .select("*")
      .eq("status", "scheduled")
      .lte("scheduled_time", now.toISOString());

    if (fetchError) {
      console.error("Error fetching scheduled texts:", fetchError);
      return Response.json(
        { error: "Failed to fetch scheduled texts" },
        { status: 500 }
      );
    }

    if (!scheduledTexts || scheduledTexts.length === 0) {
      return Response.json({
        success: true,
        message: "No scheduled texts to process",
        processed: 0,
      });
    }

    // Process each scheduled text
    const results = [];
    for (const text of scheduledTexts) {
      try {
        // Call the POST handler for each text
        const response = await fetch(
          `${
            process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
          }/api/cron/process-scheduled-texts`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: text.id }),
          }
        );

        const result = await response.json();
        results.push({ id: text.id, success: result.success });
      } catch (error) {
        console.error(`Error processing scheduled text ${text.id}:`, error);
        results.push({ id: text.id, success: false, error: error.message });
      }
    }

    return Response.json({
      success: true,
      processed: scheduledTexts.length,
      results,
      isManual,
    });
  } catch (error) {
    console.error("Error in GET handler:", error);
    return Response.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  const startTime = Date.now();
  let requestBody;
  try {
    requestBody = await req.json();
  } catch (error) {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { id: scheduledTextId } = requestBody;
  if (!scheduledTextId) {
    return Response.json(
      { error: "No scheduled_text_id provided" },
      { status: 400 }
    );
  }

  // Fetch scheduled text
  const { data: scheduledText, error: fetchError } = await supabaseServer
    .from("scheduled_texts")
    .select("*")
    .eq("id", scheduledTextId)
    .single();

  if (fetchError || !scheduledText) {
    console.error("Error fetching scheduled text:", fetchError);
    return Response.json(
      { error: "Scheduled text not found" },
      { status: 404 }
    );
  }

  if (scheduledText.status !== "scheduled") {
    return Response.json(
      { success: true, message: "Already processed" },
      { status: 200 }
    );
  }

  const {
    message_content: message,
    media_urls: mediaUrls = [],
    recipients,
    metadata,
    batch_id: batchId,
  } = scheduledText;
  if (!message || !recipients || recipients.length === 0) {
    return Response.json(
      { error: "Invalid scheduled text data" },
      { status: 400 }
    );
  }

  // Validate Twilio (reuse your existing check)
  if (
    !process.env.TWILIO_ACCOUNT_SID ||
    !process.env.TWILIO_AUTH_TOKEN ||
    !process.env.TWILIO_PHONE_NUMBER
  ) {
    return Response.json({ error: "Twilio not configured" }, { status: 500 });
  }

  // Fetch logs for this batch (if batch_id exists)
  let logs = [];
  if (batchId) {
    const { data: logData } = await supabaseServer
      .from("text_logs")
      .select("*")
      .eq("batch_id", batchId)
      .eq("status", "scheduled");

    logs = logData || [];
  } else {
    // Fallback: Create logs now if no batch (but prefer batch-linked)
    console.warn("No batch_id; creating ad-hoc logs");
    // ... (insert logs similar to useSendSMS)
  }

  // Map recipients to logs (match by phone)
  const logIdMap = new Map();
  logs.forEach((log) => logIdMap.set(log.recipient_phone, log.id));

  let successCount = 0;
  let failureCount = 0;
  const results = [];

  // Send each (parallel, like your send-texts)
  const sendPromises = recipients.map(async (r) => {
    const logId = logIdMap.get(r.phone || r.value);
    const isTest = logId && !logId.match(/^[0-9a-f-]{36}$/i); // Skip webhook for tests

    try {
      const cleanPhone = (r.phone || r.value).replace(/\D/g, "");
      if (cleanPhone.length < 10) throw new Error("Invalid phone");
      const formattedPhone =
        cleanPhone.length === 10 ? `+1${cleanPhone}` : `+${cleanPhone}`;

      const messageData = {
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: formattedPhone,
        statusCallback: logId
          ? `https://your-domain.com/api/communications/twilio-status?logId=${logId}`
          : undefined,
      };

      if (mediaUrls?.length > 0) messageData.mediaUrl = mediaUrls;

      const msg = await twilioClient.messages.create(messageData);

      // Update log if exists
      if (logId && !isTest) {
        await supabaseServer
          .from("text_logs")
          .update({ twilio_sid: msg.sid, status: "sent" }) // Webhook will handle further
          .eq("id", logId);
      }

      successCount++;
      results.push({
        phone: formattedPhone,
        status: "sent",
        sid: msg.sid,
        logId,
      });
    } catch (error) {
      failureCount++;
      results.push({
        phone: r.phone || r.value,
        status: "failed",
        error: error.message,
        logId,
      });

      // Update log failure
      if (logId) {
        await supabaseServer
          .from("text_logs")
          .update({ status: "failed", error_message: error.message })
          .eq("id", logId);
      }
    }
  });

  await Promise.allSettled(sendPromises);

  // Update scheduled_text & batch
  const now = new Date();
  await supabaseServer
    .from("scheduled_texts")
    .update({
      status: "sent",
      metadata: { ...metadata, sent_at: now.toISOString() },
    })
    .eq("id", scheduledTextId);

  if (batchId) {
    await supabaseServer
      .from("text_batches")
      .update({
        status: "completed", // Or "in_progress" if webhook handles completion
        pending_count: 0,
      })
      .eq("id", batchId);
  }

  return Response.json({
    success: true,
    summary: {
      total: recipients.length,
      successful: successCount,
      failed: failureCount,
      results,
    },
    processedAt: now.toISOString(),
  });
}
