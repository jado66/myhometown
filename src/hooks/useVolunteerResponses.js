"use client";

import { useState, useEffect, useRef } from "react";
import { useFormResponses } from "@/hooks/useFormResponses";
import { toast } from "react-toastify";
import { supabase } from "@/util/supabase";

export const useVolunteerResponses = (formId, loadOnInit = false) => {
  const [responses, setResponses] = useState([]);
  const [responsesLoaded, setResponsesLoaded] = useState(false);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState(null);
  const [fullSubmissionData, setFullSubmissionData] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [responseToDelete, setResponseToDelete] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Reference to store the subscription
  const subscriptionRef = useRef(null);

  const { getFormResponses, getSubmissionById, deleteSubmission } =
    useFormResponses();

  // Load responses function
  const loadResponses = async (forceRefresh = false) => {
    if (!formId || (responsesLoaded && !forceRefresh)) return;

    try {
      setLoading(true);
      setError(null);

      // Get responses without large base64 signature data
      const responseData = await getFormResponses(formId, true);
      setResponses(responseData || []);
      setResponsesLoaded(true);
    } catch (err) {
      console.error("Error loading responses:", err);
      setError(err);
      toast.error("Error loading volunteer responses");
    } finally {
      setLoading(false);
    }
  };

  // State to track updates for debouncing
  const [updateCounter, setUpdateCounter] = useState(0);
  const [lastUpdateTime, setLastUpdateTime] = useState(null);
  const debounceTimerRef = useRef(null);

  // Debounced toast notification
  useEffect(() => {
    if (updateCounter > 0 && responsesLoaded) {
      // Clear any existing timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Set a new timer to show the toast after a delay
      debounceTimerRef.current = setTimeout(() => {
        if (updateCounter === 1) {
          toast.info("A volunteer response has been updated");
        } else {
          toast.info(`${updateCounter} volunteer responses have been updated`);
        }
        // Reset the counter after showing the toast
        setUpdateCounter(0);
      }, 2000); // 2 second debounce
    }

    // Cleanup on unmount
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [updateCounter, responsesLoaded]);

  // Setup Supabase realtime subscription
  useEffect(() => {
    if (!formId) return;

    const setupRealtimeSubscription = async () => {
      // Clean up any existing subscription first
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }

      // Subscribe to changes in form_responses for this form
      const subscription = supabase
        .channel(`form-responses-${formId}`)
        .on(
          "postgres_changes",
          {
            event: "*", // Listen for all events (insert, update, delete)
            schema: "public",
            table: "form_responses",
            filter: `id=eq.${formId}`,
          },
          async (payload) => {
            // When form_responses is updated, we need to reload the responses
            // Since the submissions are nested in response_data.submissions
            if (payload.eventType === "UPDATE") {
              const wasLoaded = responsesLoaded;
              const now = new Date();

              try {
                // Get the old response data to compare with the new data
                const oldResponsesCount = responses.length;

                // Get responses without signatures using the same function as loadResponses
                const responseData = await getFormResponses(formId, true);

                // Update the responses state
                setResponses(responseData || []);

                // If this was already loaded before, keep that state
                if (wasLoaded) {
                  setResponsesLoaded(true);

                  // Check if there are any actual changes in the data
                  if (responseData) {
                    const newResponsesCount = responseData.length;

                    // Only increment the counter if there's been a change
                    if (newResponsesCount !== oldResponsesCount) {
                      // Increment update counter for toast notification
                      setUpdateCounter((prev) => prev + 1);
                      setLastUpdateTime(now);
                    }
                  }
                }

                // If we're currently viewing a submission, refresh it
                if (selectedSubmissionId && openDialog) {
                  const refreshedData = await getSubmissionById(
                    formId,
                    selectedSubmissionId
                  );
                  if (refreshedData) {
                    setFullSubmissionData(refreshedData);
                  }
                }
              } catch (err) {
                console.error("Error processing realtime update:", err);
              }
            } else if (payload.eventType === "DELETE") {
              // Form was deleted entirely - reset the state
              setResponses([]);
              setResponsesLoaded(false);

              // Close dialog if open
              if (openDialog) {
                handleCloseDialog();
              }

              // Show a toast for this significant event (no need to debounce a delete)
              toast.warning("The volunteer form has been deleted");
            }
          }
        )
        .subscribe();

      subscriptionRef.current = subscription;
    };

    setupRealtimeSubscription();

    // Clean up subscription on unmount or when formId changes
    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [
    formId,
    responsesLoaded,
    selectedSubmissionId,
    openDialog,
    responses.length,
  ]);

  // Initial load if requested
  useEffect(() => {
    if (loadOnInit && formId) {
      loadResponses();
    }
  }, [formId, loadOnInit]);

  // View response details
  const handleViewResponse = async (responseData) => {
    try {
      setLoading(true);
      // When viewing a specific submission, fetch the full data including signature
      const submissionId = responseData.submissionId || responseData.id;
      setSelectedSubmissionId(submissionId);

      // Fetch the complete submission data with signature
      const fullData = await getSubmissionById(formId, submissionId);
      setFullSubmissionData(fullData);
      setOpenDialog(true);
    } catch (err) {
      console.error("Error fetching full submission data:", err);

      toast.error("Error fetching full submission data");
    } finally {
      setLoading(false);
    }
  };

  // Close dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFullSubmissionData(null);
    setSelectedSubmissionId(null);
  };

  // Delete response
  const handleDeleteClick = (response) => {
    setResponseToDelete(response);
    setDeleteDialogOpen(true);
  };

  // Close delete dialog
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setResponseToDelete(null);
  };

  // Confirm delete
  const handleConfirmDelete = async () => {
    if (!responseToDelete) return;

    try {
      setLoading(true);
      const success = await deleteSubmission(
        responseToDelete.formId || formId,
        responseToDelete.submissionId
      );

      if (success) {
        // The response will be removed via the realtime subscription
        // But we can also update the local state immediately for responsiveness
        setResponses(
          responses.filter((r) => {
            const id = r.submissionId || r.id;
            return id !== responseToDelete.submissionId;
          })
        );

        toast.success("Volunteer response deleted successfully");
      } else {
        toast.error("Failed to delete volunteer response");
      }
    } catch (err) {
      console.error("Error deleting response:", err);
      toast.error("Error deleting volunteer response");
    } finally {
      setLoading(false);
      setDeleteDialogOpen(false);
      setResponseToDelete(null);
    }
  };

  return {
    responses,
    responsesLoaded,
    selectedSubmissionId,
    fullSubmissionData,
    openDialog,
    deleteDialogOpen,
    responseToDelete,
    loading,
    error,
    loadResponses,
    handleViewResponse,
    handleCloseDialog,
    handleDeleteClick,
    handleCloseDeleteDialog,
    handleConfirmDelete,
  };
};
