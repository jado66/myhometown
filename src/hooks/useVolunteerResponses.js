"use client";

import { useState, useEffect } from "react";
import { useFormResponses } from "@/hooks/useFormResponses";
import { toast } from "react-toastify";

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
        // Remove the deleted response from the state
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
