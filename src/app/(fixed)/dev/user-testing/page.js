'use client'

import { useContext, useEffect, useState } from 'react';
import { TextField, Radio, Button, Box, Container, useTheme, FormControl, RadioGroup, FormControlLabel, Grid, Typography, Alert, Snackbar } from '@mui/material';
import Loading from '@/components/util/Loading';
import { useUser  } from '@auth0/nextjs-auth0/client';

const UpdateUserPage = () => {
    const theme = useTheme();
    const { user } = useUser()


    const fetchUserClaims = async () => {
        const response = await fetch('/api/auth/user-claims')
        const data = await response.json()
        console.log('User claims: ', data)
        alert(JSON.stringify(data))
    }

    useEffect(() => {

        if (user){
            fetchUserClaims()

        }

    }, [user])



    if (!user) {
        return  (<Box display = 'flex' justifyContent = 'center'>
        <Loading size = {50}/>
    </Box>)
    }

    return (
        <Box>
            User: {
                JSON.stringify(user)
            }

            <br/>
            <br/>
            <br/>

            Roles: {
                JSON.stringify(user['http://myhometown.com/roles'])
            }

        
        </Box>
    );
};

export default UpdateUserPage;
