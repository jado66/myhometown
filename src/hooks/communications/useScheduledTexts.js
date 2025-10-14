// @/hooks/communications/useScheduledTexts.js
import { supabase } from "@/util/supabase";
import { useState, useCallback } from "react";
import { toast } from "react-toastify";
import { v4 as uuidv4 } from "uuid";

export function useScheduledTexts() {
  const [loading, setLoading] = useState(false);

  const extractGroupsFromRecipients = (selectedRecipients) => {
    return selectedRecipients
      .filter((r) => r.value?.startsWith("group:"))
      .map((r) => ({
        value: r.value,
        label: r.originalValue || r.value.replace("group:", ""),
        originalValue: r.originalValue || r.value.replace("group:", ""),
      }));
  };

  const scheduleText = useCallback(
    async (message, recipients, scheduledDate, mediaUrls = [], user) => {
      const messageId = uuidv4();

      const owner_type = "user";
      const owner_id = user?.id || "00000000-0000-0000-0000-000000000000";
      const sender_id = user?.id || "00000000-0000-0000-0000-000000000000";

      setLoading(true);

      // Deduplicate & expand recipients (reuse your expandGroupsWithAdminFilter if passed)
      const phoneNumberMap = new Map();
      let uniqueRecipients = [];
      recipients.forEach((r) => {
        if (r.value?.startsWith("group:")) {
          // Assume you pass expanded groups; otherwise, expand here using allContacts (add as param if needed)
          const groupContacts = []; // TODO: Expand if not pre-expanded
          groupContacts.forEach((contact) => {
            const phone = contact.phone || contact.value;
            if (phone && !phoneNumberMap.has(phone)) {
              phoneNumberMap.set(phone, true);
              uniqueRecipients.push(contact);
            }
          });
        } else {
          const phone = r.value || r.phone;
          if (phone && !phoneNumberMap.has(phone)) {
            phoneNumberMap.set(phone, true);
            uniqueRecipients.push(r);
          }
        }
      });

      const selectedGroups = extractGroupsFromRecipients(recipients);
      const allRecipientsData = uniqueRecipients.map((r) => ({
        name: `${r.firstName || ""} ${r.lastName || ""}`.trim(),
        phone: r.value || r.phone,
        contactId: r.contactId || null,
        groups: r.groups || [],
        ownerType: r.ownerType || null,
        ownerId: r.ownerId || null,
      }));

      const metadata = {
        allRecipients: allRecipientsData,
        selectedGroups,
        sender: {
          id: user?.id,
          name: `${user?.first_name || ""} ${user?.last_name || ""}`.trim(),
        },
        messageType: mediaUrls.length > 0 ? "mms" : "sms",
        recipientCount: uniqueRecipients.length,
        groupCount: selectedGroups.length,
        scheduledAt: scheduledDate.toISOString(),
      };

      try {
        // Step 1: Create batch (status: "scheduled")
        const { data: batch, error: batchError } = await supabase
          .from("text_batches")
          .insert({
            sender_id,
            owner_type,
            owner_id,
            message_content: message,
            media_urls: mediaUrls.length > 0 ? mediaUrls : null,
            status: "scheduled",
            total_count: uniqueRecipients.length,
            pending_count: uniqueRecipients.length,
            scheduled_at: scheduledDate,
            metadata,
          })
          .select()
          .single();

        if (batchError) {
          throw new Error(
            "Failed to create scheduled batch: " + batchError.message
          );
        }

        // Step 2: Create logs (status: "scheduled")
        const scheduledLogs = uniqueRecipients.map((r) => ({
          batch_id: batch.id,
          message_id: messageId,
          sender_id,
          recipient_phone: r.phone || r.value,
          recipient_contact_id: r.contactId || null,
          message_content: message,
          media_urls: mediaUrls.length > 0 ? JSON.stringify(mediaUrls) : null,
          status: "scheduled",
          error_message: null,
          owner_id,
          owner_type,
          scheduled_at: scheduledDate,
          metadata: JSON.stringify(metadata),
        }));

        const { error: logError } = await supabase
          .from("text_logs")
          .insert(scheduledLogs);

        if (logError) {
          throw new Error(
            "Failed to log scheduled messages: " + logError.message
          );
        }

        // Step 3: Create scheduled_texts entry (for cron) + link batch_id
        const { data: scheduledText, error: scheduledError } = await supabase
          .from("scheduled_texts")
          .insert({
            user_id: sender_id, // Required: user who scheduled the text
            message_content: message,
            media_urls: mediaUrls,
            recipients: uniqueRecipients, // Store as JSON array
            scheduled_time: scheduledDate,
            status: "scheduled",
            metadata: { ...metadata, batch_id: batch.id }, // Link for send endpoint
            batch_id: batch.id, // Direct FK if you added it
          })
          .select()
          .single();

        if (scheduledError) {
          throw new Error(
            "Failed to create scheduled entry: " + scheduledError.message
          );
        }

        toast.success(
          `Scheduled ${
            uniqueRecipients.length
          } messages for ${scheduledDate.toLocaleString()}`
        );
        setLoading(false);

        return {
          success: true,
          batchId: batch.id,
          scheduledTextId: scheduledText.id, // Change if you return the actual scheduled_texts ID
          summary: {
            total: uniqueRecipients.length,
            scheduled: uniqueRecipients.length,
          },
        };
      } catch (error) {
        console.error("Error in scheduleText:", error);
        toast.error("Failed to schedule: " + error.message);
        setLoading(false);
        return { error: error.message };
      }
    },
    [] // No user dep if not needed; add back if dynamic
  );

  return { scheduleText, loading };
}
