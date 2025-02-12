import { supabase } from "@/util/supabase";
import { useCallback, useState } from "react";
import { rrulestr } from "rrule";

interface Event {
  id: string;
  community_id: string;
  title: string;
  description?: string;
  location?: string;
  event_type: "Community Resource Center" | "Other Events";
  start_time: string;
  end_time: string;
  is_all_day: boolean;
  is_multi_day: boolean;
  hide_on_calendar: boolean;
  hide_on_upcoming_events: boolean;
  recurrence_rule?: string;
}

interface EventFilters {
  communityId?: string;
  includePastEvents?: boolean;
  startDate?: Date;
  endDate?: Date;
}

export const useEvents = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchEvents = async ({
    communityId,
    includePastEvents = false,
    startDate,
    endDate,
  }: EventFilters) => {
    try {
      setLoading(true);
      setError(null);

      // Start with the events query
      let query = supabase
        .from("events")
        .select("*")
        .order("start_time", { ascending: true });

      if (communityId) {
        query = query.eq("community_id", communityId);
      }

      if (startDate) {
        query = query.gte("start_time", startDate.toISOString());
      }

      if (endDate) {
        query = query.lte("end_time", endDate.toISOString());
      }

      const { data: currentEvents, error: currentError } = await query;

      if (currentError) throw currentError;

      let allEvents = currentEvents || [];

      // If includePastEvents is true, fetch from past_events table
      if (includePastEvents) {
        let pastQuery = supabase
          .from("past_events")
          .select("*")
          .order("start_time", { ascending: false });

        if (communityId) {
          pastQuery = pastQuery.eq("community_id", communityId);
        }

        if (startDate) {
          pastQuery = pastQuery.gte("start_time", startDate.toISOString());
        }

        if (endDate) {
          pastQuery = pastQuery.lte("end_time", endDate.toISOString());
        }

        const { data: pastEvents, error: pastError } = await pastQuery;

        if (pastError) throw pastError;

        allEvents = [...allEvents, ...(pastEvents || [])];
      }

      // Handle recurring events

      return allEvents;
    } catch (err) {
      setError(err instanceof Error ? err : new Error("An error occurred"));
      return [];
    } finally {
      setLoading(false);
    }
  };

  const addEvent = useCallback(async (event: Omit<Event, "id">) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("events")
        .insert([event])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      setError(err instanceof Error ? err : new Error("An error occurred"));
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateEvent = useCallback(
    async (id: string, updates: Partial<Event>) => {
      try {
        setLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from("events")
          .update(updates)
          .eq("id", id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } catch (err) {
        setError(err instanceof Error ? err : new Error("An error occurred"));
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const deleteEvent = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase.from("events").delete().eq("id", id);

      if (error) throw error;
      return true;
    } catch (err) {
      setError(err instanceof Error ? err : new Error("An error occurred"));
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    fetchEvents,
    addEvent,
    updateEvent,
    deleteEvent,
    loading,
    error,
  };
};
