import React, { useMemo, useCallback, useEffect, useState } from "react";
import { Calendar, momentLocalizer, Views } from "react-big-calendar";
import moment from "moment";
import { Grid, styled, Typography, Card, Box, Button } from "@mui/material";
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

export const EventsCalendar = ({
  events,
  onSelectEvent,
  onSelectSlot,
  isLoading,
  startCreatingNewEvent,
  isEdit,
}) => {
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
            events={events}
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
