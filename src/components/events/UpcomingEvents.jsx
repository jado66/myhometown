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

const UpcomingEvents = ({
  events = [],
  isLoading,
  maxEvents,
  onSelect,
  isEdit,
  onAdd,
}) => {
  // This function formats the date and time in an easily readable format
  const dateFormatter = (date, allDay) => {
    date = new Date(date);
    let hoursMinutesFormat = { hour: "numeric", minute: "numeric" };
    let month = date.toLocaleDateString(undefined, { month: "short" });
    let day = date.getDate();
    let weekday = date.toLocaleDateString(undefined, { weekday: "short" });

    if (allDay) {
      return `${weekday} ${month} ${day}`;
    } else {
      return `${weekday} ${month} ${day}, ${date.toLocaleTimeString(
        [],
        hoursMinutesFormat
      )}`;
    }
  };

  // Sort events by start date, then slice array to contain at most maxEvents items
  const sortedEvents = [...events]
    .filter((event) => moment(event.end).isAfter(moment()))

    .sort((a, b) => new Date(a.start) - new Date(b.start))
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
  if (isNaN(startDateObj) || isNaN(endDateObj)) {
    return null;
  }

  const startDate = dateFormatter(startDateObj, event.allDay);
  let endDate;

  if (endDateObj.getDate() != startDateObj.getDate()) {
    // If event spans multiple days, show end date
    endDate = dateFormatter(event.end, event.allDay);
  } else {
    // If event is within a single day, show end time only
    endDate = endDateObj.toLocaleTimeString([], {
      hour: "numeric",
      minute: "numeric",
    });
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
    >
      <Grid container>
        <Grid item xs={12} sm={6}>
          <Box display="flex" sx={{ minWidth: "300px" }} flexDirection="column">
            <Typography
              variant="body2"
              sx={{ color: "#777", minWidth: "275px" }}
              gutterBottom
            >
              {`${startDate}`}
              {!event.allDay ? ` - ${endDate}` : ", All Day Event"}
            </Typography>

            <Typography variant="body2">
              {event.location.replaceAll("-", " ")}
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12} sx={{ display: { xs: "block", sm: "none" } }}>
          <Divider sx={{ my: 2 }} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Box display="flex" flexDirection="column">
            <Typography variant="body1" gutterBottom>
              {event.title}
            </Typography>
            <Typography variant="body2">{event.description}</Typography>
          </Box>
        </Grid>
      </Grid>
    </Card>
  );
};
