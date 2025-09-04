import { supabase } from "@/util/supabase";
import { useState, useCallback, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { v4 as uuidv4 } from "uuid";

export function useSendSMS(user) {
  const [sendStatus, setSendStatus] = useState("idle");
  const [progress, setProgress] = useState({
    total: 0,
    completed: 0,
    successful: 0,
    failed: 0,
    results: [],
    batchId: null,
  });

  const extractGroupsFromRecipients = (selectedRecipients) => {
    return selectedRecipients
      .filter((r) => r.value?.startsWith("group:"))
      .map((r) => ({
        value: r.value,
        label: r.originalValue || r.value.replace("group:", ""),
        originalValue: r.originalValue || r.value.replace("group:", ""),
      }));
  };

  const sendMessages = useCallback(
    async (message, recipients, mediaUrls = [], selectedRecipients = []) => {
      const messageId = uuidv4();
      const owner_type = "user";
      const owner_id = user?.id;
      const sender_id = user?.id;

      setSendStatus("sending");
      setProgress({
        total: recipients.length,
        completed: 0,
        successful: 0,
        failed: 0,
        results: [],
        batchId: null,
      });

      const selectedGroups = extractGroupsFromRecipients(selectedRecipients);
      const allRecipientsData = recipients.map((r) => ({
        name: `${r.firstName || ""} ${r.lastName || ""}`.trim(),
        phone: r.value,
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
        recipientCount: recipients.length,
        groupCount: selectedGroups.length,
        sentAt: new Date().toISOString(),
      };

      try {
        // Create batch in Supabase
        const { data: batch, error: batchError } = await supabase
          .from("text_batches")
          .insert({
            sender_id,
            owner_type,
            owner_id,
            message_content: message,
            media_urls: mediaUrls.length > 0 ? mediaUrls : null,
            status: "in_progress",
            total_count: recipients.length,
            pending_count: recipients.length,
            metadata,
          })
          .select()
          .single();

        if (batchError) {
          toast.error("Failed to create batch: " + batchError.message);
          setSendStatus("error");
          return [];
        }

        // Update progress with batchId
        setProgress((prev) => ({
          ...prev,
          batchId: batch.id,
        }));

        // Batch insert pending logs
        const pendingLogs = recipients.map((r) => ({
          batch_id: batch.id,
          message_id: messageId,
          sender_id,
          recipient_phone: r.value,
          recipient_contact_id: r.contactId || null,
          message_content: message,
          media_urls: mediaUrls.length > 0 ? JSON.stringify(mediaUrls) : null,
          status: "pending",
          error_message: null,
          owner_id,
          owner_type,
          metadata: JSON.stringify(metadata),
        }));

        const { data: logData, error: logError } = await supabase
          .from("text_logs")
          .insert(pendingLogs)
          .select();

        if (logError) {
          toast.error("Failed to log pending messages: " + logError.message);
          setSendStatus("error");
          return [];
        }

        // Map log IDs for webhook
        const logIdMap = new Map();
        logData.forEach((log, idx) => {
          logIdMap.set(recipients[idx].value, log.id);
        });

        // Initiate sends via API
        const response = await fetch(
          `/api/communications/send-texts?batchId=${batch.id}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              message,
              recipients: recipients.map((r) => ({
                phone: r.value,
                logId: logIdMap.get(r.value),
              })),
              mediaUrls,
            }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          toast.error(data.error || "Failed to initiate sending");
          setSendStatus("error");
          return [];
        }

        // Update progress based on API response
        if (data.summary) {
          setProgress((prev) => ({
            ...prev,
            total: data.summary.total,
            completed: data.summary.total, // All messages processed
            successful: data.summary.successful,
            failed: data.summary.failed,
            results: data.summary.results || [],
          }));
        }

        setSendStatus("completed");

        return data;
      } catch (error) {
        console.error("Error in sendMessages:", error);
        setSendStatus("error");
        setProgress((prev) => ({
          ...prev,
          error: error.message,
        }));
        throw error;
      }
    },
    [user]
  );

  const reset = useCallback(() => {
    setSendStatus("idle");
    setProgress({
      total: 0,
      completed: 0,
      successful: 0,
      failed: 0,
      results: [],
      batchId: null,
    });
  }, []);

  return { sendStatus, progress, sendMessages, reset };
}
