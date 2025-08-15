import { useState } from "react";
import { supabase } from "@/util/supabase";

export const useFormResponses = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getFormById = async (formId) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("custom_forms")
        .select("*")
        .eq("id", formId)
        .single();

      if (error) {
        setError(error);
        return null;
      }

      return data;
    } catch (err) {
      setError(err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Gets form responses, using Supabase Postgres function to exclude signatures
   * @param {string} formId - The ID of the form
   * @param {boolean} excludeSignatures - Whether to exclude signature data (default: false)
   */
  const getFormResponses = async (formId, excludeSignatures = false) => {
    setLoading(true);
    try {
      let responseData;

      if (excludeSignatures) {
        // Call a Postgres function that returns submissions without signatures
        const { data, error } = await supabase.rpc(
          "get_submissions_without_signatures",
          {
            form_id: formId,
          }
        );

        if (error) {
          setError(error);
          return [];
        }

        responseData = data;
      } else {
        // Get the full data including signatures
        const { data, error } = await supabase
          .from("form_responses")
          .select("*")
          .eq("id", formId)
          .order("created_at", { ascending: false });

        if (error) {
          setError(error);
          return [];
        }

        if (!data || data.length === 0) {
          return [];
        }

        // Extract submissions from response data
        responseData = data[0]?.response_data?.submissions || [];
      }

      return responseData;
    } catch (err) {
      console.error("Error fetching form responses:", err);
      setError(err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get a specific submission by ID, including signature data
   * @param {string} formId - The ID of the form
   * @param {string} submissionId - The ID of the specific submission
   */
  const getSubmissionById = async (formId, submissionId) => {
    setLoading(true);
    try {
      // Call a Postgres function that returns a specific submission
      const { data, error } = await supabase.rpc("get_submission_by_id", {
        form_id: formId,
        submission_id: submissionId,
      });

      if (error) {
        setError(error);
        return null;
      }

      return data;
    } catch (err) {
      console.error("Error fetching submission:", err);
      setError(err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const submitResponse = async (formId, responseData) => {
    try {
      console.log("Submitting response for formId:", formId);

      // Check if we already have a response for this form
      const { data: existingResponses, error: checkError } = await supabase
        .from("form_responses")
        .select("*")
        .eq("id", formId);

      if (checkError) {
        console.error("Error checking for existing responses:", checkError);
        setError(checkError);
        return null;
      }

      // Create a new submission object with unique ID and timestamp
      const newSubmission = {
        ...responseData,
        submissionId: crypto.randomUUID(),
        submittedAt: new Date().toISOString(),
      };

      if (existingResponses && existingResponses.length > 0) {
        // Get the existing response data
        const existingResponse = existingResponses[0];
        const existingData = existingResponse.response_data || {};

        // Initialize submissions array if it doesn't exist
        const submissions = Array.isArray(existingData.submissions)
          ? existingData.submissions
          : [];

        // Add new submission to the array
        submissions.push(newSubmission);

        // Update with the new submissions array
        const { data: updateData, error: updateError } = await supabase
          .from("form_responses")
          .update({
            response_data: {
              ...existingData,
              submissions: submissions,
            },
            status: "submitted",
            updated_at: new Date().toISOString(),
          })
          .eq("id", formId)
          .select();

        if (updateError) {
          setError(updateError);
          return null;
        }

        return {
          ...updateData?.[0],
          latestSubmission: newSubmission,
        };
      } else {
        // No existing response, create a new one with submissions array
        const { data: insertData, error: insertError } = await supabase
          .from("form_responses")
          .insert({
            id: formId,
            response_data: {
              submissions: [newSubmission],
            },
            status: "submitted",
          })
          .select();

        if (insertError) {
          setError(insertError);
          return null;
        }

        return {
          ...insertData?.[0],
          latestSubmission: newSubmission,
        };
      }
    } catch (err) {
      console.error("Error in submitResponse:", err);
      setError(err);
      return null;
    }
  };

  // Delete a specific submission from a form's responses
  // Replace the deleteSubmission function in your useFormResponses hook with this:

  const deleteSubmission = async (formId, submissionId) => {
    try {
      // First, get the current form responses
      const { data: currentData, error: fetchError } = await supabase
        .from("form_responses")
        .select("response_data")
        .eq("id", formId)
        .single();

      if (fetchError) {
        console.error("Error fetching current data:", fetchError);
        setError(fetchError);
        return false;
      }

      if (
        !currentData ||
        !currentData.response_data ||
        !currentData.response_data.submissions
      ) {
        console.error("No submissions found");
        return false;
      }

      // Filter out the submission to delete
      const updatedSubmissions = currentData.response_data.submissions.filter(
        (submission) =>
          submission.submissionId !== submissionId &&
          submission.id !== submissionId
      );

      // Update the form responses with the filtered submissions
      const { data, error } = await supabase
        .from("form_responses")
        .update({
          response_data: {
            ...currentData.response_data,
            submissions: updatedSubmissions,
          },
          updated_at: new Date().toISOString(),
        })
        .eq("id", formId)
        .select();

      if (error) {
        console.error("Error updating form responses:", error);
        setError(error);
        return false;
      }

      return true; // Success
    } catch (err) {
      console.error("Error deleting submission:", err);
      setError(err);
      return false;
    }
  };

  return {
    loading,
    error,
    getFormById,
    submitResponse,
    getFormResponses,
    getSubmissionById,
    deleteSubmission,
  };
};
