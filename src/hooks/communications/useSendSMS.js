import { useState, useCallback, useRef, useEffect } from "react";
import { toast } from "react-toastify";

export function useSendSMS() {
  const [sendStatus, setSendStatus] = useState("idle");
  const [progress, setProgress] = useState({
    total: 0,
    completed: 0,
    successful: 0,
    failed: 0,
    results: [],
  });

  const eventSourceRef = useRef(null);
  const processedMessagesRef = useRef(new Set());
  const timeoutRef = useRef(null);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    processedMessagesRef.current.clear();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  const sendMessages = async (message, recipients, mediaUrls = []) => {
    const results = [];
    let completedCount = 0;
    let successfulCount = 0;
    let failedCount = 0;
    const totalCount = recipients.length;

    // Import the hook we just created for logging
    const { addTextLog, batchAddTextLogs } = useTextLogs(user?.id);

    // Prepare batch logs array for efficiency
    const batchLogs = [];

    // Determine the owner_type and owner_id based on context
    // This would likely come from your component state or props
    // For this example, we'll assume it's the current user
    const owner_type = "user";
    const owner_id = user?.id;

    setProgress({
      total: totalCount,
      completed: completedCount,
      successful: successfulCount,
      failed: failedCount,
      results: [],
    });

    setSendStatus("sending");

    for (const recipient of recipients) {
      try {
        // Call your existing SMS sending API
        const response = await fetch("/api/communications/send-sms", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to: recipient.value,
            message: message,
            mediaUrls: mediaUrls,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to send message");
        }

        // Log the successful message
        const logEntry = {
          message_id: data.messageId, // This would come from your SMS provider
          sender_id: user?.id,
          recipient_phone: recipient.value,
          recipient_contact_id: recipient.contactId || null,
          message_content: message,
          media_urls: mediaUrls.length > 0 ? JSON.stringify(mediaUrls) : null,
          status: "sent", // Initial status
          owner_id: owner_id,
          owner_type: owner_type,
          metadata: JSON.stringify({
            recipientName: `${recipient.firstName || ""} ${
              recipient.lastName || ""
            }`.trim(),
            smsProviderResponse: data,
          }),
        };

        // Add to batch for efficient insertion
        batchLogs.push(logEntry);

        const result = {
          recipient: recipient.value,
          status: "success",
          error: null,
          timestamp: new Date().toISOString(),
        };

        results.push(result);
        completedCount++;
        successfulCount++;
      } catch (error) {
        console.error("Error sending message:", error);

        // Log the failed message
        const logEntry = {
          sender_id: user?.id,
          recipient_phone: recipient.value,
          recipient_contact_id: recipient.contactId || null,
          message_content: message,
          media_urls: mediaUrls.length > 0 ? JSON.stringify(mediaUrls) : null,
          status: "failed",
          error_message: error.message,
          owner_id: owner_id,
          owner_type: owner_type,
          metadata: JSON.stringify({
            recipientName: `${recipient.firstName || ""} ${
              recipient.lastName || ""
            }`.trim(),
          }),
        };

        // Add to batch for efficient insertion
        batchLogs.push(logEntry);

        const result = {
          recipient: recipient.value,
          status: "failed",
          error: error.message,
          timestamp: new Date().toISOString(),
        };

        results.push(result);
        completedCount++;
        failedCount++;
      }

      setProgress({
        total: totalCount,
        completed: completedCount,
        successful: successfulCount,
        failed: failedCount,
        results: [...results],
      });
    }

    // Log all messages in a batch for better performance
    if (batchLogs.length > 0) {
      try {
        await batchAddTextLogs(batchLogs);
      } catch (error) {
        console.error("Error logging messages:", error);
        // Don't let logging failure stop the overall process
        toast.error("Message sent but logging failed");
      }
    }

    setSendStatus("completed");
    return results;
  };

  const reset = useCallback(() => {
    setSendStatus("idle");
    setProgress({
      total: 0,
      completed: 0,
      successful: 0,
      failed: 0,
      results: [],
    });
    cleanup();
  }, [cleanup]);

  return {
    sendStatus,
    progress,
    sendMessages,
    reset,
  };
}
