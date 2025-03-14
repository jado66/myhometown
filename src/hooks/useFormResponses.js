import { useState } from "react";
import { supabase } from "@/util/supabase";

export const useCustomForms = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getFormById = async (formId) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("forms")
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
        .eq("form_id", formId)
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
    getFormResponses,
    createForm,
    updateForm,
  };
};
