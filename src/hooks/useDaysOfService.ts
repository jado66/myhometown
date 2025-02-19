import { supabase } from "@/util/supabase";
import { useCallback, useState } from "react";
import moment from "moment";
import { toast } from "react-toastify";

interface DayOfService {
  id: string;
  start_date: string;
  end_date: string;
  name?: string;
  city_id: string;
  community_id: string;
  created_at: string;
  updated_at: string;
}

interface CreateDayOfService {
  start_date: string;
  end_date: string;
  name?: string;
  city_id: string;
  community_id: string;
}

interface UpdateDayOfService {
  id?: string;
  start_date?: string;
  end_date?: string;
  name?: string;
  city_id?: string;
  community_id?: string;
}

const generateDayOfServiceId = (
  communityId: string,
  end_date: string
): string => {
  const formattedDate = moment(end_date).format("MM-DD-YYYY");
  return `${communityId}_${formattedDate}`;
};

export const useDaysOfService = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDayOfService = useCallback(async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: supabaseError } = await supabase
        .from("days_of_service")
        .select()
        .eq("id", id)
        .single();

      if (supabaseError) throw supabaseError;

      return { data, error: null };
    } catch (err) {
      const message = err instanceof Error ? err.message : "An error occurred";
      setError(message);
      throw err;
    }
  }, []);

  const fetchDaysOfServiceByCommunity = useCallback(
    async (community_id: string) => {
      try {
        setIsLoading(true);
        setError(null);

        const { data, error: supabaseError } = await supabase
          .from("days_of_service")
          .select("*")
          .eq("community_id", community_id);

        if (supabaseError) throw supabaseError;

        return { data, error: null };
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "An error occurred";
        setError(message);
        return { data: null, error: message };
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const addDayOfService = useCallback(
    async (newDayOfService: CreateDayOfService) => {
      try {
        setIsLoading(true);
        setError(null);

        // Generate the custom ID
        const id = generateDayOfServiceId(
          newDayOfService.community_id,
          newDayOfService.end_date
        );

        const { data, error: supabaseError } = await supabase
          .from("days_of_service")
          .insert({ ...newDayOfService, id })
          .select()
          .single();

        if (supabaseError) {
          // Check if it's a unique constraint violation
          if (supabaseError.code === "23505") {
            toast.error(
              "A day of service already exists for this community on this date"
            );
          }
          throw supabaseError;
        }

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

        // If start_date is being updated, we need to generate a new ID
        if (updates.end_date && updates.community_id) {
          const newId = generateDayOfServiceId(
            updates.community_id,
            updates.end_date
          );

          // Only update ID if it's different
          if (newId !== id) {
            updates = { ...updates, id: newId };
          }
        }

        const { data, error: supabaseError } = await supabase
          .from("days_of_service")
          .update(updates)
          .eq("id", id)
          .select()
          .single();

        if (supabaseError) {
          if (supabaseError.code === "23505") {
            throw new Error(
              "A day of service already exists for this community on this date"
            );
          }
          throw supabaseError;
        }

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
        .from("days_of_service")
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
    fetchDayOfService,
    fetchDaysOfServiceByCommunity,
    isLoading,
    error,
  };
};
