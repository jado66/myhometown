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

  const getFormResponses = async (formId) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("form_responses")
        .select("*")
        .eq("id", formId)
        .order("created_at", { ascending: false });

      if (error) {
        setError(error);
        return [];
      }

      return data;
    } catch (err) {
      setError(err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Get all individual submissions for a form
  const getFormSubmissions = async (formId) => {
    const responses = await getFormResponses(formId);
    if (!responses || responses.length === 0) return [];

    // Extract all submissions from the response_data
    const responseData = responses[0]?.response_data;
    if (!responseData) return [];

    // If submissions array exists, return it
    if (responseData.submissions && Array.isArray(responseData.submissions)) {
      return responseData.submissions;
    }

    // Otherwise return an empty array
    return [];
  };

  const createForm = async (formData) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("forms")
        .insert([formData])
        .select();

      if (error) {
        setError(error);
        return null;
      }

      return data[0];
    } catch (err) {
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

        console.log("Update result:", { updateData, updateError });

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

        console.log("Insert result:", { insertData, insertError });

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

  const updateForm = async (formId, formData) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("forms")
        .update(formData)
        .eq("id", formId)
        .select();

      if (error) {
        setError(error);
        return null;
      }

      return data[0];
    } catch (err) {
      setError(err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteFormResponse = async (responseId) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("form_responses")
        .delete()
        .eq("id", responseId);

      if (error) {
        setError(error);
        return false;
      }

      return true;
    } catch (err) {
      console.error("Error deleting form response:", err);
      setError(err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Delete a specific submission from a form's responses
  const deleteSubmission = async (formId, submissionId) => {
    try {
      // Get the current form response
      const { data: existingResponses, error: getError } = await supabase
        .from("form_responses")
        .select("*")
        .eq("id", formId);

      if (getError) {
        setError(getError);
        return false;
      }

      if (!existingResponses || existingResponses.length === 0) {
        return false;
      }

      const existingData = existingResponses[0].response_data || {};
      const submissions = Array.isArray(existingData.submissions)
        ? existingData.submissions
        : [];

      // Filter out the submission to delete
      const updatedSubmissions = submissions.filter(
        (submission) => submission.submissionId !== submissionId
      );

      // Update the response with the filtered submissions
      const { error: updateError } = await supabase
        .from("form_responses")
        .update({
          response_data: {
            ...existingData,
            submissions: updatedSubmissions,
          },
          updated_at: new Date().toISOString(),
        })
        .eq("id", formId);

      if (updateError) {
        setError(updateError);
        return false;
      }

      return true;
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
    getFormSubmissions,
    createForm,
    updateForm,
    deleteFormResponse,
    deleteSubmission,
  };
};
