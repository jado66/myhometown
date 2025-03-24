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
        start: moment(event.start_time),
        end: moment(event.end_time),
      },
    ];
  }

  try {
    // Parse the start and end dates
    const eventStart = moment.utc(event.start_time);
    const eventEnd = moment.utc(event.end_time);
    const duration = moment.duration(eventEnd.diff(eventStart));

    // Create a recurrence rule object (using RRule)
    const ruleOptions: any = {
      dtstart: eventStart.toDate(),
    };

    // Parse the recurrence rule parts
    const ruleParts = event.recurrence_rule.split(";").reduce((acc, part) => {
      const [key, value] = part.split("=");
      acc[key] = value;
      return acc;
    }, {} as Record<string, string>);

    // Set frequency
    if (ruleParts.FREQ) {
      ruleOptions.freq = RRule[ruleParts.FREQ];
    }

    // Set count if available
    if (ruleParts.COUNT) {
      ruleOptions.count = parseInt(ruleParts.COUNT);
    }

    // Handle UNTIL date
    if (ruleParts.UNTIL) {
      ruleOptions.until = moment
        .utc(ruleParts.UNTIL.replace("Z", ""), "YYYYMMDDTHHmmss")
        .toDate();
    }

    // Handle BYDAY for weekly recurrence
    if (ruleParts.BYDAY && ruleParts.FREQ === "WEEKLY") {
      // For weekly recurrence with day of week, we need to ensure timezone consistency
      // We'll get the day of week from the original start date
      const dayOfWeek = eventStart.day();

      // Map the days from the rule (MO, TU, etc.) to JavaScript day numbers (0-6)
      const dayMap: Record<string, number> = {
        SU: 0,
        MO: 1,
        TU: 2,
        WE: 3,
        TH: 4,
        FR: 5,
        SA: 6,
      };

      const byweekday = ruleParts.BYDAY.split(",").map((day) => {
        return dayMap[day];
      });

      ruleOptions.byweekday = byweekday;
    } else if (ruleParts.BYDAY && ruleParts.FREQ === "MONTHLY") {
      // Handle monthly recurrence with ordinal week days
      const byDayValues = ruleParts.BYDAY.split(",").map((day) => {
        const ordinal = parseInt(day);
        const weekday = day.slice(String(ordinal).length);
        return RRule[weekday].nth(ordinal);
      });
      ruleOptions.byweekday = byDayValues;
    }

    // Create RRule instance
    const rrule = new RRule(ruleOptions);

    // Get all occurrences for a reasonable period
    const occurrenceLimit = ruleOptions.count ? ruleOptions.count : 52; // Default to a year of weekly events
    const endDate =
      ruleOptions.until ||
      moment(eventStart).add(occurrenceLimit, "weeks").toDate();

    // Calculate all dates within the range
    let dates;
    if (ruleOptions.count) {
      dates = rrule.all();
    } else {
      dates = rrule.between(eventStart.toDate(), endDate);
    }

    // Create an event instance for each occurrence
    return dates.map((date: Date) => {
      // Create the start and end dates for this occurrence
      const start = moment.utc(date);
      const end = moment.utc(date).add(duration);

      // For display in the calendar, enforce correct day of week
      // This is necessary because recurrence rules operate on local date concepts
      // but we're storing everything in UTC
      if (ruleParts.BYDAY && ruleParts.FREQ === "WEEKLY") {
        // Ensure this occurrence maintains the same hour/minute as the original event
        start.hour(eventStart.hour());
        start.minute(eventStart.minute());
        end.hour(eventEnd.hour());
        end.minute(eventEnd.minute());
      }

      return {
        ...event,
        id: event.id,
        original_event_id: event.id,
        occurrence_date: start.format(),
        start_time: start.format(),
        end_time: end.format(),
        start: start.toDate(),
        end: end.toDate(),
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
        start: moment(event.start_time),
        end: moment(event.end_time),
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
