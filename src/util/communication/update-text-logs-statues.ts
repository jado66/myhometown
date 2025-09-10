import { supabaseServer } from "@/util/supabaseServer";
import { twilioClient } from "@/util/twilio";
import { MessageStatus } from "twilio/lib/rest/api/v2010/account/message";

// Configuration
const BATCH_SIZE = 50; // Process messages in batches to avoid rate limits
const DELAY_BETWEEN_BATCHES = 1000; // 1 second delay between batches

async function updateTextLogStatuses() {
  console.log("Starting text log status update for the past week...");

  try {
    // Validate Twilio credentials
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
      throw new Error("Missing Twilio credentials");
    }

    // Get all text logs from the past week that have Twilio SIDs
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    console.log(`Fetching text logs since: ${oneWeekAgo.toISOString()}`);

    const { data: textLogs, error: fetchError } = await supabaseServer
      .from("text_logs")
      .select("id, twilio_sid, status, recipient_phone, created_at")
      .gte("created_at", oneWeekAgo.toISOString())
      .not("twilio_sid", "is", null)
      .neq("twilio_sid", "");

    if (fetchError) {
      throw new Error(`Failed to fetch text logs: ${fetchError.message}`);
    }

    if (!textLogs || textLogs.length === 0) {
      console.log("No text logs found with Twilio SIDs in the past week");
      return;
    }

    console.log(`Found ${textLogs.length} text logs to update`);

    let totalUpdated = 0;
    let totalErrors = 0;
    const updateResults: (
      | {
          id: any;
          phone: any;
          oldStatus: any;
          newStatus: MessageStatus;
          success: boolean;
          twilioSid: any;
          status?: undefined;
          noChange?: undefined;
          error?: undefined;
        }
      | {
          id: any;
          phone: any;
          status: any;
          success: boolean;
          noChange: boolean;
          twilioSid: any;
          oldStatus?: undefined;
          newStatus?: undefined;
          error?: undefined;
        }
      | {
          id: any;
          phone: any;
          success: boolean;
          error: string;
          twilioSid: any;
          oldStatus?: undefined;
          newStatus?: undefined;
          status?: undefined;
          noChange?: undefined;
        }
    )[] = [];

    // Process in batches
    for (let i = 0; i < textLogs.length; i += BATCH_SIZE) {
      const batch = textLogs.slice(i, i + BATCH_SIZE);
      console.log(
        `Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(
          textLogs.length / BATCH_SIZE
        )} (${batch.length} messages)`
      );

      const batchPromises = batch.map(async (log) => {
        try {
          // Fetch message status from Twilio
          const twilioMessage = await twilioClient
            .messages(log.twilio_sid)
            .fetch();

          const twilioStatus = twilioMessage.status;
          const currentStatus = log.status;

          // Map Twilio status to our status values
          let newStatus = twilioStatus;
          let deliveredAt = null;
          let errorMessage = null;

          // Handle specific status mappings
          switch (twilioStatus) {
            case "delivered":
              deliveredAt = twilioMessage.dateUpdated || new Date();
              break;
            case "failed":
            case "undelivered":
              errorMessage =
                twilioMessage.errorMessage || "Message failed to deliver";
              newStatus = "failed";
              break;
            case "sent":
              // Message was sent but not yet delivered
              break;
            default:
              // Keep the Twilio status as is
              break;
          }

          // Only update if status has changed
          if (currentStatus !== newStatus) {
            const updateData: any = {
              status: newStatus,
              updated_at: new Date().toISOString(),
            };

            if (deliveredAt) {
              updateData.delivered_at = deliveredAt;
            }

            if (errorMessage) {
              updateData.error_message = errorMessage;
            }

            const { error: updateError } = await supabaseServer
              .from("text_logs")
              .update(updateData)
              .eq("id", log.id);

            if (updateError) {
              throw new Error(`Database update failed: ${updateError.message}`);
            }

            totalUpdated++;
            return {
              id: log.id,
              phone: log.recipient_phone,
              oldStatus: currentStatus,
              newStatus: newStatus,
              success: true,
              twilioSid: log.twilio_sid,
            };
          } else {
            return {
              id: log.id,
              phone: log.recipient_phone,
              status: currentStatus,
              success: true,
              noChange: true,
              twilioSid: log.twilio_sid,
            };
          }
        } catch (error) {
          totalErrors++;
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          console.error(`Error processing log ${log.id}:`, errorMessage);

          return {
            id: log.id,
            phone: log.recipient_phone,
            success: false,
            error: errorMessage,
            twilioSid: log.twilio_sid,
          };
        }
      });

      const batchResults = await Promise.allSettled(batchPromises);

      // Process batch results
      batchResults.forEach((result, index) => {
        if (result.status === "fulfilled") {
          updateResults.push(result.value);
        } else {
          totalErrors++;
          updateResults.push({
            id: batch[index].id,
            phone: batch[index].recipient_phone,
            success: false,
            error: result.reason?.message || "Unknown error",
            twilioSid: batch[index].twilio_sid,
          });
        }
      });

      // Delay between batches to respect rate limits
      if (i + BATCH_SIZE < textLogs.length) {
        console.log(`Waiting ${DELAY_BETWEEN_BATCHES}ms before next batch...`);
        await new Promise((resolve) =>
          setTimeout(resolve, DELAY_BETWEEN_BATCHES)
        );
      }
    }

    // Summary
    console.log("\n=== UPDATE SUMMARY ===");
    console.log(`Total messages processed: ${textLogs.length}`);
    console.log(`Successfully updated: ${totalUpdated}`);
    console.log(
      `No changes needed: ${updateResults.filter((r) => r.noChange).length}`
    );
    console.log(`Errors: ${totalErrors}`);

    // Show status change breakdown
    interface StatusChangeResult {
      id: number;
      phone: string;
      oldStatus: string;
      newStatus: string;
      success: true;
      noChange?: never;
      twilioSid: string;
    }

    interface StatusChanges {
      [key: string]: number;
    }

    const statusChanges: StatusChanges = updateResults
      .filter((r): r is StatusChangeResult => r.success && !r.noChange)
      .reduce((acc: StatusChanges, r: StatusChangeResult) => {
        const key = `${r.oldStatus} → ${r.newStatus}`;
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {});

    if (Object.keys(statusChanges).length > 0) {
      console.log("\nStatus changes:");
      Object.entries(statusChanges).forEach(([change, count]) => {
        console.log(`  ${change}: ${count}`);
      });
    }

    // Show errors if any
    interface ErrorResult {
      id: number;
      phone: string;
      success: false;
      error: string;
      twilioSid: string;
    }

    const errors: ErrorResult[] = updateResults.filter(
      (r): r is ErrorResult => !r.success
    );
    if (errors.length > 0) {
      console.log("\nErrors encountered:");
      errors.forEach((error) => {
        console.log(`  ${error.phone} (${error.twilioSid}): ${error.error}`);
      });
    }

    console.log("\nUpdate completed!");
    return {
      totalProcessed: textLogs.length,
      totalUpdated,
      totalErrors,
      results: updateResults,
    };
  } catch (error) {
    console.error("Critical error in updateTextLogStatuses:", error);
    throw error;
  }
}

// Helper function to run the update with error handling
async function runUpdate() {
  try {
    const result = await updateTextLogStatuses();
    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Failed to update text log statuses:", errorMessage);
    process.exit(1);
  }
}

// Export for use as a module or run directly
export { updateTextLogStatuses, runUpdate };
