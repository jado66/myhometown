import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  DialogActions,
  Button,
  Divider,
} from "@mui/material";

export const EventDialog = ({ onClose, event }) => {
  if (!event) {
    return null;
  }

  const startDateObj = new Date(event.start);
  const endDateObj = event.end ? new Date(event.end) : null;

  // Check if they are valid date objects
  if (isNaN(startDateObj) || (endDateObj && isNaN(endDateObj))) {
    return null;
  }

  const formatDate = (dateObj, includeTime = true) => {
    const options = includeTime
      ? {
          month: "long",
          day: "numeric",
          year: "numeric",
          hour: "numeric",
          minute: "numeric",
        }
      : { month: "long", day: "numeric", year: "numeric" };
    return dateObj.toLocaleString("en-US", options);
  };

  const formatTime = (dateObj) => {
    return dateObj.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "numeric",
    });
  };

  let displayDateInfo;

  if (event.allDay) {
    displayDateInfo = `${startDateObj.toLocaleString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    })}`;
  } else {
    const startDate = formatDate(startDateObj, false);
    const startTime = formatTime(startDateObj);
    if (endDateObj) {
      const endDate = formatDate(endDateObj, false);
      const endTime = formatTime(endDateObj);
      if (startDate === endDate) {
        displayDateInfo = `${startDate} from ${startTime} to ${endTime}`;
      } else {
        displayDateInfo = `Beginning at ${startTime} ${startDate} until ${endTime} ${endDate}`;
      }
    } else {
      displayDateInfo = `Starts at ${startTime} ${startDate}`;
    }
  }

  return (
    <Dialog open={Boolean(event)} onClose={onClose}>
      <DialogTitle>{event.title}</DialogTitle>
      <Divider />
      <DialogContent>
        <Typography variant="body1">
          <strong>What: </strong>
          {event.description}
        </Typography>
        <Typography variant="body1">
          <strong>Where: </strong>
          {event.location}
        </Typography>

        <Typography variant="body1">
          <strong>Whena: </strong>
          {displayDateInfo}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};
