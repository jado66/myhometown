import { useState, useCallback, useRef } from "react";
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

  const sendMessages = useCallback(
    async (message, recipients, mediaUrls = []) => {
      setSendStatus("sending");
      setProgress((prev) => ({
        ...prev,
        total: recipients.length,
        completed: 0,
        successful: 0,
        failed: 0,
        results: [],
      }));

      // Clear the processed messages set
      processedMessagesRef.current.clear();

      const messageId = Date.now().toString();

      try {
        if (eventSourceRef.current) {
          eventSourceRef.current.close();
        }

        console.log("Establishing SSE connection...");
        eventSourceRef.current = new EventSource(
          `/api/communications/send-texts/stream?messageId=${messageId}`,
          { withCredentials: true }
        );

        const messageCompletionPromise = new Promise((resolve, reject) => {
          eventSourceRef.current.onmessage = (event) => {
            console.log("Received SSE message:", event.data);
            const data = JSON.parse(event.data);

            if (data.type === "connected") {
              console.log("SSE Connection established");
              return;
            }

            if (data.type === "complete") {
              console.log("All messages processed, closing connection");
              if (eventSourceRef.current) {
                eventSourceRef.current.close();
              }
              resolve();
              return;
            }

            // type status
            if (data.type === "status") {
              console.log("Received status update:", data);
              return;
            }

            if (data.type === "error") {
              console.error("Stream error:", data.error);
              if (eventSourceRef.current) {
                eventSourceRef.current.close();
              }
              reject(new Error(data.error));
              return;
            }

            // Deduplicate messages based on messageId and recipient
            const messageKey = `${data.messageId}-${data.recipient}`;
            if (processedMessagesRef.current.has(messageKey)) {
              console.log("Duplicate message detected, skipping:", messageKey);
              return;
            }
            processedMessagesRef.current.add(messageKey);

            // Update progress for individual message results
            setProgress((prev) => {
              const newResults = [...prev.results, data];
              const successful = newResults.filter(
                (r) => r.status === "success"
              ).length;
              const failed = newResults.filter(
                (r) => r.status === "failed"
              ).length;

              return {
                ...prev,
                completed: successful + failed,
                successful,
                failed,
                results: newResults,
              };
            });
          };

          eventSourceRef.current.onerror = (error) => {
            console.error("SSE connection error:", error);
            if (eventSourceRef.current) {
              eventSourceRef.current.close();
            }
            reject(new Error("Stream connection error"));
          };
        });

        // Send the messages
        const response = await fetch(
          `/api/communications/send-texts?messageId=${messageId}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              message,
              recipients,
              mediaUrls: Array.isArray(mediaUrls)
                ? mediaUrls
                : [mediaUrls].filter(Boolean),
            }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to send messages");
        }

        await messageCompletionPromise;
        setSendStatus("completed");

        // Show completion toast with success/failure count
        setProgress((prev) => {
          const message =
            prev.failed > 0
              ? `Sent ${prev.successful} of ${prev.total} messages successfully (${prev.failed} failed)`
              : `Successfully sent ${prev.successful} of ${prev.total} messages`;

          if (prev.failed > 0) {
            toast.warning(message);
          } else {
            toast.success(message);
          }

          return prev;
        });
      } catch (error) {
        console.error("Send messages error:", error);
        setSendStatus("error");
        if (eventSourceRef.current) {
          eventSourceRef.current.close();
        }

        // Show error toast
        toast.error("Failed to send messages");

        throw error;
      }
    },
    []
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
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }
    processedMessagesRef.current.clear();
  }, []);

  return {
    sendStatus,
    progress,
    sendMessages,
    reset,
  };
}
