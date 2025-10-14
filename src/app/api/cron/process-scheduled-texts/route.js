// src/app/api/communications/scheduled-texts/send/route.js
import { supabaseServer } from "@/util/supabaseServer";
import { twilioClient } from "@/util/twilio";
import { v4 as uuidv4 } from "uuid";

// Extract the processing logic into a shared function
async function processScheduledText(scheduledTextId) {
  const startTime = Date.now();

  // Fetch scheduled text
  const { data: scheduledText, error: fetchError } = await supabaseServer
    .from("scheduled_texts")
    .select("*")
    .eq("id", scheduledTextId)
    .single();

  if (fetchError || !scheduledText) {
    console.error("Error fetching scheduled text:", fetchError);
    return { success: false, error: "Scheduled text not found" };
  }

  if (scheduledText.status !== "scheduled") {
    return { success: true, message: "Already processed" };
  }

  const {
    message_content: message,
    media_urls: mediaUrls = [],
    recipients,
    metadata,
    batch_id: batchId,
  } = scheduledText;

  if (!message || !recipients || recipients.length === 0) {
    return { success: false, error: "Invalid scheduled text data" };
  }

  // Validate Twilio
  if (
    !process.env.TWILIO_ACCOUNT_SID ||
    !process.env.TWILIO_AUTH_TOKEN ||
    !process.env.TWILIO_PHONE_NUMBER
  ) {
    return { success: false, error: "Twilio not configured" };
  }

  // Fetch logs for this batch
  let logs = [];
  if (batchId) {
    const { data: logData } = await supabaseServer
      .from("text_logs")
      .select("*")
      .eq("batch_id", batchId)
      .eq("status", "scheduled");

    logs = logData || [];
  } else {
    console.warn("No batch_id; creating ad-hoc logs");
  }

  // Map recipients to logs
  const logIdMap = new Map();
  logs.forEach((log) => logIdMap.set(log.recipient_phone, log.id));

  let successCount = 0;
  let failureCount = 0;
  const results = [];

  // Send each message
  const sendPromises = recipients.map(async (r) => {
    const logId = logIdMap.get(r.phone || r.value);
    const isTest = logId && !logId.match(/^[0-9a-f-]{36}$/i);

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
          ? `${process.env.NEXT_PUBLIC_APP_URL}/api/communications/twilio-status?logId=${logId}`
          : undefined,
      };

      if (mediaUrls?.length > 0) messageData.mediaUrl = mediaUrls;

      const msg = await twilioClient.messages.create(messageData);

      if (logId && !isTest) {
        await supabaseServer
          .from("text_logs")
          .update({ twilio_sid: msg.sid, status: "sent" })
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
        status: "completed",
        pending_count: 0,
      })
      .eq("id", batchId);
  }

  return {
    success: true,
    summary: {
      total: recipients.length,
      successful: successCount,
      failed: failureCount,
      results,
    },
    processedAt: now.toISOString(),
  };
}

// GET handler for Vercel Cron jobs and manual triggers
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const isManual = searchParams.get("manual") === "true";

  try {
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

    // Process each scheduled text directly (no HTTP call)
    const results = [];
    for (const text of scheduledTexts) {
      try {
        const result = await processScheduledText(text.id);
        results.push({ id: text.id, ...result });
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

  const result = await processScheduledText(scheduledTextId);

  if (!result.success) {
    return Response.json(
      { error: result.error },
      { status: result.error === "Scheduled text not found" ? 404 : 500 }
    );
  }

  return Response.json(result);
}
