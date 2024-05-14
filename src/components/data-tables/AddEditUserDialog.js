import { Dialog, DialogTitle, TextField, Link, DialogContent, DialogActions, FormLabel, Button, FormControl, RadioGroup, FormControlLabel, Radio } from '@mui/material';
import React, { useState, useEffect } from 'react';
import NextLink from 'next/link';
import { CityOrCommunityCell } from './CityOrCommunityCell';

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
            onSubmitForm(user);
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
                        margin="dense"
                        id="email"
                        label="Email (Readonly)"
                        type="email"
                        fullWidth
                        value={user.email}
                        InputProps={{
                            readOnly: true,
                        }}
                        disabled
                    />

                    <TextField
                        autoFocus
                        margin="dense"
                        id="name"
                        label="Name"
                        type="text"
                        fullWidth
                        value={user.name}
                        onChange={(e) => setUser({ ...user, name: e.target.value })}
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

                    {/* MUI Label for user role */}
                    
                    {/* <FormControl component="fieldset"> */}



                    <FormControl component="fieldset" sx = {{mt:2}} fullWidth>
                        <FormLabel component="legend">User Role</FormLabel>

                        <RadioGroup row aria-label="role" id = 'role' name="role" value={user.role} onChange={(e) => setUser({ ...user, role: e.target.value })}>
                            <FormControlLabel value="Admin" control={<Radio />} label="Admin" />
                            <FormControlLabel value="City Admin" control={<Radio />} label="City Admin" />
                            <FormControlLabel value="Community Admin" control={<Radio />} label="Community Admin" />
                        </RadioGroup>
                    </FormControl>

                    {
                        user.cities && user.cities.length > 0 && (
                            <FormControl component="fieldset" sx = {{mt:2}} fullWidth>
                                <FormLabel component="legend" sx = {{mb:1}}>Cities Managing</FormLabel>
                                <CityOrCommunityCell params={{value:user.cities}} type='city' />
                            </FormControl>
                        )
                    }
                  
                    {
                        user.communities && user.communities.length > 0 && (
                            <FormControl component="fieldset" sx = {{mt:2}} fullWidth>
                                <FormLabel component="legend">Communities Managing</FormLabel>
                                <CityOrCommunityCell  params={{value:user.communities}} type='community' />
                                   
                            </FormControl>
                        )
                    }


                        
                   
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
