// Updated useScheduledTexts hook to include group information
import { useState, useCallback } from "react";
import { supabase } from "@/util/supabase";
import { toast } from "react-toastify";

export function useScheduledTexts() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Helper function to extract groups from selected recipients
  const extractGroupsFromRecipients = (selectedRecipients) => {
    const groups = selectedRecipients
      .filter(
        (recipient) => recipient.value && recipient.value.startsWith("group:")
      )
      .map((recipient) => ({
        value: recipient.value,
        label: recipient.originalValue || recipient.value.replace("group:", ""),
        originalValue:
          recipient.originalValue || recipient.value.replace("group:", ""),
      }));

    return groups;
  };

  const scheduleText = useCallback(
    async (
      message,
      selectedRecipients, // This includes both individual recipients and groups
      scheduledDateTime,
      mediaUrls = [],
      user
    ) => {
      setLoading(true);
      setError(null);

      try {
        // Extract groups from selectedRecipients (before expansion)
        const selectedGroups = extractGroupsFromRecipients(selectedRecipients);

        // Filter to get only non-group recipients (the expanded recipients)
        const expandedRecipients = selectedRecipients.filter(
          (recipient) =>
            !recipient.value || !recipient.value.startsWith("group:")
        );

        // Create enhanced metadata with groups information
        const scheduledTextData = {
          message_content: message,
          scheduled_time: scheduledDateTime,
          user_id: user.id,
          recipients: JSON.stringify(
            expandedRecipients.map((recipient) => ({
              phone: recipient.value || recipient.phone,
              name:
                `${recipient.firstName || ""} ${
                  recipient.lastName || ""
                }`.trim() || recipient.label,
              contactId: recipient.contactId || null,
              groups: recipient.groups || [],
              ownerType: recipient.ownerType || null,
              ownerId: recipient.ownerId || null,
            }))
          ),
          media_urls: mediaUrls.length > 0 ? JSON.stringify(mediaUrls) : null,

          metadata: JSON.stringify({
            // Store the original selected groups
            selectedGroups: selectedGroups,
            // Store expanded recipients info
            allRecipients: expandedRecipients.map((recipient) => ({
              name:
                `${recipient.firstName || ""} ${
                  recipient.lastName || ""
                }`.trim() || recipient.label,
              phone: recipient.value || recipient.phone,
              contactId: recipient.contactId || null,
              groups: recipient.groups || [],
              ownerType: recipient.ownerType || null,
              ownerId: recipient.ownerId || null,
            })),
            // Include sender info
            sender: {
              id: user.id,
              name: `${user.first_name || ""} ${user.last_name || ""}`.trim(),
              email: user.email || "",
            },
            // Additional metadata
            messageType: mediaUrls && mediaUrls.length > 0 ? "mms" : "sms",
            recipientCount: expandedRecipients.length,
            groupCount: selectedGroups.length,
            scheduledAt: new Date().toISOString(),
          }),
          created_at: new Date().toISOString(),
        };

        const { data, error: insertError } = await supabase
          .from("scheduled_texts")
          .insert([scheduledTextData])
          .select()
          .single();

        if (insertError) {
          throw insertError;
        }

        toast.success(
          `Message scheduled successfully for ${expandedRecipients.length} recipients!`
        );

        return { data, error: null };
      } catch (err) {
        console.error("Error scheduling text:", err);
        setError(err.message);
        toast.error(`Failed to schedule message: ${err.message}`);
        return { data: null, error: err.message };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Other functions remain the same...
  const fetchScheduledTexts = useCallback(async (userId) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from("scheduled_texts")
        .select("*")
        .eq("user_id", userId)
        .order("scheduled_time", { ascending: true });

      if (fetchError) {
        throw fetchError;
      }

      return { data, error: null };
    } catch (err) {
      console.error("Error fetching scheduled texts:", err);
      setError(err.message);
      return { data: null, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteScheduledText = useCallback(async (id) => {
    setLoading(true);
    setError(null);

    try {
      const { error: deleteError } = await supabase
        .from("scheduled_texts")
        .delete()
        .eq("id", id);

      if (deleteError) {
        throw deleteError;
      }

      toast.success("Scheduled message deleted successfully!");
      return { error: null };
    } catch (err) {
      console.error("Error deleting scheduled text:", err);
      setError(err.message);
      toast.error(`Failed to delete scheduled message: ${err.message}`);
      return { error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    scheduleText,
    fetchScheduledTexts,
    deleteScheduledText,
  };
}
