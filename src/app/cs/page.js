'use client'
import React from 'react';
import { useTheme, List, ListItem, Typography, Container, Button, Grid, Box, Card, CardContent, Divider } from '@mui/material';

import { styled } from '@mui/system';
import { Circle } from '@mui/icons-material';
import ProviderWrapper from '@/contexts/ProviderWrapper';
import { CitiesStrongLayout } from '@/layout';

const ContainerStyled = styled(Grid)({
    flexGrow: 1,
    padding: "2em",
    backgroundColor: "#fafafa", 
    height: "100%",
    margin:'auto',
    minHeight: "100vh",
    boxShadow: 'rgba(0, 0, 0, 0.24) 0px 3px 8px',
    paddingLeft:'0px !important',
    paddingRight:'0px !important',
    paddingTop:0,
    alignContent:'baseline'

});

const CardStyled = styled(Card)({
    boxShadow: "0px 5px 15px rgba(0,0,0,0.1)",
    borderRadius: "10px"
});

const Page = () => {

    const theme = useTheme()

    return (
      <ProviderWrapper theme = 'alt'>
        <CitiesStrongLayout>
          {/* <ContainerStyled maxWidth = "md" id = 'main-container' > */}

            <Grid container 
              sx ={{
                backgroundColor: "#fafafa", 
                mx:'auto'
              }}
              maxWidth='md'
            >

              <Grid item xs={12} style={{backgroundColor:'grey', height:'250px'}}>
                
              
              </Grid>

              <Grid item xs={12} sx = {{pX:0}}>
                <Divider sx = {{borderWidth:3, mx:3, borderColor:'black', mt:5}}/>
              
              </Grid>

              <Grid item xs = {6} sx = {{padding:4, display:'flex', flexDirection:'column'}}>
                <Typography variant = 'h4' sx = {{flexGrow:1}}>
                  Our Name is our mission. We build strong cities through a culture of love and service.
                </Typography>
                <Button variant='outlined'  sx = {{mr:'auto'}}>
                  Learn More
                </Button>
                <Divider sx = {{borderWidth:3,  borderColor:'black', mt:4}}/>
              </Grid>

              <Grid item xs = {6} sx = {{padding:4}}>
                <Grid item xs={12} style={{backgroundColor:'grey', height:'250px'}}>
                </Grid>
                <Divider sx = {{borderWidth:3,  borderColor:'black', mt:4}}/>
              </Grid>

              <Grid item xs = {6} sx = {{padding:4, pt:0, display:'flex', flexDirection:'column', height:'220px'}}>
                <Typography variant = 'h5' sx = {{flexGrow:1}}>
                  We do it by supporting commuinty programs that revitalize neighborhoods, inspire education &amp; lift lives.
                </Typography>
                <Button variant='outlined'  sx = {{mr:'auto'}}>
                  Learn More
                </Button>
              </Grid>

              <Grid item xs = {6} sx = {{padding:4, pt:0, display:'flex', flexDirection:'column', height:'220px'}}>
                <Typography variant = 'h5' sx = {{flexGrow:1}}>
                  Our vision is beautiful, thriving communities full of happiness, peace, and personal growth.
                </Typography>
                <Button variant='outlined'  sx = {{mr:'auto'}}>
                  Learn More
                </Button>
              </Grid>

              {/* <Grid item xs={12} sx={{ m:4, mt:0, position:'relative'}}>
                <pre>
                Palette: {JSON.stringify(theme.palette, null, 4)}

                </pre>
              </Grid> */}
              <Grid item xs={12} sx={{ m:4, mt:0, position:'relative'}}>
                <Grid item xs={12} sx={{backgroundColor:'grey', height:'300px'}}/>

                <Grid item xs={12} sx={{position:'absolute', bottom:0, left:0, width:'50%', backgroundColor:'#F1B42D', p:1}}>
                  <Typography variant = 'h6' textAlign='center' >
                    Neighborhood Revitalization
                  </Typography>
                </Grid>
              </Grid>
              <Grid item xs={12} sx={{ m:4, mt:0, position:'relative'}}>
                <Grid item xs={12} sx={{backgroundColor:'grey', height:'300px'}}/>
                <Grid item xs={12} sx={{position:'absolute', bottom:0, right:0, width:'50%', backgroundColor:'#188D4E', p:1}}>
                  <Typography variant = 'h6' textAlign='center' >
                    Enhancing Public Eduacation
                  </Typography>
                </Grid>
              </Grid>
              <Grid item xs={12} sx={{ m:4, mt:0, position:'relative'}}>
                <Grid item xs={12} sx={{backgroundColor:'grey', height:'300px'}}/>
                <Grid item xs={12} sx={{position:'absolute', bottom:0, left:0, width:'50%', backgroundColor:'#DC5331', p:1}}>
                  <Typography variant = 'h6' textAlign='center' >
                    Legal Immigration Assistance
                  </Typography>
                </Grid>
              </Grid>
              <Grid item xs={12} sx={{ m:4, mt:0, position:'relative'}}>
                <Grid item xs={12} sx={{backgroundColor:'grey', height:'300px'}}/>
                <Grid item xs={12} sx={{position:'absolute', bottom:0, right:0, width:'50%', backgroundColor:theme.palette.primary.main, p:1}}>
                  <Typography variant = 'h6' textAlign='center' >
                    Mental Health Assistance
                  </Typography>
                </Grid>
              </Grid>

            </Grid>

            

          {/* </ContainerStyled> */}
        </CitiesStrongLayout>
      </ProviderWrapper>
      );
    }

export default Page;
