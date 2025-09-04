import { supabaseServer } from "@/util/supabaseServer";
import twilio from "twilio";

const twilioValidator = twilio.webhook({ validate: true }); // Validates signature

export async function POST(req) {
  const body = await req.text(); // Twilio sends urlencoded
  const formData = new URLSearchParams(body);
  const params = Object.fromEntries(formData.entries());

  const signature = req.headers.get("x-twilio-signature");
  const url = req.url; // Full URL

  // Validate request from Twilio
  if (!twilioValidator(signature, url, params)) {
    return new Response("Invalid signature", { status: 403 });
  }

  const { MessageSid, MessageStatus, ErrorCode, ErrorMessage } = params;
  const logId = new URL(req.url).searchParams.get("logId");

  if (!logId) {
    return new Response("No logId provided", { status: 400 });
  }

  // Get current log to compute deltas
  const { data: log, error: logError } = await supabaseServer
    .from("text_logs")
    .select("status, batch_id")
    .eq("id", logId)
    .eq("twilio_sid", MessageSid) // Extra security
    .single();

  if (logError || !log) {
    return new Response("Log not found", { status: 404 });
  }

  const prevStatus = log.status;
  const newStatus = MessageStatus; // e.g., 'sent', 'delivered', 'failed'

  // Update log
  const updateData = {
    status: newStatus,
    error_message:
      newStatus === "failed" || newStatus === "undelivered"
        ? ErrorMessage || `Error ${ErrorCode}`
        : null,
    updated_at: new Date(),
  };
  await supabaseAdmin.from("text_logs").update(updateData).eq("id", logId);

  // Compute deltas based on Twilio status transitions
  let delta_pending = 0;
  let delta_sent = 0;
  let delta_delivered = 0;
  let delta_failed = 0;

  if (
    prevStatus === "pending" &&
    ["queued", "accepted", "sending"].includes(newStatus)
  ) {
    delta_pending = -1;
    delta_sent = 1; // Consider 'sent' bucket for in-transit
  } else if (
    ["queued", "accepted", "sending", "pending"].includes(prevStatus) &&
    newStatus === "sent"
  ) {
    delta_pending = prevStatus === "pending" ? -1 : 0;
    delta_sent = 1;
  } else if (
    ["sent", "queued", "accepted", "sending"].includes(prevStatus) &&
    newStatus === "delivered"
  ) {
    delta_sent = -1;
    delta_delivered = 1;
  } else if (
    ["pending", "queued", "accepted", "sending", "sent"].includes(prevStatus) &&
    ["failed", "undelivered"].includes(newStatus)
  ) {
    delta_pending = prevStatus === "pending" ? -1 : 0;
    delta_sent = ["sent", "sending"].includes(prevStatus) ? -1 : 0;
    delta_failed = 1;
  }

  // Update batch counts atomically
  await supabaseAdmin.rpc("update_batch_counts", {
    p_batch_id: log.batch_id,
    p_delta_pending: delta_pending,
    p_delta_sent: delta_sent,
    p_delta_delivered: delta_delivered,
    p_delta_failed: delta_failed,
  });

  return new Response("", { status: 200 }); // Twilio expects 200 OK
}
