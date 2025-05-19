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
    const { message_content, recipients, media_urls, user_id } = scheduledText;

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

    // Get user info for logging metadata
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id, first_name, last_name, email")
      .eq("id", user_id)
      .single();

    if (userError) {
      console.error("Error fetching user data:", userError);
    }

    // Prepare metadata with all recipients (similar to useSendSMS.js)
    const allRecipientsData = parsedRecipients.map((recipient) => ({
      name: recipient.name || recipient.value || recipient.label,
      phone: recipient.phone || recipient.value || recipient.label,
    }));

    // Step 1: Create pending text logs for each recipient
    const pendingLogs = parsedRecipients.map((recipient) => ({
      message_id: messageId,
      sender_id: user_id,
      recipient_phone: recipient.phone || recipient.value || recipient.label,
      recipient_contact_id: recipient.contactId || null,
      message_content: message_content,
      media_urls:
        decodedMediaUrls.length > 0 ? JSON.stringify(decodedMediaUrls) : null,
      status: "pending",
      error_message: null,
      owner_id: user_id,
      owner_type: "user", // Scheduled texts are always user-owned
      metadata: JSON.stringify({
        // Store ALL recipients in the metadata
        allRecipients: allRecipientsData,
        // Include sender info
        sender: {
          id: user_id,
          name: userData
            ? `${userData.first_name || ""} ${userData.last_name || ""}`.trim()
            : "",
          email: userData?.email || "",
        },
        // Mark as scheduled message
        isScheduled: true,
        scheduledTextId: id,
        smsProviderResponse: null,
      }),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

    // Insert pending logs
    const { data: insertedLogs, error: logError } = await supabase
      .from("text_logs")
      .insert(pendingLogs)
      .select();

    if (logError) {
      console.error("Error creating text logs:", logError);
      return new Response(
        JSON.stringify({ error: "Failed to create text logs" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Create a map of recipient phone to log ID for status updates
    const logIdMap = new Map();
    insertedLogs.forEach((log, index) => {
      const recipient = parsedRecipients[index];
      const phone = recipient.phone || recipient.value || recipient.label;
      logIdMap.set(phone, log.id);
    });

    // Step 2: Send messages sequentially and update logs
    for (let i = 0; i < parsedRecipients.length; i++) {
      const recipient = parsedRecipients[i];
      const logId = insertedLogs[i].id;
      const phone = recipient.phone || recipient.value || recipient.label;

      try {
        // Use sendTextWithStream instead of sendSimpleText
        const result = await sendTextWithStream({
          message: message_content,
          recipient: {
            phone: phone,
            name: recipient.name || recipient.value || recipient.label,
          },
          mediaUrls: decodedMediaUrls.length > 0 ? decodedMediaUrls : undefined,
          messageId, // Required for sendTextWithStream
        });

        const deliveryStatus = result.success ? "sent" : "failed";
        const errorMessage = result.success
          ? null
          : result.error || "Failed to send";

        // Update the text log with the result
        const { error: updateError } = await supabase
          .from("text_logs")
          .update({
            status: deliveryStatus,
            sent_at: result.success ? new Date().toISOString() : null,
            error_message: errorMessage,
            updated_at: new Date().toISOString(),
            metadata: JSON.stringify({
              // Store ALL recipients in the metadata
              allRecipients: allRecipientsData,
              // Include sender info
              sender: {
                id: user_id,
                name: userData
                  ? `${userData.first_name || ""} ${
                      userData.last_name || ""
                    }`.trim()
                  : "",
                email: userData?.email || "",
              },
              // Mark as scheduled message
              isScheduled: true,
              scheduledTextId: id,
              smsProviderResponse: result.success ? result : null,
            }),
          })
          .eq("id", logId);

        if (updateError) {
          console.error(`Error updating text log ${logId}:`, updateError);
        }

        results.push({
          recipient: recipient.name || recipient.value || recipient.label,
          status: deliveryStatus,
          messageId: result.messageId,
          error: errorMessage,
          logId: logId,
        });
      } catch (error) {
        console.error(
          `Error sending to ${recipient.name || recipient.value}:`,
          error
        );

        // Update the text log with failure status
        const { error: updateError } = await supabase
          .from("text_logs")
          .update({
            status: "failed",
            error_message: error.message,
            updated_at: new Date().toISOString(),
            metadata: JSON.stringify({
              // Store ALL recipients in the metadata
              allRecipients: allRecipientsData,
              // Include sender info
              sender: {
                id: user_id,
                name: userData
                  ? `${userData.first_name || ""} ${
                      userData.last_name || ""
                    }`.trim()
                  : "",
                email: userData?.email || "",
              },
              // Mark as scheduled message
              isScheduled: true,
              scheduledTextId: id,
              smsProviderResponse: null,
            }),
          })
          .eq("id", logId);

        if (updateError) {
          console.error(
            `Error updating failed text log ${logId}:`,
            updateError
          );
        }

        results.push({
          recipient: recipient.name || recipient.value || recipient.label,
          status: "failed",
          error: error.message,
          logId: logId,
        });
      }
    }

    // Step 3: Update the scheduled_texts table with delivery results
    const { error: updateError } = await supabase
      .from("scheduled_texts")
      .update({
        metadata: {
          ...scheduledText.metadata,
          sent_at: new Date().toISOString(),
          delivery_results: results,
          message_id: messageId, // Link to the message_id used in text_logs
        },
      })
      .eq("id", id);

    if (updateError) {
      console.error("Error updating scheduled text status:", updateError);
    }

    // Step 4: Delete the scheduled text after successful processing
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
        logsCreated: insertedLogs.length,
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
