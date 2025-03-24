import React, { useMemo, useCallback, useEffect, useState } from "react";
import { Calendar, momentLocalizer, Views } from "react-big-calendar";
import moment from "moment";
import { Grid, styled, Typography, Card, Box, Button } from "@mui/material";
import Loading from "../util/Loading";
import "react-big-calendar/lib/css/react-big-calendar.css";
import JsonViewer from "../util/debug/DebugOutput";

// Set locale to English to ensure consistent formatting
moment.locale("en");

// Instead of creating a custom wrapper, use the standard moment
// but ensure we properly handle UTC dates in our component
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

export const EventsCalendar = ({
  events,
  onSelectEvent,
  onSelectSlot,
  isLoading,
  startCreatingNewEvent,
  isEdit,
}) => {
  // Process events to ensure dates are handled in UTC
  const processedEvents = useMemo(() => {
    if (!events) return [];

    return events.map((event) => {
      // Use occurrence_date (for recurring events) or start_time
      const startStr = event.occurrence_date || event.start_time;
      const endStr = event.end_time;

      return {
        ...event,
        // Convert to Date objects while preserving UTC time
        start: moment.utc(startStr).toDate(),
        end: moment.utc(endStr).toDate(),
      };
    });
  }, [events]);
  const { defaultDate, views, formats } = useMemo(
    () => ({
      defaultDate: new Date(),
      views: Object.keys(Views).map((k) => Views[k]),
      // Define custom formats to override default localization behavior
      formats: {
        dateFormat: "DD",
        dayFormat: "DD ddd",
        monthHeaderFormat: "YYYY MMMM",
        dayHeaderFormat: "YYYY MMMM DD dddd",
        dayRangeHeaderFormat: ({ start, end }) =>
          `${moment(start).format("YYYY MMMM DD")} - ${moment(end).format(
            "DD"
          )}`,
        eventTimeRangeFormat: ({ start, end }) =>
          `${moment.utc(start).format("HH:mm")} - ${moment
            .utc(end)
            .format("HH:mm")}`,
        timeGutterFormat: (date) => moment.utc(date).format("HH:mm"),
      },
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
        // Keep the original UTC timestamps
        start_time: calEvent.start_time,
        end_time: calEvent.end_time,
        // For recurring events, include the occurrence date
        occurrence_date: calEvent.occurrence_date,
        is_all_day: calEvent.isAllDay,
        is_multi_day: calEvent.isMultiDay,
        hide_on_calendar: calEvent.hideOnCalendar,
        hide_on_upcoming_events: calEvent.hideOnUpcomingEvents,
        recurrence_rule: calEvent.recurrence_rule,
      });
    },
    [onSelectEvent]
  );

  if (isLoading) {
    return <Loading />;
  }

  return (
    <>
      <JsonViewer data={events} />
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
            events={processedEvents}
            showMultiDayTimes
            step={60}
            startAccessor="start"
            endAccessor="end"
            onSelectEvent={handleSelectEvent}
            onSelectSlot={handleSelectSlot}
            formats={formats}
            culture="en"
            timezone="local"
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
