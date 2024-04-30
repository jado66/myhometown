import { Dialog, DialogTitle, DialogContent, Typography, DialogActions, Button, Divider } from "@mui/material";

export const EventDialog = ({ onClose, event }) => {
    
    if (!event) {
        return null;
    }
    
    return (
        <Dialog open={event !== null} onClose={onClose}>
            <DialogTitle>{event.title}</DialogTitle>
            <Divider />
            <DialogContent>
                <Typography variant="body1">
                    <strong>Location: </strong> {event.location}
                </Typography>
                <Typography variant="body1">
                    <strong>Description: </strong> {event.description}
                </Typography>
                <Typography variant="body1">
                    <strong>Start: </strong> {event.start.toString()}
                </Typography>
                <Typography variant="body1">
                    <strong>End: </strong> {event.end.toString()}
                </Typography>
                <Typography variant="body1">
                    <strong>All Day: </strong> {event.allDay ? 'Yes' : 'No'}
                </Typography>
                <Typography variant="body1">
                    <strong>Resource: </strong> {event.resource || 'None'}
                </Typography>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
}
