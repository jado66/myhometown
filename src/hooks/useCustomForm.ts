import { useState } from "react";
import { PostgrestError } from "@supabase/supabase-js";
import { supabase } from "@/util/supabase";

interface FormField {
  label: string;
  type: string;
  visible: boolean;
  required: boolean;
  originalLabel: string;
  validation?: string;
  helpText?: string;
  category?: string;
  options?: string[];
  content?: string;
  url?: string;
}

interface FormConfig {
  [key: string]: FormField;
}

interface CustomForm {
  id: string;
  form_name: string;
  form_config: FormConfig;
  field_order: string[];
  created_at: string;
  updated_at: string;
}

interface UseCustomFormsReturn {
  forms: CustomForm[];
  loading: boolean;
  error: PostgrestError | null;
  fetchForms: () => Promise<void>;
  addForm: (
    formName: string,
    formConfig: FormConfig,
    fieldOrder: string[]
  ) => Promise<CustomForm | null>;
  updateForm: (
    id: string,
    updates: Partial<CustomForm>
  ) => Promise<CustomForm | null>;
  deleteForm: (id: string) => Promise<boolean>;
  getFormById: (id: string) => Promise<CustomForm | null>;
}

export const useCustomForms = (): UseCustomFormsReturn => {
  const [forms, setForms] = useState<CustomForm[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<PostgrestError | null>(null);

  const fetchForms = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("custom_forms")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        setError(error);
        return;
      }

      setForms(data as CustomForm[]);
      setError(null);
    } catch (err) {
      setError(err as PostgrestError);
    } finally {
      setLoading(false);
    }
  };

  const getFormById = async (id: string): Promise<CustomForm | null> => {
    try {
      const { data, error } = await supabase
        .from("custom_forms")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        setError(error);
        return null;
      }

      return data as CustomForm;
    } catch (err) {
      setError(err as PostgrestError);
      return null;
    }
  };

  const addForm = async (
    formName: string,
    formConfig: FormConfig,
    fieldOrder: string[]
  ): Promise<CustomForm | null> => {
    try {
      const { data, error } = await supabase
        .from("custom_forms")
        .insert([
          {
            form_name: formName,
            form_config: formConfig,
            field_order: fieldOrder,
          },
        ])
        .select()
        .single();

      if (error) {
        setError(error);
        return null;
      }

      setForms((prevForms) => [data as CustomForm, ...prevForms]);
      return data as CustomForm;
    } catch (err) {
      setError(err as PostgrestError);
      return null;
    }
  };

  const updateForm = async (
    id: string,
    updates: Partial<CustomForm>
  ): Promise<CustomForm | null> => {
    try {
      const { data, error } = await supabase
        .from("custom_forms")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        setError(error);
        return null;
      }

      setForms((prevForms) =>
        prevForms.map((form) => (form.id === id ? { ...form, ...data } : form))
      );

      return data as CustomForm;
    } catch (err) {
      setError(err as PostgrestError);
      return null;
    }
  };

  const deleteForm = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("custom_forms")
        .delete()
        .eq("id", id);

      if (error) {
        setError(error);
        return false;
      }

      setForms((prevForms) => prevForms.filter((form) => form.id !== id));
      return true;
    } catch (err) {
      setError(err as PostgrestError);
      return false;
    }
  };

  return {
    forms,
    loading,
    error,
    fetchForms,
    addForm,
    updateForm,
    deleteForm,
    getFormById,
  };
};
