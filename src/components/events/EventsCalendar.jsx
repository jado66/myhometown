import React, { useMemo, useCallback, useEffect, useState } from "react";
import { Calendar, momentLocalizer, Views } from "react-big-calendar";
import moment from "moment";
import { Grid, styled, Typography, Card, Box, Button } from "@mui/material";
import { RRule } from "rrule";
import Loading from "../util/Loading";
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = momentLocalizer(moment);

const StyledCalendar = styled(Calendar)(({ theme }) => ({
  ".rbc-event": {
    "&.rbc-selected": {
      backgroundColor: theme.palette.secondary.main,
      color: "black",
    },
    backgroundColor: theme.palette.primary.main,
  },
  ".rbc-today": {
    backgroundColor: theme.palette.secondary.light,
  },
  ".rbc-show-more": {
    color: theme.palette.primary.main,
  },
}));

const expandRecurringEvent = (event) => {
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
    const eventStart = moment(event.start_time || event.start);
    const eventEnd = moment(event.end_time || event.end);
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
        acc.until = new Date(value);
      }
      return acc;
    }, {});

    // Create RRule instance with proper configuration
    const rrule = new RRule({
      dtstart: new Date(event.start_time),
      ...ruleOptions,
    });

    console.log("RRule Options:", ruleOptions); // Debug log

    // Get all occurrences within a reasonable timeframe (e.g., one year from the start date)
    const endDate =
      ruleOptions.until || moment(event.start_time).add(1, "year").toDate();
    const dates = rrule.between(new Date(event.start_time), endDate);

    // Create an event instance for each occurrence
    return dates.map((date) => {
      const start = moment(date);
      const end = moment(date).add(duration);

      return {
        ...event,
        id: event.id,
        start: start.toDate(),
        end: end.toDate(),
        original_event_id: event.id,
        occurrence_date: start.toISOString(),
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

export const EventsCalendar = ({
  events,
  onSelectEvent,
  onSelectSlot,
  isLoading,
  startCreatingNewEvent,
  isEdit,
}) => {
  const [formattedEvents, setFormattedEvents] = useState([]);

  const { defaultDate, views } = useMemo(
    () => ({
      defaultDate: new Date(),
      views: Object.keys(Views).map((k) => Views[k]),
    }),
    []
  );

  const handleSelectSlot = useCallback(
    (slotInfo) => {
      if (!onSelectSlot) {
        return;
      }
      onSelectSlot(slotInfo);
    },
    [onSelectSlot]
  );

  const handleSelectEvent = useCallback(
    (calEvent) => {
      if (!onSelectEvent) {
        return;
      }
      // Ensure we pass all necessary event data including the ID
      onSelectEvent({
        ...calEvent,
        id: calEvent.id || calEvent.original_event_id, // Preserve the event ID
        isRecurringInstance: !!calEvent.original_event_id,
        // Map the calendar event properties to match your event model
        title: calEvent.title,
        description: calEvent.description,
        location: calEvent.location,
        event_type: calEvent.event_type,
        start_time: calEvent.start.toISOString(),
        end_time: calEvent.end.toISOString(),
        is_all_day: calEvent.isAllDay,
        is_multi_day: calEvent.isMultiDay,
        hide_on_calendar: calEvent.hideOnCalendar,
        hide_on_upcoming_events: calEvent.hideOnUpcomingEvents,
        recurrence_rule: calEvent.recurrence_rule,
      });
    },
    [onSelectEvent]
  );

  useEffect(() => {
    if (events) {
      const startTime = performance.now();

      const eventsArray = Array.isArray(events) ? events : [];

      const allEvents = eventsArray.reduce((acc, event) => {
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

      setFormattedEvents(allEvents);

      const endTime = performance.now();

      console.log(`Event processing took ${endTime - startTime}ms`);
      console.log(
        `Processed ${eventsArray.length} original events into ${allEvents.length} total events`
      );
    }
  }, [events]);

  // Expand recurring events and format all events

  if (isLoading) {
    return <Loading />;
  }

  return (
    <>
      <Typography
        variant="h4"
        component="h2"
        color="primary"
        textAlign="center"
        gutterBottom
      >
        Event Calendar
      </Typography>
      <Card sx={{ padding: 2, marginTop: 2 }}>
        <Grid item xs={12} sx={{ height: "500px" }}>
          <StyledCalendar
            localizer={localizer}
            defaultView="month"
            views={views}
            defaultDate={defaultDate}
            events={formattedEvents}
            showMultiDayTimes
            step={60}
            startAccessor="start"
            endAccessor="end"
            onSelectEvent={handleSelectEvent}
            onSelectSlot={handleSelectSlot}
          />
        </Grid>
      </Card>

      {isEdit && (
        <Box display="flex" justifyContent="center" mt={2}>
          <Button variant="outlined" onClick={startCreatingNewEvent}>
            Add New Event
          </Button>
        </Box>
      )}
    </>
  );
};

export default EventsCalendar;
