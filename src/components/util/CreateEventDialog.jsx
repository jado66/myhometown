import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';

function CreateEventDialog({ open, onClose, onSubmit }) {
    const [title, setTitle] = useState('');
    const [start, setStart] = useState(null);
    const [end, setEnd] = useState(null);
    const [allDay, setAllDay] = useState(false);
    const [resource, setResource] = useState(null);

    const handleCreateEvent = () => {
        const newEvent = createEvent(title, start, end, allDay, resource);
        // Do something with the new event, e.g. save it to a database
        console.log(newEvent);
        onSubmit(newEvent);
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Create Event</DialogTitle>
            <DialogContent>
                {/* Add form fields for event details */}
                <TextField value={title} onChange={(e) => setTitle(e.target.value)} label="Title" fullWidth />
                <TextField type="datetime-local" value={start} onChange={(e) => setStart(e.target.value)} label="Start" fullWidth />
                <TextField type="datetime-local" value={end} onChange={(e) => setEnd(e.target.value)} label="End" fullWidth />
                <FormControlLabel control={<Checkbox checked={allDay} onChange={(e) => setAllDay(e.target.checked)} />} label="All Day" />
                <TextField value={resource} onChange={(e) => setResource(e.target.value)} label="Resource" fullWidth />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={handleCreateEvent} variant="contained" color="primary">
                    Create
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default CreateEventDialog;
