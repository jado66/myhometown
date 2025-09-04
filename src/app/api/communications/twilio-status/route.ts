import { supabaseServer } from "@/util/supabaseServer";
import twilio from "twilio";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.text(); // Twilio sends urlencoded
    const formData = new URLSearchParams(body);
    const params = Object.fromEntries(formData.entries());

    const signature = req.headers.get("x-twilio-signature");
    const url = req.url; // Full URL

    console.log("Webhook received:", {
      MessageSid: params.MessageSid,
      MessageStatus: params.MessageStatus,
      url,
      signature: signature ? "present" : "missing",
    });

    // Enable signature validation for production
    if (!signature) {
      console.log("Missing Twilio signature");
      return new Response("Missing signature", { status: 403 });
    }

    try {
      // Validate the signature using your auth token
      const authToken = process.env.TWILIO_AUTH_TOKEN;
      if (!authToken) {
        throw new Error("Missing TWILIO_AUTH_TOKEN environment variable");
      }

      const isValid = twilio.validateRequest(authToken, signature, url, params);

      if (!isValid) {
        console.log("Invalid Twilio signature");
        return new Response("Invalid signature", { status: 403 });
      }
    } catch (validationError) {
      console.error("Signature validation error:", validationError);
      return new Response("Signature validation failed", { status: 403 });
    }

    const { MessageSid, MessageStatus, ErrorCode, ErrorMessage } = params;
    const logId = new URL(req.url).searchParams.get("logId");

    console.log("Processing webhook:", { MessageSid, MessageStatus, logId });

    if (!logId) {
      console.log("No logId provided");
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
      console.log("Log not found:", { logId, MessageSid, error: logError });
      return new Response("Log not found", { status: 404 });
    }

    console.log("Found log:", {
      id: logId,
      prevStatus: log.status,
      newStatus: MessageStatus,
    });

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

    const { error: updateError } = await supabaseServer
      .from("text_logs")
      .update(updateData)
      .eq("id", logId);

    if (updateError) {
      console.error("Error updating log:", updateError);
      throw new Error(`Failed to update log: ${updateError.message}`);
    }

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
      ["pending", "queued", "accepted", "sending", "sent"].includes(
        prevStatus
      ) &&
      ["failed", "undelivered"].includes(newStatus)
    ) {
      delta_pending = prevStatus === "pending" ? -1 : 0;
      delta_sent = ["sent", "sending"].includes(prevStatus) ? -1 : 0;
      delta_failed = 1;
    }

    console.log("Delta calculations:", {
      delta_pending,
      delta_sent,
      delta_delivered,
      delta_failed,
    });

    // Update batch counts atomically
    const { error: batchError } = await supabaseServer.rpc(
      "update_batch_counts",
      {
        p_batch_id: log.batch_id,
        p_delta_pending: delta_pending,
        p_delta_sent: delta_sent,
        p_delta_delivered: delta_delivered,
        p_delta_failed: delta_failed,
      }
    );

    if (batchError) {
      console.error("Error updating batch counts:", batchError);
      throw new Error(`Failed to update batch counts: ${batchError.message}`);
    }

    console.log("Webhook processed successfully");
    return new Response("", { status: 200 }); // Twilio expects 200 OK
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(
      `Internal server error: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
      {
        status: 500,
      }
    );
  }
}
