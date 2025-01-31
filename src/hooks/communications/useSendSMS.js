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

  const sendMessages = useCallback(
    async (message, recipients, mediaUrls = []) => {
      cleanup(); // Clean up any existing connections
      setSendStatus("sending");
      setProgress((prev) => ({
        ...prev,
        total: recipients.length,
        completed: 0,
        successful: 0,
        failed: 0,
        results: [],
      }));

      const messageId = Date.now().toString();

      try {
        // Set up event source with timeout
        eventSourceRef.current = new EventSource(
          `/api/communications/send-texts/stream?messageId=${messageId}`,
          { withCredentials: true }
        );

        const messageCompletionPromise = new Promise((resolve, reject) => {
          // Set timeout for entire operation
          timeoutRef.current = setTimeout(() => {
            reject(new Error("Operation timed out"));
            cleanup();
          }, 60000); // 60 second timeout

          eventSourceRef.current.onmessage = (event) => {
            try {
              const data = JSON.parse(event.data);
              console.log("SSE message received:", data);

              switch (data.type) {
                case "connected":
                  console.log("SSE Connection established");
                  break;

                case "complete":
                  console.log("All messages processed");
                  clearTimeout(timeoutRef.current);
                  resolve();
                  cleanup();
                  break;

                case "error":
                  console.error("Stream error:", data.error);
                  reject(new Error(data.error));
                  cleanup();
                  break;

                case "status":
                  const messageKey = `${data.messageId}-${data.recipient}`;
                  if (!processedMessagesRef.current.has(messageKey)) {
                    processedMessagesRef.current.add(messageKey);
                    setProgress((prev) => {
                      const newResults = [...prev.results, data];
                      return {
                        ...prev,
                        completed: newResults.length,
                        successful: newResults.filter(
                          (r) => r.status === "success"
                        ).length,
                        failed: newResults.filter((r) => r.status === "failed")
                          .length,
                        results: newResults,
                      };
                    });
                  }
                  break;
              }
            } catch (error) {
              console.error("Error processing SSE message:", error);
            }
          };

          eventSourceRef.current.onerror = (error) => {
            console.error("SSE connection error:", error);
            reject(new Error("Stream connection error"));
            cleanup();
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

        // Show completion toast
        setProgress((prev) => {
          const message =
            prev.failed > 0
              ? `Sent ${prev.successful} of ${prev.total} messages successfully (${prev.failed} failed)`
              : `Successfully sent ${prev.successful} of ${prev.total} messages`;

          prev.failed > 0 ? toast.warning(message) : toast.success(message);
          return prev;
        });
      } catch (error) {
        console.error("Send messages error:", error);
        setSendStatus("error");
        cleanup();
        toast.error(`Failed to send messages: ${error.message}`);
        throw error;
      }
    },
    [cleanup]
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
