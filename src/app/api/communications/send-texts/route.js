import { supabaseServer } from "@/util/supabaseServer";
import { twilioClient } from "@/util/twilio";

export const maxDuration = 60;
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req) {
  const startTime = Date.now();
  console.log("=== TWILIO API CALL STARTED ===");
  console.log("Timestamp:", new Date().toISOString());

  const url = new URL(req.url);
  const batchId = url.searchParams.get("batchId");

  // Enhanced environment variable logging
  console.log("Environment Check:");
  console.log(
    "- TWILIO_ACCOUNT_SID:",
    process.env.TWILIO_ACCOUNT_SID
      ? `${process.env.TWILIO_ACCOUNT_SID.substring(0, 10)}...`
      : "MISSING"
  );
  console.log(
    "- TWILIO_AUTH_TOKEN:",
    process.env.TWILIO_AUTH_TOKEN
      ? `${process.env.TWILIO_AUTH_TOKEN.substring(0, 10)}...`
      : "MISSING"
  );
  console.log(
    "- TWILIO_PHONE_NUMBER:",
    process.env.TWILIO_PHONE_NUMBER || "MISSING"
  );
  console.log("- BatchId:", batchId);

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
    console.log("Request body parsed successfully");
  } catch (error) {
    console.error("ERROR: Failed to parse request body:", error);
    return Response.json(
      { error: "Invalid JSON in request body" },
      { status: 400 }
    );
  }

  const { message, recipients, mediaUrls = [] } = requestBody;

  console.log("Request Details:");
  console.log("- Message length:", message?.length || 0);
  console.log("- Recipients count:", recipients?.length || 0);
  console.log("- Media URLs count:", mediaUrls?.length || 0);
  console.log(
    "- Message preview:",
    message?.substring(0, 100) + (message?.length > 100 ? "..." : "")
  );
  console.log("- Media URLs:", mediaUrls);

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
    console.log("Testing Twilio connection...");
    const account = await twilioClient.api
      .accounts(process.env.TWILIO_ACCOUNT_SID)
      .fetch();
    console.log(
      "Twilio connection successful. Account status:",
      account.status
    );
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
    console.log(`Starting to send ${recipients.length} messages...`);

    const sendPromises = recipients.map(async (r, index) => {
      const recipientStartTime = Date.now();
      console.log(
        `\n--- Processing recipient ${index + 1}/${recipients.length} ---`
      );
      console.log("Recipient data:", { phone: r.phone, logId: r.logId });

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
        console.log(`Phone formatting: "${originalPhone}" -> "${cleanPhone}"`);

        if (cleanPhone.length === 0) {
          throw new Error("Phone number contains no digits");
        }

        let formattedPhone;
        if (cleanPhone.length === 10) {
          formattedPhone = `+1${cleanPhone}`;
          console.log("Applied US formatting (+1)");
        } else if (cleanPhone.length === 11 && cleanPhone.startsWith("1")) {
          formattedPhone = `+${cleanPhone}`;
          console.log("Applied North America formatting");
        } else if (cleanPhone.length > 7 && cleanPhone.length < 16) {
          formattedPhone = `+${cleanPhone}`;
          console.log("Applied international formatting");
        } else {
          throw new Error(
            `Invalid phone number length: ${cleanPhone.length} digits`
          );
        }

        console.log(`Final formatted phone: ${formattedPhone}`);

        // Prepare message data
        const messageData = {
          body: message,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: formattedPhone,
        };

        // Only add statusCallback for real log entries (not test numbers)
        if (!isTestNumber && r.logId) {
          messageData.statusCallback = `https://myhometownut.com/api/twilio-status?logId=${r.logId}`;
        }

        // Add media URLs if present
        if (mediaUrls && mediaUrls.length > 0) {
          messageData.mediaUrl = mediaUrls;
          console.log(`Adding ${mediaUrls.length} media URLs`);
        }

        console.log("Sending message to Twilio...");
        console.log("Message data:", {
          ...messageData,
          body: messageData.body.substring(0, 50) + "...",
        });

        const msg = await twilioClient.messages.create(messageData);

        console.log(`✅ Message sent successfully!`);
        console.log(`- Twilio SID: ${msg.sid}`);
        console.log(`- Status: ${msg.status}`);
        console.log(`- Direction: ${msg.direction}`);
        console.log(`- Time taken: ${Date.now() - recipientStartTime}ms`);

        // Update text_log with SID (only for real log entries, not test numbers)
        if (!isTestNumber && r.logId) {
          try {
            const { error: updateError } = await supabaseServer
              .from("text_logs")
              .update({ twilio_sid: msg.sid })
              .eq("id", r.logId);

            if (updateError) {
              console.error("ERROR updating text_log:", updateError);
            } else {
              console.log("✅ Database updated with Twilio SID");
            }
          } catch (dbError) {
            console.error("ERROR: Database update failed:", dbError);
          }
        } else if (isTestNumber) {
          console.log("⚠️ Skipping database update for test number");
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
        console.error(`❌ Failed to send message:`);
        console.error(`- Error: ${error.message}`);
        console.error(`- Code: ${error.code || "N/A"}`);
        console.error(`- More info: ${error.moreInfo || "N/A"}`);
        console.error(`- Time taken: ${Date.now() - recipientStartTime}ms`);

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
            } else {
              console.log("✅ Database updated with failure status");
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
            } else {
              console.log("✅ Batch counts updated");
            }
          } catch (batchDbError) {
            console.error("ERROR: Batch count update failed:", batchDbError);
          }
        } else if (isTestNumber) {
          console.log("⚠️ Skipping database update for test number failure");
        }
      }
    });

    console.log("Waiting for all messages to complete...");
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
      } else {
        console.log("✅ Batch status updated to completed");
      }
    } catch (error) {
      console.error("ERROR: Failed to update batch status:", error);
    }

    const totalTime = Date.now() - startTime;
    console.log("\n=== SUMMARY ===");
    console.log(`✅ Successful sends: ${successCount}`);
    console.log(`❌ Failed sends: ${failureCount}`);
    console.log(`⏱️  Total time: ${totalTime}ms`);
    console.log(
      `📊 Average time per message: ${Math.round(
        totalTime / recipients.length
      )}ms`
    );

    console.log("=== TWILIO API CALL COMPLETED ===\n");

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
