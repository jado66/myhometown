'use client'
import React, { useEffect } from 'react';
import { Container, Typography, Grid, Box, Divider } from '@mui/material';
import useGiveButterScripts from '@/hooks/use-give-butter-scripts';
import { WebsiteTestDonateForm } from '@/constants/give-butter/constants';
import '@/styles/givebutter.css';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { CheckBox } from '@mui/icons-material';
import CitiesStrongLogo from '@/assets/svg/logos/CitiesStrong';
import CitiesStrongShieldIcon from '@/assets/svg/logos/CitiesStrongShieldIcon';
import Link from 'next/link';

const items = [
    'Complete Transparency',
    'Dollars multiplied by thousands of volunteer hours',
    'Real results you can see and feel',
    'Many kinds of projects to fund',
    'Long term sustainability',
    'Able to build strong community relationships',
    'Easy to involve your staff in community projects'
  ];

const Donate = () => {

    const {isLoaded} = useGiveButterScripts();
    
    return (
        <Container >
            <Typography
          sx={{
            textTransform: 'uppercase',
            fontWeight: 'medium',
          }}
          gutterBottom
          align={'center'}
          mt={7}
        >
          Donate
        </Typography>
        <Box marginBottom={2}>
          <Typography
            variant="h2"
            align={'center'}
            sx={{
              fontWeight: 700,
            }}
          >
            Put your money{' '}
            <br/>
            
              where your
              
              <Typography
              color={'primary'}
              component={'span'}
              variant={'inherit'}
            > mouth
              </Typography>
              {' '}is.
          </Typography>
        </Box>
        
       

        

        <Grid container sx = {{minHeight:"500px", mt:3, justifyContent:'center'}}>

            <Grid item xs = {12} md = {7}>
            <h2>Donating to Cities Strong is good business:</h2>
                <List>
                    {items.map((item, index) => (
                    <ListItem key={index}>
                        <ListItemIcon sx = {{minWidth:30}}>
                            <CitiesStrongShieldIcon size = {20}/>
                        </ListItemIcon>
                        <ListItemText primary={item} />
                    </ListItem>
                    ))}
                </List>
            </Grid>


            <Grid item xs = {5}/>
            <Grid item xs = {12}>
              <Divider sx = {{borderWidth:3,  borderColor:'black', my:4, mx:3}}/>
            </Grid>
            <Typography
              sx = {{                     
                  maxWidth:'600px',
                  textAlign:'center',
                  mx:'auto',
                  mb:3
              }}
            >
                Your tax-deductible donation will help revitalize more neighborhoods, provide more educational opportunities, and lift more lives.
            </Typography>
            
            <WebsiteTestDonateForm/>
            <Typography
              sx={{
                maxWidth: '600px',
                textAlign: 'center',
                mx: 'auto',
                fontWeight: 'bold',
                my: 3,
              }}
            >
              For donations greater than $1000 please contact{' '}
              <Link href="mailto:csffinance@citiesstrong.org">
                csffinance@citiesstrong.org
              </Link>
            </Typography>
        </Grid>



        </Container>
    );
};

export default Donate;