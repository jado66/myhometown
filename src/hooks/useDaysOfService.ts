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
  short_id: string;
  partner_stakes?: string[]; // Array of strings
  partner_wards?: string[]; // Array of strings
}

interface CreateDayOfService {
  start_date: string;
  end_date: string;
  name?: string;
  city_id: string;
  community_id: string;
  partner_stakes?: string[]; // Optional array of strings
  partner_wards?: string[]; // Optional array of strings
}

interface UpdateDayOfService {
  id?: string;
  start_date?: string;
  end_date?: string;
  short_id: string;
  name?: string;
  city_id?: string;
  community_id?: string;
  partner_stakes?: string[]; // Optional array of strings
  partner_wards?: string[]; // Optional array of strings
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

  const fetchDayOfServiceByShortId = useCallback(async (shortId: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: supabaseError } = await supabase
        .from("days_of_service")
        .select(
          `
              *,
              cities!city_id (
                city_name:name
              ),
              communities!community_id (
                community_name:name
              )
            `
        )
        .eq("short_id", shortId)
        .single();

      if (supabaseError) throw supabaseError;

      const flattenedData = {
        ...data,
        city_name: data.cities?.city_name,
        community_name: data.communities?.community_name,
      };

      delete flattenedData.cities;
      delete flattenedData.communities;

      return { data: flattenedData, error: null };
    } catch (err) {
      const message = err instanceof Error ? err.message : "An error occurred";
      setError(message);
      throw err;
    }
  }, []);

  const fetchDayOfService = useCallback(async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: supabaseError } = await supabase
        .from("days_of_service")
        .select(
          `
              *,
              cities!city_id (
                city_name:name
              ),
              communities!community_id (
                community_name:name
              )
            `
        )
        .eq("id", id)
        .single();

      if (supabaseError) throw supabaseError;

      const flattenedData = {
        ...data,
        city_name: data.cities?.city_name,
        community_name: data.communities?.community_name,
      };

      delete flattenedData.cities;
      delete flattenedData.communities;

      return { data: flattenedData, error: null };
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

        const id = generateDayOfServiceId(
          newDayOfService.community_id,
          newDayOfService.end_date
        );

        const { data, error: supabaseError } = await supabase
          .from("days_of_service")
          .insert({ ...newDayOfService, short_id: id })
          .select()
          .single();

        if (supabaseError) {
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

        if (updates.end_date && updates.community_id) {
          const newId = generateDayOfServiceId(
            updates.community_id,
            updates.end_date
          );

          if (newId !== id) {
            updates = { ...updates, short_id: newId };
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
            toast.error(
              "A day of service already exists for this community on this date"
            );
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

  const deleteDayOfService = useCallback(
    async (id: string) => {
      try {
        setIsLoading(true);
        setError(null);

        const { error: projectFormsError, count: deletedFormsCount } =
          await supabase
            .from("days_of_service_project_forms")
            .delete()
            .eq("days_of_service_id", id)
            .select()
            .then((response) => ({
              error: response.error,
              count: response.data?.length ?? 0,
            }));

        if (projectFormsError) {
          throw new Error(
            `Failed to delete related project forms: ${projectFormsError.message}`
          );
        }

        const { error: supabaseError } = await supabase
          .from("days_of_service")
          .delete()
          .eq("id", id);

        if (supabaseError) {
          throw new Error(
            `Failed to delete day of service: ${supabaseError.message}`
          );
        }

        toast.success(
          `Day of service deleted successfully. Removed ${deletedFormsCount} related project form${
            deletedFormsCount === 1 ? "" : "s"
          }.`
        );
        return true;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "An unknown error occurred";
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [supabase, setIsLoading, setError, toast]
  );

  return {
    addDayOfService,
    updateDayOfService,
    deleteDayOfService,
    fetchDayOfService,
    fetchDaysOfServiceByCommunity,
    fetchDayOfServiceByShortId,
    isLoading,
    error,
  };
};
