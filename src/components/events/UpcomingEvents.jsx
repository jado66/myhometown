import * as React from "react";
import {
  Box,
  Card,
  Grid,
  Typography,
  List,
  Button,
  Divider,
} from "@mui/material";
import Loading from "../util/Loading";
import moment from "moment";
import JsonViewer from "../util/debug/DebugOutput";

const UpcomingEvents = ({
  events = [],
  isLoading,
  maxEvents,
  onSelect,
  isEdit,
  onAdd,
}) => {
  // This function formats the date and time in an easily readable format
  const dateFormatter = (date, isAllDay) => {
    date = new Date(date);
    const month = date.toLocaleDateString(undefined, { month: "short" });
    const day = date.getDate();
    const weekday = date.toLocaleDateString(undefined, { weekday: "short" });

    if (isAllDay) {
      return `${weekday} ${month} ${day}`;
    }

    return `${weekday} ${month} ${day}, ${date.toLocaleTimeString([], {
      hour: "numeric",
      minute: "numeric",
    })}`;
  };

  // Sort events by start date, then slice array to contain at most maxEvents items
  const sortedEvents = [...events]
    .filter((event) => {
      const eventEnd = moment(event.end_time); // Fallback to event.end_time if event.end is missing
      const isAfterToday = eventEnd.isAfter(moment());

      return isAfterToday && !event.hide_on_upcoming_events; // Use the correct field name
    })
    .sort(
      (a, b) =>
        new Date(a.start || a.start_time) - new Date(b.start || b.start_time)
    ) // Fallback to start_time if start is missing
    .slice(0, maxEvents);

  if (isLoading) {
    return <Loading />;
  }

  if (sortedEvents?.length === 0) {
    return (
      <Grid sx={{ mb: 5 }}>
        <Typography
          variant="h4"
          component="h2"
          color="primary"
          textAlign="center"
          gutterBottom
        >
          No upcoming events
        </Typography>
        {isEdit && (
          <Box display="flex" justifyContent="center" mt={2}>
            <Button variant="outlined" onClick={onAdd}>
              Add New Event
            </Button>
          </Box>
        )}
      </Grid>
    );
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
        Upcoming Events
      </Typography>

      <JsonViewer data={sortedEvents} />
      <List>
        {sortedEvents.map((event, index) => {
          return (
            <UpcomingEventCard
              event={event}
              key={index}
              dateFormatter={dateFormatter}
              onSelect={onSelect}
            />
          );
        })}
      </List>

      {isEdit && (
        <Box display="flex" justifyContent="center" mt={2}>
          <Button variant="outlined" onClick={onAdd}>
            Add New Event
          </Button>
        </Box>
      )}
    </>
  );
};

export default UpcomingEvents;

const UpcomingEventCard = ({ event, dateFormatter, onSelect }) => {
  const startDateObj = new Date(event.start);
  const endDateObj = event.end ? new Date(event.end) : null;

  // Check if they are valid date objects
  if (isNaN(startDateObj) || (event.end && isNaN(endDateObj))) {
    return null;
  }

  const startDate = dateFormatter(startDateObj, event.isAllDay);
  let dateDisplay = startDate;

  if (!event.isAllDay) {
    if (endDateObj && endDateObj.getDate() !== startDateObj.getDate()) {
      // Multi-day event with specific times
      dateDisplay = `${startDate} - ${dateFormatter(endDateObj, false)}`;
    } else if (endDateObj) {
      // Same day event with end time
      const endTime = endDateObj.toLocaleTimeString([], {
        hour: "numeric",
        minute: "numeric",
      });
      dateDisplay = `${startDate} - ${endTime}`;
    }
  } else if (endDateObj && endDateObj.getDate() !== startDateObj.getDate()) {
    // Multi-day all-day event
    dateDisplay = `${startDate} - ${dateFormatter(endDateObj, true)}`;
  }

  return (
    <Card
      sx={{
        p: 2,
        mb: 1,
        display: "flex",
        flexDirection: "row",
        "&:hover": {
          backgroundColor: "#f8f8f8", //TODO make this a theme pallete color
        },
      }}
      onClick={() => onSelect(event)}
      id="events"
    >
      {/* <pre>{JSON.stringify(event, null, 2)}</pre> */}
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography variant="h6">{event.title}</Typography>
        </Grid>
        <Grid item xs={12} md={8}>
          <Box display="flex" flexDirection="column">
            <Typography variant="body2">{event.description}</Typography>
          </Box>
        </Grid>

        <Grid item xs={12} sx={{ display: { xs: "block", md: "none" } }}>
          <Divider sx={{ my: 1 }} />
        </Grid>
        <Grid item xs={12} md={4} sx={{ mt: 0 }}>
          <Box
            display="flex"
            sx={{
              minWidth: "300px",
              pl: { md: 2, xs: 0 },
              flexDirection: { md: "column", xs: "row" },
            }}
          >
            <Typography
              variant="body2"
              sx={{ color: "#777", minWidth: "275px" }}
              gutterBottom
            >
              {dateDisplay}
              {event.allDay && !dateDisplay.includes("-") && ", All Day Event"}
            </Typography>

            {event.location && (
              <Typography variant="body2">
                {event.location.replaceAll("-", " ")}
              </Typography>
            )}
          </Box>
        </Grid>
      </Grid>
    </Card>
  );
};
