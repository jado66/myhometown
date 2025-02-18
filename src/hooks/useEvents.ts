import { supabase } from "@/util/supabase";
import { MomentInput } from "moment";
import { useCallback, useState } from "react";
import { RRule } from "rrule";
import moment from "moment";

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

const expandRecurringEvent = (event: Event) => {
  // Check if the event has a valid recurrence rule
  if (
    !event.recurrence_rule ||
    typeof event.recurrence_rule !== "string" ||
    event.recurrence_rule.trim() === ""
  ) {
    return [
      {
        ...event,
        start: new Date(event.start_time),
        end: new Date(event.end_time),
      },
    ];
  }

  try {
    // Parse the start and end dates
    const eventStart = moment.utc(event.start_time);
    const eventEnd = moment.utc(event.end_time);
    const duration = moment.duration(eventEnd.diff(eventStart));

    // Parse the recurrence rule parts
    const ruleOptions = event.recurrence_rule.split(";").reduce((acc, part) => {
      const [key, value] = part.split("=");
      if (key === "FREQ") {
        acc.freq = RRule[value];
      } else if (key === "COUNT") {
        acc.count = parseInt(value);
      } else if (key === "BYDAY") {
        // Handle monthly recurrence with ordinal (e.g., "3WE")
        if (acc.freq === RRule.MONTHLY) {
          const byDayValues = value.split(",").map((day) => {
            const ordinal = parseInt(day);
            const weekday = day.slice(String(ordinal).length);
            return RRule[weekday].nth(ordinal);
          });
          acc.byweekday = byDayValues;
        } else {
          // Regular weekly recurrence
          acc.byweekday = value.split(",").map((day) => RRule[day]);
        }
      } else if (key === "UNTIL") {
        // Parse the UNTIL date
        acc.until = moment.utc(value).toDate();
      }
      return acc;
    }, {});

    // Create RRule instance with proper configuration
    const rrule = new RRule({
      dtstart: eventStart.toDate(),
      ...ruleOptions,
    });

    console.log("RRule Options:", ruleOptions); // Debug log

    // Get all occurrences within a reasonable timeframe (e.g., one year from the start date)
    const endDate =
      ruleOptions.until || moment(event.start_time).add(1, "year").toDate();
    const dates = rrule.all();

    // Create an event instance for each occurrence
    return dates.map((date: MomentInput) => {
      const start = moment.utc(date);
      const end = moment.utc(date).add(duration);

      return {
        ...event,
        id: event.id,
        start: start.toDate(),
        end: end.toDate(),
        original_event_id: event.id,
        occurrence_date: start.format(),
        title: event.title,
        description: event.description,
        location: event.location,
        event_type: event.event_type,
        is_all_day: event.is_all_day,
        is_multi_day: event.is_multi_day,
        hide_on_calendar: event.hide_on_calendar,
        hide_on_upcoming_events: event.hide_on_upcoming_events,
      };
    });
  } catch (error) {
    console.error("Error expanding recurring event:", error, event);
    // Return the original event if expansion fails
    return [
      {
        ...event,
        start: new Date(event.start_time),
        end: new Date(event.end_time),
      },
    ];
  }
};

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

      const allEventsExpanded = allEvents.reduce((acc, event) => {
        if (!event.recurrence_rule) {
          return [
            ...acc,
            {
              ...event,
              start: new Date(event.start_time),
              end: new Date(event.end_time),
            },
          ];
        }

        const expandedEvents = expandRecurringEvent({
          ...event,
          start: new Date(event.start_time),
          end: new Date(event.end_time),
        });
        return [...acc, ...expandedEvents];
      }, []);

      return allEventsExpanded;
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
