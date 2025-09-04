import { supabaseServer } from "@/util/supabaseServer";
import { twilioClient } from "@/util/twilio";

export const maxDuration = 60;
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req) {
  const startTime = Date.now();

  const url = new URL(req.url);
  const batchId = url.searchParams.get("batchId");

  if (!batchId) {
    console.error("ERROR: No batchId provided");
    return Response.json({ error: "No batchId provided" }, { status: 400 });
  }

  // Validate Twilio credentials
  if (
    !process.env.TWILIO_ACCOUNT_SID ||
    !process.env.TWILIO_AUTH_TOKEN ||
    !process.env.TWILIO_PHONE_NUMBER
  ) {
    console.error("ERROR: Missing Twilio credentials");
    return Response.json(
      { error: "Twilio credentials not configured" },
      { status: 500 }
    );
  }

  let requestBody;
  try {
    requestBody = await req.json();
  } catch (error) {
    console.error("ERROR: Failed to parse request body:", error);
    return Response.json(
      { error: "Invalid JSON in request body" },
      { status: 400 }
    );
  }

  const { message, recipients, mediaUrls = [] } = requestBody;

  if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
    console.error("ERROR: No valid recipients provided");
    return Response.json(
      { error: "No valid recipients provided" },
      { status: 400 }
    );
  }

  if (!message || message.trim() === "") {
    console.error("ERROR: No message provided");
    return Response.json({ error: "Message cannot be empty" }, { status: 400 });
  }

  // Test Twilio connection
  try {
    const account = await twilioClient.api
      .accounts(process.env.TWILIO_ACCOUNT_SID)
      .fetch();
  } catch (error) {
    console.error("ERROR: Twilio connection failed:", error.message);
    return Response.json(
      { error: "Twilio authentication failed: " + error.message },
      { status: 500 }
    );
  }

  let successCount = 0;
  let failureCount = 0;
  const results = [];

  try {
    const sendPromises = recipients.map(async (r, index) => {
      const recipientStartTime = Date.now();

      // Check if this is a test number (non-UUID logId)
      const isTestNumber =
        r.logId &&
        (r.logId.startsWith("test-") ||
          !r.logId.match(
            /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
          ));

      try {
        // Validate recipient data
        if (!r.phone) {
          throw new Error("No phone number provided for recipient");
        }

        // Enhanced phone number formatting with validation
        const originalPhone = r.phone;
        const cleanPhone = r.phone.replace(/\D/g, "");

        if (cleanPhone.length === 0) {
          throw new Error("Phone number contains no digits");
        }

        let formattedPhone;
        if (cleanPhone.length === 10) {
          formattedPhone = `+1${cleanPhone}`;
        } else if (cleanPhone.length === 11 && cleanPhone.startsWith("1")) {
          formattedPhone = `+${cleanPhone}`;
        } else if (cleanPhone.length > 7 && cleanPhone.length < 16) {
          formattedPhone = `+${cleanPhone}`;
        } else {
          throw new Error(
            `Invalid phone number length: ${cleanPhone.length} digits`
          );
        }

        // Prepare message data
        const messageData = {
          body: message,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: formattedPhone,
        };

        // Only add statusCallback for real log entries (not test numbers)
        if (!isTestNumber && r.logId) {
          messageData.statusCallback = `${process.env.NEXT_PUBLIC_WEBHOOK_DESTINATION}/api/communications/twilio-status?logId=${r.logId}`;
        }

        // Add media URLs if present
        if (mediaUrls && mediaUrls.length > 0) {
          messageData.mediaUrl = mediaUrls;
        }

        const msg = await twilioClient.messages.create(messageData);

        // Update text_log with SID (only for real log entries, not test numbers)
        if (!isTestNumber && r.logId) {
          try {
            const { error: updateError } = await supabaseServer
              .from("text_logs")
              .update({ twilio_sid: msg.sid })
              .eq("id", r.logId);

            if (updateError) {
              console.error("ERROR updating text_log:", updateError);
            }
          } catch (dbError) {
            console.error("ERROR: Database update failed:", dbError);
          }
        }

        successCount++;
        results.push({
          phone: formattedPhone,
          status: "sent",
          sid: msg.sid,
          logId: r.logId,
          isTestNumber,
        });
      } catch (error) {
        failureCount++;
        results.push({
          phone: r.phone,
          status: "failed",
          error: error.message,
          logId: r.logId,
          isTestNumber,
        });

        // Update database with failure (only for real log entries, not test numbers)
        if (!isTestNumber && r.logId) {
          try {
            const { error: updateError } = await supabaseServer
              .from("text_logs")
              .update({
                status: "failed",
                error_message: error.message,
              })
              .eq("id", r.logId);

            if (updateError) {
              console.error(
                "ERROR updating failed status in database:",
                updateError
              );
            }
          } catch (dbError) {
            console.error("ERROR: Database update failed:", dbError);
          }

          // Update batch counts
          try {
            const { error: batchError } = await supabaseServer.rpc(
              "update_batch_counts",
              {
                p_batch_id: batchId,
                p_delta_pending: -1,
                p_delta_sent: 0,
                p_delta_delivered: 0,
                p_delta_failed: 1,
              }
            );

            if (batchError) {
              console.error("ERROR updating batch counts:", batchError);
            }
          } catch (batchDbError) {
            console.error("ERROR: Batch count update failed:", batchDbError);
          }
        }
      }
    });

    await Promise.allSettled(sendPromises);

    // Update batch status to completed
    try {
      const { error: batchUpdateError } = await supabaseServer
        .from("text_batches")
        .update({ status: "completed" })
        .eq("id", batchId);

      if (batchUpdateError) {
        console.error(
          "ERROR updating batch status to completed:",
          batchUpdateError
        );
      }
    } catch (error) {
      console.error("ERROR: Failed to update batch status:", error);
    }

    return Response.json({
      success: true,
      batchId,
      summary: {
        total: recipients.length,
        successful: successCount,
        failed: failureCount,
        results: results,
      },
    });
  } catch (error) {
    console.error("=== CRITICAL ERROR ===");
    console.error("Unexpected error in main try/catch:", error);
    console.error("Stack trace:", error.stack);

    return Response.json(
      {
        error: "Internal server error: " + error.message,
        batchId,
      },
      { status: 500 }
    );
  }
}
