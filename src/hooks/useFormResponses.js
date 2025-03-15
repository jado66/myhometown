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

      // Don't use single() here to avoid the PGRST116 error
      const { data: updateData, error: updateError } = await supabase
        .from("form_responses")
        .update({
          response_data: responseData,
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

      if (!updateData || updateData.length === 0) {
        console.log("No rows were updated");
        return null;
      }

      const updatedResponse = updateData[0];
      return updatedResponse;
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

  return {
    loading,
    error,
    getFormById,
    submitResponse,
    getFormResponses,
    createForm,
    updateForm,
  };
};
