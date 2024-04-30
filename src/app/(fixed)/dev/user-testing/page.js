'use client'

import { useEffect, useState } from 'react';
import { TextField, Radio, Button, Box, Container, useTheme, FormControl, RadioGroup, FormControlLabel, Grid, Typography, Alert, Snackbar } from '@mui/material';
import { useUser } from '@/hooks/use-user';
import Loading from '@/components/util/Loading';

const UpdateUserPage = () => {
    const theme = useTheme();
    const { user, updateUser, hasLoaded } = useUser();

    const [showSnackbar, setShowSnackbar] = useState(false);
    const hideSnackbar = () => { setShowSnackbar(false);};

    const [formData, setFormData] = useState({
        name: user ? user.name : '',
        email: user ? user.email : '',
        role: user ? user.role : '',
        contactNumber: user ? user.contactNumber : '',
    });

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name,
                email: user.email,
                role: user.role,
                contactNumber: user.contactNumber,
            });
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSubmit = (e) => {
        updateUser(formData);
        setShowSnackbar(true);
    };

    if (!hasLoaded) {
        return  (<Box display = 'flex' justifyContent = 'center'>
        <Loading size = {50}/>
    </Box>)
    }

    return (
        <Box>
            <Box position={'relative'} sx={{backgroundColor: theme.palette.alternate.main, p:4}}>
                <Container>
                    <Grid container direction="column" spacing={2}>

                       <Grid item xs={12}>
                       <Typography
                            gutterBottom
                            color={'primary'}
                            variant='h4'
                        >
                                Update User
                            </Typography>
                        </Grid>

                        <Grid item xs={6}>
                            <TextField
                                autoFocus
                                margin="dense"
                                name='name'
                                id="name"
                                label="User Name"
                                type="text"
                                value={formData.name}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                margin="dense"
                                name='email'
                                id="email"
                                label="Email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                margin="dense"
                                id="contactNumber"
                                name='contactNumber'
                                label="Contact Number"
                                type="tel"
                                value={formData.contactNumber}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={6} sx={{px:3}}>
                            <FormControl component="fieldset">
                                <RadioGroup row aria-label="role" id = 'role' name="role" value={formData.role} onChange={handleChange}>
                                    <FormControlLabel value="admin" control={<Radio />} label="Admin" />
                                    <FormControlLabel value="city-owner" control={<Radio />} label="City Owner" />
                                    <FormControlLabel value="community-owner" control={<Radio />} label="Community Owner" />
                                </RadioGroup>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <Button variant="contained" onClick={handleSubmit}>Update</Button>
                        </Grid>
                        <Snackbar 
                            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                            open={showSnackbar} 
                            autoHideDuration={2000} 
                            onClose={hideSnackbar}
                        >
                            <Alert
                                onClose={hideSnackbar}
                                severity="success"
                                variant="filled"
                                sx={{ width: '100%' }}
                            >
                                User updated successfully!
                            </Alert>
                        </Snackbar>
                    </Grid>
                </Container>
            </Box>
        </Box>
    );
};

export default UpdateUserPage;
