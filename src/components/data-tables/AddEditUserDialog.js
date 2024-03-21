import { Dialog, DialogTitle, TextField, DialogContent, DialogActions, Button, FormControl, RadioGroup, FormControlLabel, Radio } from '@mui/material';
import React, { useState, useEffect } from 'react';

const initialState = {
    id: '',
    name: '',
    state: '',
    country: '',
    upcomingEvents: [],
    coordinates: {},
    boundingShape: [],
    userOwners: []
};

const AddEditUserDialog = ({ open, handleClose, onSubmitForm, initialUserState }) => {
    const [user, setUser] = useState(initialUserState || initialState);

    useEffect(() => {
        if (open) {
            setUser(initialUserState || initialState);
        }
    }, [open, initialUserState]);

    const handleSubmit = (event) => {
        event.preventDefault();

        if (initialUserState) {
            onSubmitForm(user.id, user);
            setUser(initialState);
            handleClose();
            return;
        }

        onSubmitForm(user);
        setUser(initialState);
        handleClose();
    };

    const title = initialUserState ? "Edit User" : "Add User";

    return (
        <Dialog open={open} onClose={handleClose}>
            <DialogTitle>{title}</DialogTitle>
            <form onSubmit={handleSubmit}>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="name"
                        label="User Name"
                        type="text"
                        fullWidth
                        value={user.name}
                        onChange={(e) => setUser({ ...user, name: e.target.value })}
                    />
                    <TextField
                        margin="dense"
                        id="email"
                        label="Email"
                        type="email"
                        fullWidth
                        value={user.email}
                        onChange={(e) => setUser({ ...user, email: e.target.value })}
                    />

                    <TextField
                        margin="dense"
                        id="contactNumber"
                        label="Contact Number"
                        type="phone"
                        fullWidth
                        value={user.contactNumber}
                        onChange={(e) => setUser({ ...user, contactNumber: e.target.value })}
                    />

                    <FormControl component="fieldset">
                        <RadioGroup row aria-label="role" id = 'role' name="role" value={user.role} onChange={(e) => setUser({ ...user, role: e.target.value })}>
                            <FormControlLabel value="Admin" control={<Radio />} label="Admin" />
                            <FormControlLabel value="Community Owner" control={<Radio />} label="Community Owner" />
                            <FormControlLabel value="City Owner" control={<Radio />} label="City Owner" />
                        </RadioGroup>
                    </FormControl>
                    {/* Add similar TextFields for other attributes... */}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary">
                        Cancel
                    </Button>
                    <Button type="submit" color="primary">
                        {initialUserState ? "Save" : "Add"}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default AddEditUserDialog;
