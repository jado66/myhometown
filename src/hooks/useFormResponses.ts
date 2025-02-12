import { useState } from "react";
import { PostgrestError } from "@supabase/supabase-js";
import { supabase } from "@/util/supabase";

interface FormResponse {
  id: string;
  response_data: {
    [key: string]: string | number | boolean | null;
  };
  created_at: string;
  updated_at: string;
  status?: "submitted" | "approved" | "rejected";
}

interface UseFormResponsesReturn {
  response: FormResponse | null;
  loading: boolean;
  error: PostgrestError | null;
  fetchResponse: (formId: string) => Promise<void>;
  submitResponse: (
    formId: string,
    responseData: FormResponse["response_data"]
  ) => Promise<FormResponse | null>;
}

export const useFormResponses = (): UseFormResponsesReturn => {
  const [response, setResponse] = useState<FormResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<PostgrestError | null>(null);

  const fetchResponse = async (formId: string) => {
    setLoading(true);
    try {
      console.log("Fetching response for formId:", formId);
      const { data, error } = await supabase
        .from("form_responses")
        .select()
        .eq("id", formId);

      console.log("Fetch result:", { data, error });

      if (error) {
        setError(error);
        return;
      }

      if (!data || data.length === 0) {
        setResponse(null);
        return;
      }

      setResponse(data[0] as FormResponse);
      setError(null);
    } catch (err) {
      setError(err as PostgrestError);
    } finally {
      setLoading(false);
    }
  };

  const submitResponse = async (
    formId: string,
    responseData: FormResponse["response_data"]
  ): Promise<FormResponse | null> => {
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

      const updatedResponse = updateData[0] as FormResponse;
      setResponse(updatedResponse);
      return updatedResponse;
    } catch (err) {
      console.error("Error in submitResponse:", err);
      setError(err as PostgrestError);
      return null;
    }
  };

  return {
    response,
    loading,
    error,
    fetchResponse,
    submitResponse,
  };
};
