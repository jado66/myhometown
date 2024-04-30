import { Dialog, DialogTitle, TextField, DialogContent, DialogActions, Button, Grid } from '@mui/material';
import React, { useState, useEffect } from 'react';
import UserSelect from './selects/UserSelect';

const initialState = {
    id: '',
    name: '',
    state: '',
    country: '',
    upcomingEvents: [],
    coordinates: {},
    boundingShape: [],
    cityOwners: []
};

const AddEditCityDialog = ({ open, handleClose, onSubmitForm, initialCityState }) => {
    const [city, setCity] = useState(initialCityState || initialState);

    useEffect(() => {
        if (open) {
            setCity(initialCityState || initialState);
        }
    }, [open, initialCityState]);

    const handleSubmit = (event) => {
        event.preventDefault();

        if (initialCityState) {
            onSubmitForm(city.id, city);
            setCity(initialState);
            handleClose();
            return;
        }

        onSubmitForm(city);
        setCity(initialState);
        handleClose();
    };

    const handleSelectChange = (selectedUsers) => {
        setCity({ ...city, cityOwners: selectedUsers.map(user => user.data) });
    };

    const title = initialCityState ? "Edit City" : "Add City";

    return (
        <Dialog open={open} onClose={handleClose}>
            <DialogTitle>{title}</DialogTitle>
            <form onSubmit={handleSubmit}>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="name"
                        label="City Name"
                        type="text"
                        fullWidth
                        value={city.name}
                        onChange={(e) => setCity({ ...city, name: e.target.value })}
                    />
                    <TextField
                        margin="dense"
                        id="state"
                        label="State"
                        type="text"
                        fullWidth
                        value={city.state}
                        onChange={(e) => setCity({ ...city, state: e.target.value })}
                    />
                    <TextField
                        margin="dense"
                        id="country"
                        label="Country"
                        type="text"
                        fullWidth
                        value={city.country}
                        onChange={(e) => setCity({ ...city, country: e.target.value })}
                    />

                    <UserSelect 
                        label="City Owners"
                        value={
                            city.cityOwners.length > 0 
                                ? city.cityOwners.map(user => ({ value: user.id, label: user.name, data: user}))
                                : []
                        }
                        onChange={handleSelectChange}
                    />
                    {/* Add similar TextFields for other attributes... */}

                    <Grid container >
                       
                            <Button 
                                variant="outlined" 
                                size="small" 
                                color="secondary"
                                sx = {{color: "grey",marginTop: 1}}
                                href={`/${city.state.toLowerCase()}/${city.name.toLowerCase().replaceAll(/\s/g, "-")}`}
                            >
                                View Landing Page
                            </Button>
                        
                        
                            <Button 
                                variant="contained" 
                                size="small" 
                                color="primary"
                                sx = {{marginTop: 1, marginLeft: 1}}
                                href={`/edit/${city.state.toLowerCase()}/${city.name.toLowerCase().replaceAll(/\s/g, "-")}`}
                            >
                                Edit Landing Page
                            </Button>
                        
                    </Grid>

                    
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary">
                        Cancel
                    </Button>
                    <Button type="submit" color="primary">
                        {initialCityState ? "Save" : "Add"}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default AddEditCityDialog;
