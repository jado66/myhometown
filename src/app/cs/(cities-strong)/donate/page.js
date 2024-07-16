'use client'
import React, { useEffect } from 'react';
import { Container, Typography, Grid } from '@mui/material';
import useGiveButterScripts from '@/hooks/use-give-butter-scripts';
import { WebsiteTestDonateForm } from '@/constants/give-butter/constants';
import '@/styles/givebutter.css';

const Donate = () => {

    const {isLoaded} = useGiveButterScripts();
    
    return (
        <Container >
            <Typography
                variant="h2"
                sx={{
                    fontWeight: 700,
                    mt:{xs:3, md:5},
                    textAlign:'center'
                }}
            >
                Donate
            </Typography>
            <Typography 
                variant="body1"
                sx={{
                    textAlign:'center'
                }}
            >
                Your donations help us continue to deliver quality services. Every little bit helps. Thank you.
            </Typography>

            <Grid container sx = {{minHeight:"500px", mt:3, justifyContent:'center'}}>
                <WebsiteTestDonateForm/>
            </Grid>

        </Container>
    );
};

export default Donate;