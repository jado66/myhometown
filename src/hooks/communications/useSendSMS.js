import { useState, useCallback, useRef, useEffect } from "react";
import { toast } from "react-toastify";
import { useTextLogs } from "../useTextLogs";
import { v4 as uuidv4 } from "uuid";

export function useSendSMS() {
  const { batchAddTextLogs, updateTextLogStatus } = useTextLogs();

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
  const logIdsRef = useRef(new Map()); // Track log IDs for each recipient
  const batchLogsRef = useRef([]); // Keep track of logs for fallback batch logging

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
    logIdsRef.current.clear();
    batchLogsRef.current = [];
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  const sendMessages = useCallback(
    async (message, recipients, mediaUrls = [], user) => {
      const messageId = uuidv4();
      const results = [];
      let completedCount = 0;
      let successfulCount = 0;
      let failedCount = 0;
      const totalCount = recipients.length;

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

      // Create a recipients list for metadata - all recipients
      const allRecipientsData = recipients.map((recipient) => ({
        name: `${recipient.firstName || ""} ${recipient.lastName || ""}`.trim(),
        phone: recipient.value,
      }));

      // Step 1: Log all messages as "pending"
      const pendingLogs = recipients.map((recipient) => ({
        message_id: messageId,
        sender_id,
        recipient_phone: recipient.value,
        recipient_contact_id: recipient.contactId || null,
        message_content: message,
        media_urls: mediaUrls.length > 0 ? JSON.stringify(mediaUrls) : null,
        status: "pending",
        error_message: null,
        owner_id,
        owner_type,
        metadata: JSON.stringify({
          // Store ALL recipients in the metadata instead of just one
          allRecipients: allRecipientsData,
          // Include sender info
          sender: {
            id: user?.id,
            name: `${user?.first_name || ""} ${user?.last_name || ""}`.trim(),
          },
          smsProviderResponse: null,
        }),
      }));

      try {
        const { data: pendingLogData, error: pendingLogError } =
          await batchAddTextLogs(pendingLogs, sender_id);
        if (pendingLogError) {
          console.error("Error logging pending messages:", pendingLogError);
          toast.error("Failed to log pending messages");
          setSendStatus("error");
          return results;
        }

        // Store log IDs for status updates
        pendingLogData.forEach((log, index) => {
          logIdsRef.current.set(recipients[index].value, log.id);
        });
      } catch (error) {
        console.error("Error during batchAddTextLogs:", error);
        toast.error("Failed to log messages: " + error.message);
        setSendStatus("error");
        return results;
      }

      // Step 2: Initialize SSE connection
      try {
        eventSourceRef.current = new EventSource(
          `/api/communications/send-texts/stream?messageId=${messageId}`
        );

        // Inside the onmessage event handler of useSendSMS hook
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
              console.debug("SSE stream connected for messageId:", messageId);
            } else if (type === "status") {
              // Process status update
              if (processedMessagesRef.current.has(recipient)) {
                console.warn(
                  "Duplicate status update for recipient:",
                  recipient
                );
                return;
              }
              processedMessagesRef.current.add(recipient);

              const logId = logIdsRef.current.get(recipient);
              const recipientData =
                recipients.find((r) => r.value === recipient) || {};

              // Store log entry for fallback batch logging
              const logEntry = {
                id: logId,
                message_id: messageId,
                sender_id,
                recipient_phone: recipient,
                recipient_contact_id: recipientData.contactId || null,
                message_content: message,
                media_urls:
                  mediaUrls.length > 0 ? JSON.stringify(mediaUrls) : null,
                status: status === "success" ? "sent" : "failed",
                error_message: status === "failed" ? error : null,
                sent_at: status === "success" ? new Date().toISOString() : null,
                owner_id,
                owner_type,
                metadata: JSON.stringify({
                  // Store ALL recipients in the metadata
                  allRecipients: allRecipientsData,
                  // Include sender info
                  sender: {
                    id: user?.id,
                    name: `${user?.first_name || ""} ${
                      user?.last_name || ""
                    }`.trim(),
                  },
                  smsProviderResponse: status === "success" ? data : null,
                }),
              };
              batchLogsRef.current.push(logEntry);

              // Update the log status
              if (logId) {
                // Try multiple times with exponential backoff if needed
                const retryUpdate = async (attempts = 3, delay = 500) => {
                  try {
                    const result = await updateTextLogStatus(
                      logId,
                      status === "success" ? "sent" : "failed",
                      status === "success" ? new Date().toISOString() : null,
                      status === "failed" ? error : null,
                      JSON.stringify({
                        // Store ALL recipients in the metadata
                        allRecipients: allRecipientsData,
                        // Include sender info
                        sender: {
                          id: user?.id,
                          name: `${user?.first_name || ""} ${
                            user?.last_name || ""
                          }`.trim(),
                        },
                        smsProviderResponse: status === "success" ? data : null,
                      })
                    );

                    if (result.error) {
                      throw new Error(result.error);
                    }

                    // Log success
                    console.debug(
                      `Successfully updated log ${logId} to ${status}`
                    );
                  } catch (err) {
                    console.error(
                      `Error updating log ${logId} (attempt ${4 - attempts}):`,
                      err
                    );

                    if (attempts > 1) {
                      // Wait and retry with exponential backoff
                      await new Promise((resolve) =>
                        setTimeout(resolve, delay)
                      );
                      await retryUpdate(attempts - 1, delay * 2);
                    } else {
                      console.error(
                        `Failed to update log ${logId} after multiple attempts`
                      );
                      // We'll fall back to batch processing when the stream completes
                    }
                  }
                };

                // Start the retry process
                retryUpdate();
              }

              // Rest of the existing code...
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
              // Handle the completion event
              console.debug("SSE stream completed for messageId:", messageId);
              setSendStatus("completed");
              toast.success("All messages processed successfully!");

              // Fallback: If we have batch logs, try to re-log them all
              if (batchLogsRef.current.length > 0) {
                // Process any logs that might not have been successfully updated
                const processFailedUpdates = async () => {
                  for (const log of batchLogsRef.current) {
                    if (log.id) {
                      try {
                        // Make sure we're using the updated metadata structure with all recipients
                        const result = await updateTextLogStatus(
                          log.id,
                          log.status,
                          log.sent_at,
                          log.error_message,
                          log.metadata // Use the full metadata we created earlier
                        );

                        if (result.error) {
                          console.error(
                            `Error updating log ${log.id}:`,
                            result.error
                          );
                        } else {
                          console.debug(
                            `Successfully updated log ${log.id} in fallback`
                          );
                        }
                      } catch (err) {
                        console.error(
                          `Failed to update log ${log.id} in fallback:`,
                          err
                        );
                      }
                    }
                  }
                };

                processFailedUpdates();
              }

              cleanup();

              // Handle any remaining pending logs
              const pendingRecipients = recipients.filter(
                (r) => !processedMessagesRef.current.has(r.value)
              );

              if (pendingRecipients.length > 0) {
                console.warn(
                  "Pending logs detected:",
                  pendingRecipients.length
                );

                const processPendingLogs = async () => {
                  for (const recipient of pendingRecipients) {
                    const logId = logIdsRef.current.get(recipient.value);
                    if (logId) {
                      try {
                        const result = await updateTextLogStatus(
                          logId,
                          "failed",
                          null,
                          "No status update received from stream",
                          JSON.stringify({
                            // Store ALL recipients in the metadata
                            allRecipients: allRecipientsData,
                            // Include sender info
                            sender: {
                              id: user?.id,
                              name: `${user?.first_name || ""} ${
                                user?.last_name || ""
                              }`.trim(),
                            },
                            smsProviderResponse: null,
                          })
                        );

                        if (result.error) {
                          console.error(
                            `Error updating pending log ${logId}:`,
                            result.error
                          );
                        }
                      } catch (err) {
                        console.error(
                          `Failed to update pending log ${logId}:`,
                          err
                        );
                      }
                    }
                  }
                };

                processPendingLogs();
              }
            }
          } catch (error) {
            console.error("Error processing stream message:", error);
          }
        };

        eventSourceRef.current.onerror = () => {
          console.error("SSE stream error for messageId:", messageId);
          setSendStatus("error");
          toast.error("Error receiving status updates");

          // Fallback: If we have batch logs, try to update them all
          if (batchLogsRef.current.length > 0) {
            // Create new logs without IDs for completed messages
            const newBatchLogs = batchLogsRef.current.map((log) => {
              // Remove the id field from each log for re-logging
              const { id, ...logWithoutId } = log;
              return logWithoutId;
            });

            // Try batch updating all logs as a fallback
            batchAddTextLogs(newBatchLogs, sender_id).catch((err) => {
              console.error("Error with fallback batch logging:", err);

              // Last resort: Use batch update endpoint
              fetch("/api/communications/batch-update-text-logs", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  logs: batchLogsRef.current
                    .filter((log) => log.id) // Only include logs with IDs
                    .map((log) => ({
                      id: log.id,
                      status: log.status,
                      sent_at: log.sent_at,
                      error_message: log.error_message,
                      metadata: log.metadata, // Include the metadata with all recipients
                    })),
                }),
              }).catch((batchErr) => {
                console.error("Failed batch update:", batchErr);

                // Absolute last resort: Update each log individually
                batchLogsRef.current.forEach((log) => {
                  if (log.id) {
                    fetch(`/api/communications/update-text-log`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        logId: log.id,
                        status: log.status,
                        sentAt: log.sent_at,
                        errorMessage: log.error_message,
                        metadata: log.metadata, // Include the metadata with all recipients
                      }),
                    }).catch((patchErr) => {
                      console.error(
                        `Failed direct update for log ID ${log.id}:`,
                        patchErr
                      );
                    });
                  }
                });
              });
            });
          }

          cleanup();

          // Update pending logs to "failed"
          recipients.forEach((recipient) => {
            if (!processedMessagesRef.current.has(recipient.value)) {
              const logId = logIdsRef.current.get(recipient.value);
              if (logId) {
                updateTextLogStatus(
                  logId,
                  "failed",
                  null,
                  "Stream disconnected",
                  JSON.stringify({
                    // Store ALL recipients in the metadata
                    allRecipients: allRecipientsData,
                    // Include sender info
                    sender: {
                      id: user?.id,
                      name: `${user?.first_name || ""} ${
                        user?.last_name || ""
                      }`.trim(),
                    },
                    smsProviderResponse: null,
                  })
                ).catch((err) => {
                  console.error(
                    "Error updating pending log:",
                    recipient.value,
                    err
                  );
                });
              }
            }
          });
        };

        // Step 3: Send the messages
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

        // Step 4: Set timeout for stream completion
        timeoutRef.current = setTimeout(() => {
          console.error("Stream timeout for messageId:", messageId);
          setSendStatus("error");
          toast.error("Message sending timed out");

          // Fallback: If we have batch logs, try to update them all
          if (batchLogsRef.current.length > 0) {
            // Create new logs without IDs for completed messages
            const newBatchLogs = batchLogsRef.current.map((log) => {
              // Remove the id field from each log for re-logging
              const { id, ...logWithoutId } = log;
              return logWithoutId;
            });

            // Try batch updating all logs as a fallback
            batchAddTextLogs(newBatchLogs, sender_id).catch((err) => {
              console.error("Error with fallback batch logging:", err);

              // Last resort: Update each log individually via direct API call
              batchLogsRef.current.forEach((log) => {
                if (log.id) {
                  fetch(`/api/text-logs/${log.id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      status: log.status,
                      sent_at: log.sent_at,
                      error_message: log.error_message,
                      metadata: log.metadata, // Include the metadata with all recipients
                    }),
                  }).catch((patchErr) => {
                    console.error(
                      `Failed direct update for log ID ${log.id}:`,
                      patchErr
                    );
                  });
                }
              });
            });
          }

          cleanup();

          // Update pending logs to "failed"
          recipients.forEach((recipient) => {
            if (!processedMessagesRef.current.has(recipient.value)) {
              const logId = logIdsRef.current.get(recipient.value);
              if (logId) {
                updateTextLogStatus(
                  logId,
                  "failed",
                  null,
                  "Stream timed out",
                  JSON.stringify({
                    // Store ALL recipients in the metadata
                    allRecipients: allRecipientsData,
                    // Include sender info
                    sender: {
                      id: user?.id,
                      name: `${user?.first_name || ""} ${
                        user?.last_name || ""
                      }`.trim(),
                    },
                    smsProviderResponse: null,
                  })
                ).catch((err) => {
                  console.error(
                    "Error updating pending log:",
                    recipient.value,
                    err
                  );
                });
              }
            }
          });
        }, 60000); // 60 seconds
      } catch (error) {
        console.error("Error sending messages:", error);
        setSendStatus("error");
        toast.error("Failed to send messages: " + error.message);
        cleanup();

        // Update all logs to "failed"
        recipients.forEach((recipient) => {
          const logId = logIdsRef.current.get(recipient.value);
          if (logId) {
            updateTextLogStatus(
              logId,
              "failed",
              null,
              error.message || "Failed to initiate sending",
              JSON.stringify({
                // Store ALL recipients in the metadata
                allRecipients: allRecipientsData,
                // Include sender info
                sender: {
                  id: user?.id,
                  name: `${user?.first_name || ""} ${
                    user?.last_name || ""
                  }`.trim(),
                },
                smsProviderResponse: null,
              })
            ).catch((err) => {
              console.error("Error updating log:", recipient.value, err);
            });
          }
        });

        return results;
      }

      return results;
    },
    [batchAddTextLogs, updateTextLogStatus, cleanup]
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
