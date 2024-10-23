import { useState, useCallback, useRef } from "react";

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

  const sendMessages = useCallback(async (message, recipients) => {
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
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      console.log("Establishing SSE connection...");
      eventSourceRef.current = new EventSource(
        `/api/communications/send-texts/stream?messageId=${messageId}`,
        { withCredentials: true }
      );

      // Create a promise that tracks message completion
      const messageCompletionPromise = new Promise((resolve, reject) => {
        let processedCount = 0;
        const totalExpectedMessages = recipients.length;

        eventSourceRef.current.onmessage = (event) => {
          console.log("Received result:", event.data);
          const data = JSON.parse(event.data);

          if (
            !data.type &&
            (data.status === "success" || data.status === "failed")
          ) {
            processedCount++;

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

            // Check if we've processed all expected messages
            if (processedCount === totalExpectedMessages) {
              console.log("All messages processed");
              resolve();
            }
          }
        };

        eventSourceRef.current.onerror = (error) => {
          console.error("SSE error:", error);
          reject(new Error("Stream connection error"));
        };
      });

      // Send the message request
      console.log("Sending messages request...");
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
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to send messages");
      }

      // Wait for all messages to be processed
      await messageCompletionPromise;

      // Clean up
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      setSendStatus("completed");
    } catch (error) {
      console.error("Send messages error:", error);
      setSendStatus("error");
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      throw error;
    }
  }, []);

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
  }, []);

  return {
    sendStatus,
    progress,
    sendMessages,
    reset,
  };
}
