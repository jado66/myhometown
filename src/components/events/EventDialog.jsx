import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  DialogActions,
  Button,
  Divider,
} from "@mui/material";
import moment from "moment";

export const EventDialog = ({ onClose, event }) => {
  if (!event) {
    return null;
  }

  const startDateObj = moment(event.start);
  const endDateObj = event.end ? moment(event.end) : null;

  // Check if they are valid date objects
  if (!startDateObj.isValid() || (endDateObj && !endDateObj.isValid())) {
    return null;
  }

  const formatDate = (momentObj, includeTime = true) => {
    if (includeTime) {
      return momentObj.format("MMMM D, YYYY h:mm A");
    }
    return momentObj.format("MMMM D, YYYY");
  };

  const formatTime = (momentObj) => {
    return momentObj.format("h:mm A");
  };

  let displayDateInfo;

  if (event.allDay) {
    displayDateInfo = startDateObj.format("MMMM D, YYYY");
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
          {event.description || "No description provided"}
        </Typography>
        <Typography variant="body1">
          <strong>Where: </strong>
          {event.location || "No location specified"}
        </Typography>

        <Typography variant="body1">
          <strong>When: </strong>
          {displayDateInfo}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};
