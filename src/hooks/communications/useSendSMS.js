import { useState, useCallback, useRef, useEffect } from "react";
import { toast } from "react-toastify";
import { useTextLogs } from "../useTextLogs";
import { v4 as uuidv4 } from "uuid"; // Add uuid for generating messageId

export function useSendSMS() {
  const { batchAddTextLogs } = useTextLogs();

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

  const sendMessages = useCallback(
    async (message, recipients, mediaUrls = [], user) => {
      const messageId = uuidv4(); // Generate unique messageId
      const results = [];
      let completedCount = 0;
      let successfulCount = 0;
      let failedCount = 0;
      const totalCount = recipients.length;

      const batchLogs = [];
      const owner_type = "user";
      const owner_id = user?.id;
      const sender_id = user?.id;

      setProgress({
        total: totalCount,
        completed: completedCount,
        successful: successfulCount,
        failed: failedCount,
        results: [],
      });

      setSendStatus("sending");

      // Initialize SSE connection
      try {
        eventSourceRef.current = new EventSource(
          `/api/communications/send-texts/stream?messageId=${messageId}`
        );

        eventSourceRef.current.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            const {
              type,
              status,
              recipient,
              error,
              messageId: receivedMessageId,
            } = data;

            // Ignore messages for other messageIds
            if (receivedMessageId !== messageId) return;

            if (type === "connected") {
              // Stream connected, proceed with sending
            } else if (type === "status") {
              // Process status update
              if (processedMessagesRef.current.has(recipient)) return;
              processedMessagesRef.current.add(recipient);

              const recipientData =
                recipients.find((r) => r.value === recipient) || {};
              const logEntry = {
                message_id: receivedMessageId,
                sender_id,
                recipient_phone: recipient,
                recipient_contact_id: recipientData.contactId || null,
                message_content: message,
                media_urls:
                  mediaUrls.length > 0 ? JSON.stringify(mediaUrls) : null,
                status: status === "success" ? "sent" : "failed",
                error_message: status === "failed" ? error : null,
                owner_id,
                owner_type,
                metadata: JSON.stringify({
                  recipientName: `${recipientData.firstName || ""} ${
                    recipientData.lastName || ""
                  }`.trim(),
                  smsProviderResponse: status === "success" ? data : null,
                }),
              };

              batchLogs.push(logEntry);

              const result = {
                recipient,
                status,
                error: status === "failed" ? error : null,
                timestamp: new Date().toISOString(),
              };

              results.push(result);
              completedCount++;
              if (status === "success") successfulCount++;
              else failedCount++;

              setProgress({
                total: totalCount,
                completed: completedCount,
                successful: successfulCount,
                failed: failedCount,
                results: [...results],
              });
            } else if (type === "complete") {
              // Stream completed
              setSendStatus("completed");
              cleanup();

              // Log all messages in batch
              if (batchLogs.length > 0) {
                batchAddTextLogs(batchLogs).catch((error) => {
                  console.error("Error logging messages:", error);
                  toast.error("Messages sent but logging failed");
                });
              }
            }
          } catch (error) {
            console.error("Error processing stream message:", error);
          }
        };

        eventSourceRef.current.onerror = () => {
          console.error("Stream error occurred");
          setSendStatus("error");
          toast.error("Error receiving status updates");
          cleanup();

          // Log any partial results
          if (batchLogs.length > 0) {
            batchAddTextLogs(batchLogs).catch((error) => {
              console.error("Error logging messages:", error);
              toast.error("Messages may have been sent but logging failed");
            });
          }
        };

        // Send the messages in a single API call
        const response = await fetch(
          `/api/communications/send-texts?messageId=${messageId}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              message,
              recipients: recipients.map((r) => ({
                label: r.label || r.value,
                value: r.value,
              })),
              mediaUrls,
            }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to initiate message sending");
        }

        // Set a timeout to handle cases where the stream doesn't complete
        timeoutRef.current = setTimeout(() => {
          console.error("Stream timeout");
          setSendStatus("error");
          toast.error("Message sending timed out");
          cleanup();

          if (batchLogs.length > 0) {
            batchAddTextLogs(batchLogs).catch((error) => {
              console.error("Error logging messages:", error);
              toast.error("Messages may have been sent but logging failed");
            });
          }
        }, 60000); // 60 seconds timeout
      } catch (error) {
        console.error("Error sending messages:", error);
        setSendStatus("error");
        toast.error("Failed to send messages: " + error.message);
        cleanup();

        // Log any partial results
        if (batchLogs.length > 0) {
          batchAddTextLogs(batchLogs).catch((error) => {
            console.error("Error logging messages:", error);
            toast.error("Messages may have been sent but logging failed");
          });
        }

        return results;
      }

      return results;
    },
    [batchAddTextLogs, cleanup]
  );

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
