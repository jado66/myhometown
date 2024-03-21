import { Dialog, DialogTitle, TextField, DialogContent, DialogActions, Button } from '@mui/material';
import React, { useState, useEffect } from 'react';
import UserSelect from './selects/UserSelect';

const initialState = {
    id: '',
    name: '',
    cityName: '',
    cityId: '',
    googleCalendarId: '',
    classes: [],
    boundingShape: [],
    communityOwners: []
};

const AddEditCommunityDialog = ({ open, handleClose, onSubmitForm, initialCommunityState }) => {
    const [community, setCommunity] = useState(initialCommunityState || initialState);
    const [isDirty, setIsDirty] = useState(false); // New state

    // Set community to communityProp when dialog is opened or communityProp changes.
    useEffect(() => {
        if (open) {
            setCommunity(initialCommunityState || initialState);
        }
    }, [open, initialCommunityState]);

    
    useEffect(() => {
        if (JSON.stringify(community) !== JSON.stringify(initialCommunityState)) {
            setIsDirty(true);
        } else {
            setIsDirty(false);
        }
    }, [community, initialCommunityState]);

    const handleSubmit = (event) => {
        event.preventDefault();

        if (initialCommunityState) {
            onSubmitForm(community.id, community);
            setCommunity(initialState);
            handleClose();
            return;
        }

        onSubmitForm(community);
        setCommunity(initialState);
        handleClose();
    };

    const handleSelectChange = (selectedUsers) => {
        setCommunity({ ...community, communityOwners: selectedUsers.map(user => user.data) });
    };

    const userSelectValues = community.communityOwners.length?
        community.communityOwners.map(user => ({ value: user.id, label: user.name, data: user }))
        : [];

    const title = initialCommunityState ? "Edit Community" : "Add Community";

    return (
        <Dialog open={open} onClose={handleClose}>
            <DialogTitle>{title}</DialogTitle>
            <form onSubmit={handleSubmit}>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="name"
                        label="Community Name"
                        type="text"
                        fullWidth
                        value={community.name}
                        onChange={(e) => setCommunity({ ...community, name: e.target.value })}
                    />
                    <TextField
                        margin="dense"
                        id="cityName"
                        label="City Name"
                        type="text"
                        fullWidth
                        value={community.cityName}
                        onChange={(e) => setCommunity({ ...community, cityName: e.target.value })}
                    />
                    <TextField
                        margin="dense"
                        id="cityId"
                        label="City ID"
                        type="text"
                        fullWidth
                        value={community.cityId}
                        onChange={(e) => setCommunity({ ...community, cityId: e.target.value })}
                    />
                    <TextField
                        margin="dense"
                        id="googleCalendarId"
                        label="Google Calendar ID"
                        type="text"
                        fullWidth
                        value={community.googleCalendarId}
                        onChange={(e) => setCommunity({ ...community, googleCalendarId: e.target.value })}
                    />
                    <UserSelect 
                        label="Community Owners"
                        value={userSelectValues}
                        onChange={handleSelectChange}
                    />
                    {/* Add similar TextFields for other attributes... */}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary">
                        Cancel
                    </Button>
                    <Button type="submit" color="primary" disabled = {!isDirty}>
                        {initialCommunityState ? "Save" : "Add"}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default AddEditCommunityDialog;
