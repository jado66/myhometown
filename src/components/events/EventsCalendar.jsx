import React, { useMemo, useCallback } from "react";
import { Calendar, momentLocalizer, Views } from "react-big-calendar";
import moment from "moment";
import { Grid, styled, Typography, Card } from "@mui/material";
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
      onSelectEvent(calEvent);
    },
    [onSelectEvent]
  );

  // Ensure events are properly formatted
  const formattedEvents = useMemo(
    () =>
      events.map((event) => ({
        ...event,
        start: new Date(event.start),
        end: new Date(event.end),
      })),
    [events]
  );

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
            selectable
          />
        </Grid>
      </Card>
    </>
  );
};

export default EventsCalendar;
