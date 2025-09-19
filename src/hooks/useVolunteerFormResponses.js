"use client";

import { useState, useEffect, useRef } from "react";
import { useFormResponses } from "@/hooks/useFormResponses";
import { toast } from "react-toastify";
import { supabase } from "@/util/supabase";

export const useVolunteerFormResponses = (
  formId,
  communityId = null,
  loadOnInit = false
) => {
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

  // Load volunteer form responses function
  const loadVolunteerResponses = async (forceRefresh = false) => {
    if (!formId || (responsesLoaded && !forceRefresh)) return;

    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from("volunteer_form_responses")
        .select(
          `
          id,
          form_id,
          community_id,
          response_data,
          status,
          created_at,
          updated_at,
          communities!volunteer_form_responses_community_id_fkey (
            id,
            name,
            city_id,
            state,
            country
          )
        `
        )
        .eq("form_id", formId)
        .order("created_at", { ascending: false });

      // Filter by community if specified
      if (communityId) {
        query = query.eq("community_id", communityId);
      }

      const { data, error: queryError } = await query;

      if (queryError) throw queryError;

      setResponses(data || []);
      setResponsesLoaded(true);
    } catch (err) {
      console.error("Error loading volunteer responses:", err);
      setError(err);
      toast.error("Error loading volunteer form responses");
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
          toast.info("A volunteer form response has been updated");
        } else {
          toast.info(
            `${updateCounter} volunteer form responses have been updated`
          );
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

      // Subscribe to changes in volunteer_form_responses for this form
      let filter = `form_id=eq.${formId}`;
      if (communityId) {
        filter += `,community_id=eq.${communityId}`;
      }

      const subscription = supabase
        .channel(
          `volunteer-form-responses-${formId}${
            communityId ? `-${communityId}` : ""
          }`
        )
        .on(
          "postgres_changes",
          {
            event: "*", // Listen for all events (insert, update, delete)
            schema: "public",
            table: "volunteer_form_responses",
            filter: filter,
          },
          async (payload) => {
            const wasLoaded = responsesLoaded;
            const now = new Date();

            try {
              if (
                payload.eventType === "INSERT" ||
                payload.eventType === "UPDATE"
              ) {
                // Reload responses to get the latest data
                const oldResponsesCount = responses.length;
                await loadVolunteerResponses(true);

                if (wasLoaded) {
                  // Increment update counter for toast notification
                  setUpdateCounter((prev) => prev + 1);
                  setLastUpdateTime(now);
                }

                // If we're currently viewing a submission, refresh it
                if (selectedSubmissionId && openDialog) {
                  const refreshedData = await getVolunteerSubmissionById(
                    selectedSubmissionId
                  );
                  if (refreshedData) {
                    setFullSubmissionData(refreshedData);
                  }
                }
              } else if (payload.eventType === "DELETE") {
                // Remove the deleted response from state
                setResponses((prev) =>
                  prev.filter((r) => r.id !== payload.old.id)
                );

                // Close dialog if the deleted response is currently being viewed
                if (selectedSubmissionId === payload.old.id && openDialog) {
                  handleCloseDialog();
                }

                if (wasLoaded) {
                  toast.info("A volunteer form response has been deleted");
                }
              }
            } catch (err) {
              console.error("Error processing realtime update:", err);
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
    communityId,
    responsesLoaded,
    selectedSubmissionId,
    openDialog,
    responses.length,
  ]);

  // Initial load if requested
  useEffect(() => {
    if (loadOnInit && formId) {
      loadVolunteerResponses();
    }
  }, [formId, communityId, loadOnInit]);

  // Get full volunteer submission by ID
  const getVolunteerSubmissionById = async (submissionId) => {
    try {
      const { data, error } = await supabase
        .from("volunteer_form_responses")
        .select(
          `
          *,
          communities!volunteer_form_responses_community_id_fkey (
            id,
            name,
            city_id,
            state,
            country
          )
        `
        )
        .eq("id", submissionId)
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error("Error fetching volunteer submission:", err);
      return null;
    }
  };

  // View response details
  const handleViewResponse = async (responseData) => {
    try {
      setLoading(true);
      const submissionId = responseData.id;
      setSelectedSubmissionId(submissionId);

      // Fetch the complete submission data
      const fullData = await getVolunteerSubmissionById(submissionId);
      setFullSubmissionData(fullData);
      setOpenDialog(true);
    } catch (err) {
      console.error("Error fetching full volunteer submission data:", err);
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

      const { error } = await supabase
        .from("volunteer_form_responses")
        .delete()
        .eq("id", responseToDelete.id);

      if (error) throw error;

      // The response will be removed via the realtime subscription
      // But we can also update the local state immediately for responsiveness
      setResponses((prev) => prev.filter((r) => r.id !== responseToDelete.id));

      toast.success("Volunteer form response deleted successfully");
    } catch (err) {
      console.error("Error deleting volunteer response:", err);
      toast.error("Error deleting volunteer form response");
    } finally {
      setLoading(false);
      setDeleteDialogOpen(false);
      setResponseToDelete(null);
    }
  };

  // Submit new volunteer response
  const submitVolunteerResponse = async (
    responseData,
    communityIdForSubmission
  ) => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("volunteer_form_responses")
        .insert({
          form_id: formId,
          community_id: communityIdForSubmission || communityId,
          response_data: responseData,
          status: "submitted",
        })
        .select()
        .single();

      if (error) throw error;

      toast.success("Volunteer form response submitted successfully");

      // Reload responses to include the new one
      if (responsesLoaded) {
        await loadVolunteerResponses(true);
      }

      return data;
    } catch (err) {
      console.error("Error submitting volunteer response:", err);
      toast.error("Error submitting volunteer form response");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update volunteer response status
  const updateResponseStatus = async (responseId, status) => {
    try {
      setLoading(true);

      const { error } = await supabase
        .from("volunteer_form_responses")
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", responseId);

      if (error) throw error;

      toast.success(`Response status updated to ${status}`);

      // Reload responses to reflect the change
      if (responsesLoaded) {
        await loadVolunteerResponses(true);
      }
    } catch (err) {
      console.error("Error updating response status:", err);
      toast.error("Error updating response status");
      throw err;
    } finally {
      setLoading(false);
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
    loadResponses: loadVolunteerResponses,
    handleViewResponse,
    handleCloseDialog,
    handleDeleteClick,
    handleCloseDeleteDialog,
    handleConfirmDelete,
    submitVolunteerResponse,
    updateResponseStatus,
  };
};

// const {
//   responses,
//   loading,
//   loadResponses,
//   submitVolunteerResponse,
//   updateResponseStatus
// } = useVolunteerFormResponses(formId, communityId, true);

// // Submit a new volunteer response
// const handleSubmit = async (formData) => {
//   await submitVolunteerResponse(formData, communityId);
// };

// // Update response status
// const handleApprove = async (responseId) => {
//   await updateResponseStatus(responseId, 'approved');
// };
