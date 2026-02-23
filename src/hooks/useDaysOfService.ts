import { supabase } from "@/util/supabase";
import { useCallback, useState } from "react";
import moment from "moment";
import { toast } from "react-toastify";
import { v4 as uuidv4 } from "uuid";

interface PartnerStake {
  id: string;
  name: string;
  liaison_name_1?: string | null;
  liaison_email_1?: string | null;
  liaison_phone_1?: string | null;
  liaison_name_2?: string | null;
  liaison_email_2?: string | null;
  liaison_phone_2?: string | null;
}

interface DayOfService {
  id: string;
  start_date: string;
  end_date: string;
  name?: string;
  city_id: string | null;
  community_id: string | null;
  created_at: string;
  updated_at: string;
  short_id: string;
  partner_stakes?: PartnerStake[]; // Now a JSONB array
  partner_wards?: string[];
}

interface CreateDayOfService {
  start_date: string;
  end_date: string;
  name?: string;
  city_id: string | null;
  community_id: string | null;
  partner_stakes?: PartnerStake[];
  partner_wards?: string[];
}

interface UpdateDayOfService {
  id?: string;
  start_date?: string;
  end_date?: string;
  short_id: string;
  name?: string;
  city_id?: string | null;
  community_id?: string | null;
  partner_stakes?: PartnerStake[];
  partner_wards?: string[];
}

const generateDayOfServiceId = (
  communityId: string | null,
  end_date: string,
): string => {
  const formattedDate = moment(end_date).format("MM-DD-YYYY");
  const prefix = communityId || "dev";
  return `${prefix}_${formattedDate}`;
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
            `,
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
            `,
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

        let query = supabase.from("days_of_service").select("*");

        // If community_id is "dev", fetch only days of service without a city_id
        if (community_id === "dev") {
          query = query.is("city_id", null);
        } else {
          query = query.eq("community_id", community_id);
        }

        const { data, error: supabaseError } = await query;

        if (supabaseError) throw supabaseError;

        return { data, error: null }; // partner_stakes is already JSONB, no parsing needed
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "An error occurred";
        setError(message);
        return { data: null, error: message };
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const addDayOfService = useCallback(
    async (newDayOfService: CreateDayOfService) => {
      try {
        setIsLoading(true);
        setError(null);

        const id = generateDayOfServiceId(
          newDayOfService.community_id,
          newDayOfService.end_date,
        );

        const { data, error: supabaseError } = await supabase
          .from("days_of_service")
          .insert({ ...newDayOfService, short_id: id })
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
    [],
  );

  const updateDayOfService = useCallback(
    async ({ id, ...updates }: UpdateDayOfService) => {
      try {
        setIsLoading(true);
        setError(null);

        if (updates.end_date && updates.community_id) {
          const newId = generateDayOfServiceId(
            updates.community_id,
            updates.end_date,
          );
          if (newId !== id) updates = { ...updates, short_id: newId };
        }

        const { data, error: supabaseError } = await supabase
          .from("days_of_service")
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
    [],
  );

  const deleteDayOfService = useCallback(async (id: string) => {
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

      if (projectFormsError) throw projectFormsError;

      const { error: supabaseError } = await supabase
        .from("days_of_service")
        .delete()
        .eq("id", id);

      if (supabaseError) throw supabaseError;

      toast.success(
        `Day of service deleted successfully. Removed ${deletedFormsCount} related project forms.`,
      );
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : "An error occurred";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addPartnerToDayOfService = useCallback(
    async (
      id: string,
      type: "stake" | "ward",
      value: PartnerStake | string, // Stake is now an object, ward is still a string
    ) => {
      try {
        setIsLoading(true);
        setError(null);

        const { data: currentData, error: fetchError } = await supabase
          .from("days_of_service")
          .select("partner_stakes, partner_wards, short_id")
          .eq("id", id)
          .single();

        if (fetchError) throw fetchError;

        if (type === "stake") {
          const currentStakes = (currentData.partner_stakes ||
            []) as PartnerStake[];
          const stakeValue = value as PartnerStake;
          if (currentStakes.some((stake) => stake.name === stakeValue.name)) {
            return { data: currentData, error: null }; // Stake already exists
          }
          const newStake = { id: uuidv4(), ...stakeValue };
          const updatedStakes = [...currentStakes, newStake];
          const { data, error: updateError } = await supabase
            .from("days_of_service")
            .update({ partner_stakes: updatedStakes })
            .eq("id", id)
            .select()
            .single();

          if (updateError) throw updateError;
          toast.success(`Added "${stakeValue.name}" to Partner Organizations`);
          return { data, error: null };
        } else if (type === "ward") {
          const currentWards = currentData.partner_wards || [];
          const wardValue = value as string;
          if (currentWards.includes(wardValue))
            return { data: currentData, error: null };
          const updatedWards = [...currentWards, wardValue];
          const { data, error: updateError } = await supabase
            .from("days_of_service")
            .update({ partner_wards: updatedWards })
            .eq("id", id)
            .select()
            .single();

          if (updateError) throw updateError;
          toast.success(`Added "${wardValue}" to Partner Groups`);
          return { data, error: null };
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "An error occurred";
        setError(message);
        toast.error(`Failed to add partner: ${message}`);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const updatePartnerStakeInDayOfService = useCallback(
    async (dayId: string, updatedStake: PartnerStake) => {
      try {
        setIsLoading(true);
        setError(null);

        const { data: currentData, error: fetchError } = await supabase
          .from("days_of_service")
          .select("partner_stakes, short_id")
          .eq("id", dayId)
          .single();

        if (fetchError) throw fetchError;

        // Parse stakes if they're strings
        const parsedStakes = (currentData.partner_stakes || [])
          .map((stake) => {
            try {
              return typeof stake === "string" ? JSON.parse(stake) : stake;
            } catch (e) {
              console.error("Error parsing stake:", stake, e);
              return null;
            }
          })
          .filter(Boolean);

        // Update the matching stake
        const updatedStakes = parsedStakes.map((stake) =>
          stake.id === updatedStake.id ? updatedStake : stake,
        );

        const { data, error: updateError } = await supabase
          .from("days_of_service")
          .update({ partner_stakes: updatedStakes })
          .eq("id", dayId)
          .select()
          .single();

        if (updateError) throw updateError;

        toast.success("Stake updated successfully");
        return { data, error: null };
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "An error occurred";
        setError(message);
        toast.error(`Failed to update stake: ${message}`);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const removePartnerStakeFromDayOfService = useCallback(
    async (dayId: string, stakeId: string) => {
      try {
        setIsLoading(true);
        setError(null);

        const { data: currentData, error: fetchError } = await supabase
          .from("days_of_service")
          .select("partner_stakes, short_id")
          .eq("id", dayId)
          .single();

        if (fetchError) throw fetchError;

        // Parse the JSON strings into objects
        const parsedStakes = (currentData.partner_stakes || [])
          .map((stake) => {
            try {
              return typeof stake === "string" ? JSON.parse(stake) : stake;
            } catch (e) {
              console.error("Error parsing stake:", stake, e);
              return null;
            }
          })
          .filter(Boolean);

        // Filter out the stake with the matching ID
        const updatedStakes = parsedStakes.filter(
          (stake) => stake.id !== stakeId,
        );

        const { data, error: updateError } = await supabase
          .from("days_of_service")
          .update({ partner_stakes: updatedStakes })
          .eq("id", dayId)
          .select()
          .single();

        if (updateError) throw updateError;

        toast.success("Stake removed successfully");
        return { data, error: null };
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "An error occurred";
        setError(message);
        toast.error(`Failed to remove stake: ${message}`);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  return {
    addDayOfService,
    updateDayOfService,
    deleteDayOfService,
    removePartnerStakeFromDayOfService,
    fetchDaysOfServiceByCommunity,
    fetchDayOfServiceByShortId,
    fetchDayOfService,
    updatePartnerStakeInDayOfService,
    addPartnerToDayOfService,
    isLoading,
    error,
  };
};
