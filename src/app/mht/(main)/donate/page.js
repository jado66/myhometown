'use client'
import React, { useEffect } from 'react';
import { Container, Typography, Grid } from '@mui/material';
import useGiveButterScripts from '@/hooks/use-give-butter-scripts';
import { WebsiteTestDonateForm } from '@/constants/give-butter/constants';
import '@/styles/givebutter.css';

const Donate = () => {

    const {isLoaded} = useGiveButterScripts();
    
    return (
        <Container>
            <Typography 
                variant="h2" 
                component="h1"
                sx = {{paddingTop:3, marginBottom:2}}
                gutterBottom
            >
                Donate Page
            </Typography>
            <Typography variant="body1">
                Your donations help us continue to deliver quality services and products. Every little bit helps. Thank you.
            </Typography>

            <Grid container sx = {{minHeight:"500px", mt:3}}>
                <WebsiteTestDonateForm/>
            </Grid>

        </Container>
    );
};

export default Donate;