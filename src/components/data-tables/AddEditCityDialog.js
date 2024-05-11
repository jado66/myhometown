import { Dialog, DialogTitle, TextField, DialogContent, DialogActions, Button, Grid, FormControl, InputLabel, Divider, Box } from '@mui/material';
import React, { useState, useEffect } from 'react';
import UserSelect from './selects/UserSelect';
import StateSelect from './StateSelect';
import { toast } from 'react-toastify';
import CommunitySelect from './selects/CommunitySelect';

const initialState = {
    name: '',
    state: 'Utah',
    country: 'USA',
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

    const validateForm = () => {

        // city can't be empty and cant have special characters
        if (!city.name ) {
            toast.error("City name can't be empty");
            return false;
        }

        if (!city.name.match(/^[a-zA-Z\s]*$/)){
            toast.error("City name can't have special characters");
            return false;
        }

        if(city.name !== city.name.trim()){
            toast.error("City name can't have leading or trailing spaces");
            return false;
        }

        // // City must have a city owner
        // if (city.cityOwners.length === 0) {
        //     toast.error("City must have at least one owner");
        //     return false;
        // }

        return true;
    }


    const handleSubmit = (event) => {
        event.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        
        if (initialCityState) {

            onSubmitForm(city);
            setCity(initialState);
            handleClose();
            return;
        }

        onSubmitForm(city);
        setCity(initialState);
        handleClose();
    };

    const handleUserSelectChange = (selectedUsers) => {
        setCity({
             ...city, 
             cityOwners: selectedUsers.map(user => user.data)
        });
    };

    const handleCommunitySelectChange = (selectedCommunities) => {
        setCity({
            ...city,
            communities: selectedCommunities.map(community => community.data)
        });
    };

    const title = initialCityState ? "Edit City Details" : "Add City Details";

    return (
        <Dialog open={open} onClose={handleClose} >
            <DialogTitle>{title}</DialogTitle>
            <form onSubmit={handleSubmit}>
                <DialogContent sx = {{height: 700}}>
                    <TextField
                        sx = {{mt:1}}
                        autoFocus
                        margin="dense"
                        id="name"
                        label="City Name"
                        type="text"
                        fullWidth
                        value={city.name}
                        onChange={(e) => setCity({ ...city, name: e.target.value })}
                    />
                    
                    <StateSelect
                        sx = {{mt:1, mb:0}}
                        margin="dense"
                        id="state"
                        label="State"
                        type="text"
                        fullWidth
                        value={city.state}
                        onChange={(e) => setCity({ ...city, state: e.target.value })}
                    />
                    {/* <TextField
                        disabled
                        sx = {{mt:1}}
                        margin="dense"
                        id="country"
                        label="Country"
                        type="text"
                        fullWidth
                        value={city.country}
                        onChange={(e) => setCity({ ...city, country: e.target.value })}
                    /> */}

                    <FormControl fullWidth sx = {{mt:-1, mb:3}}>
                        <InputLabel>City Owners</InputLabel>
                    </FormControl>
                    
                    <FormControl fullWidth sx = {{mt:1.5}}>
                        <UserSelect 
                            label="City Owners"
                            value={
                                city.cityOwners.length > 0 
                                    ? city.cityOwners.map(user => ({ value: user._id, label: user.name, data: user}))
                                    : []
                            }
                            onChange={handleUserSelectChange}
                        />
                    </FormControl>

                    <FormControl fullWidth sx = {{mt:-1, mb:3}}>
                        <InputLabel>Linked Communities</InputLabel>
                    </FormControl>
                    
                    <FormControl fullWidth sx = {{mt:1.5}}>
                        <CommunitySelect 
                            value={
                                city?.communities?.length > 0 
                                    ? city.communities.map(community => ({ value: community._id, label: community.name, data: community}))
                                    : []
                            }
                            onChange={handleCommunitySelectChange}
                        />
                    </FormControl>
                    
                </DialogContent>
                <DialogActions sx = {{
                    display:'flex',
                    justifyContent:'space-between',
                }}>
                    <Box>
                        {initialCityState && 
                            <>
                                <Button 
                                    onClick={handleClose} 
                                    color="primary"
                                    href={`/${city.state.toLowerCase()}/${city.name.toLowerCase().replaceAll(/\s/g, "-")}`}
                                >
                                    View Page
                                </Button>
                                <Button 
                                    type="submit" 
                                    color="primary" 
                                    href={`/edit/${city.state.toLowerCase()}/${city.name.toLowerCase().replaceAll(/\s/g, "-")}`}
                                >
                                    Edit Landing Page
                                </Button>
                            </>
                        }
                    </Box>
                    <Box>
                        <Button onClick={handleClose} color="primary">
                            Cancel
                        </Button>
                        <Button type="submit" color="primary">
                            {initialCityState ? "Save" : "Add"}
                        </Button>
                    </Box>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default AddEditCityDialog;
