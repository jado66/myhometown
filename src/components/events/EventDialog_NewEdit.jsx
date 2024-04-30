import { 
    Dialog, 
    DialogTitle, 
    DialogContent, 
    DialogActions, 
    IconButton,
    Button, 
    Divider, 
    TextField, 
    Checkbox,
    FormControlLabel,
    Grid
  } from "@mui/material";

  import { Delete } from "@mui/icons-material";

  import { useEffect, useState } from "react";
  import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
  import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment'
import { DatePicker, DateTimePicker, TimePicker } from "@mui/x-date-pickers";

export const EventDialog_NewEdit = ({ onClose, show, event = {}, onSave, isEdit, onDelete }) => {
    const [currentEvent, setCurrentEvent] = useState(event);
    const [isMultiDay, setIsMultiDay] = useState(false);

    useEffect(() => {
        setCurrentEvent(event);
    }, [event]);

    const handleChange = (field) => (e) => {
        setCurrentEvent({
            ...currentEvent,
            [field]: e.target.value,
        });
    };

    const handleToggle = (field) => (e) => {
        setCurrentEvent({
            ...currentEvent,
            [field]: e.target.checked,
        });
    };

    const handleDateChange = (field) => (date) => {
        setCurrentEvent({
            ...currentEvent,
            [field]: date,
        });
    };

    const handleSave = () => {
        onSave(currentEvent);
    };

    const handleDelete = () => {
        onDelete(currentEvent.id);
    }

    return (
        <LocalizationProvider dateAdapter={AdapterMoment}>
            <Dialog open={show} onClose={onClose} scroll={'paper'} maxWidth = 'md' fullWidth>
                <DialogTitle justifyContent='space-between' sx = {{width:'100%'}} display = 'flex'>
                    {isEdit ? 'Edit Event' : 'Create New Event'}
                    {isEdit && (
                        <IconButton onClick={handleDelete}>
                            <Delete />
                        </IconButton>
                    )}
                </DialogTitle>
                <Divider />

                <DialogContent>
                    <Grid container direction="column" spacing={2}>
                        <Grid item>
                            <TextField label="Title" value={currentEvent?.title || ''} onChange={handleChange('title')} fullWidth />
                        </Grid>
                        <Grid item>
                            <TextField label="Location" value={currentEvent?.location || ''} onChange={handleChange('location')} fullWidth />
                        </Grid>
                        <Grid item>
                            <TextField 
                                label="Description" 
                                value={currentEvent?.description || ''} 
                                onChange={handleChange('description')} 
                                fullWidth 
                                multiline
                                rows={4}
                            />
                        </Grid>

                        <Grid container item direction="row" >
                            <FormControlLabel
                                control={
                                    <Checkbox checked={currentEvent?.allDay || false} onChange={handleToggle('allDay')} />
                                }
                                label="All Day"
                            />

                            <FormControlLabel
                                control={<Checkbox checked={isMultiDay} onChange={()=>setIsMultiDay(p=>!p)} />}
                                label="Is Multi-Day Event"
                            />
                        </Grid>

                        {/* Need a Start and End Regardless */}

                        <Grid container item direction="row" spacing={2}>
                            {
                                isMultiDay ?
                                    <>
                                        <Grid item>
                                            {
                                                currentEvent?.allDay ?
                                                    <DatePicker label="Start Date" onChange={handleDateChange('start')} />
                                                    :
                                                    <DateTimePicker label="Start Date & Time" onChange={handleDateChange('start')} />
                                            }
                                        </Grid>
                                        <Grid item>
                                            {
                                                currentEvent?.allDay ?
                                                    <DatePicker label="End Date" onChange={handleDateChange('end')} />
                                                    :
                                                    <DateTimePicker label="End Date & Time" onChange={handleDateChange('end')} />
                                            }
                                        </Grid>
                                    </>
                                    :
                                    <>
                                        <Grid item>
                                            <DatePicker label="Event Date" onChange={handleDateChange('start')} />
                                        </Grid>
                                        {
                                            !currentEvent?.allDay &&
                                                <>
                                                    <Grid item>
                                                        <TimePicker label="Start Time" onChange={handleDateChange('start')} />
                                                    </Grid>
                                                    <Grid item>
                                                        <TimePicker label="End Time" onChange={handleDateChange('end')} />
                                                    </Grid>
                                                </>
                                        }
                                        
                                    </>
                            }
                        </Grid>

                        <Grid item>
                            <TextField label="Resource" value={currentEvent?.resource || ''} onChange={handleChange('resource')} fullWidth />
                        </Grid>
                    </Grid>
                </DialogContent>

                <DialogActions>
                    <Button onClick={handleSave}>Save</Button>
                    <Button onClick={onClose}>Close</Button>
                </DialogActions>
            </Dialog>
        </LocalizationProvider>

    );
}