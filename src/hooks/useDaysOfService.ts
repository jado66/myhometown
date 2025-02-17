import { supabase } from "@/util/supabase";
import { useCallback, useState } from "react";

interface DayOfService {
  id: string;
  start_date: string;
  end_date: string;
  name?: string;
  city_id: string;
  created_at: string;
  updated_at: string;
}

interface CreateDayOfService {
  start_date: string;
  end_date: string;
  name?: string;
  city_id: string;
}

interface UpdateDayOfService {
  id: string;
  start_date?: string;
  end_date?: string;
  name?: string;
  city_id?: string;
}

export const useDaysOfService = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addDayOfService = useCallback(
    async (newDayOfService: CreateDayOfService) => {
      try {
        setIsLoading(true);
        setError(null);

        const { data, error: supabaseError } = await supabase
          .from("day_of_service")
          .insert(newDayOfService)
          .select()
          .single();

        if (supabaseError) throw supabaseError;

        return data as DayOfService;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "An error occurred";
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const updateDayOfService = useCallback(
    async ({ id, ...updates }: UpdateDayOfService) => {
      try {
        setIsLoading(true);
        setError(null);

        const { data, error: supabaseError } = await supabase
          .from("day_of_service")
          .update(updates)
          .eq("id", id)
          .select()
          .single();

        if (supabaseError) throw supabaseError;

        return data as DayOfService;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "An error occurred";
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const deleteDayOfService = useCallback(async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const { error: supabaseError } = await supabase
        .from("day_of_service")
        .delete()
        .eq("id", id);

      if (supabaseError) throw supabaseError;

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : "An error occurred";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    addDayOfService,
    updateDayOfService,
    deleteDayOfService,
    isLoading,
    error,
  };
};
