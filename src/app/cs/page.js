'use client'
import React from 'react';
import { 
  useTheme,
  Accordion, 
  Typography, 
  Button,
  Grid, 
  Divider
} from '@mui/material';


import { styled } from '@mui/system';
import ProviderWrapper from '@/contexts/ProviderWrapper';
import { CitiesStrongLayout } from '@/layout';
import { ImageAccordion } from '@/components/ImageAccordion';

const Page = () => {

    const theme = useTheme()

    return (
      <ProviderWrapper theme = 'alt'>
        <CitiesStrongLayout>
          {/* <ContainerStyled maxWidth = "md" id = 'main-container' > */}

            <>
              <Grid 
                item 
                xs={12}
                style={{
                  backgroundColor: 'grey',
                  height: '250px',
                  backgroundImage: 'url(/images/cs/hero1.jpg)', // Assuming conversion to .png
                  backgroundSize: 'cover', // Ensures the image covers the whole area
                  backgroundPosition: 'center top', // Centers horizontally and aligns the top vertically
                  backgroundRepeat: 'no-repeat' // Prevents the image from repeating
                }}
              />

              <Grid item xs={12} sx = {{pX:0}}>
                <Divider sx = {{borderWidth:3, mx:4, borderColor:'black', mt:5}}/>
              
              </Grid>

              <Grid item xs = {12} md = {6} sx = {{padding:4, display:'flex', flexDirection:'column'}}>
                <Typography variant = 'h4' sx = {{flexGrow:1}}>
                  Our Name is our mission. We build strong cities through a culture of love and service.
                </Typography>
                <ButtonStyled variant='outlined'  sx = {{mr:'auto', mt:3}}>
                  Learn More
                </ButtonStyled>
                <Divider sx = {{borderWidth:3,  borderColor:'black', mt:4}}/>
              </Grid>

              <Grid item xs = {12} md = {6}  sx = {{padding:4, pt:{xs:0,md:4}}}>
                <Grid 
                  item xs={12} 
                  style={{
                    height: '350px',
                    backgroundImage: 'url(/images/cs/service.jpg)',
                    backgroundSize: 'cover', 
                    backgroundPosition: 'center top',
                    backgroundRepeat: 'no-repeat'
                  }}
                />
                
                <Divider sx = {{borderWidth:3,  borderColor:'black', mt:4}}/>
              </Grid>

              <Grid item xs = {12} md = {6}  sx = {{padding:4, pt:0, display:'flex', flexDirection:'column', height:{md:'220px'}}}>
                <Typography variant = 'h5' sx = {{flexGrow:1}}>
                  We do it by supporting community programs that revitalize neighborhoods, inspire education &amp; lift lives.
                </Typography>
                <ButtonStyled variant='outlined'  sx = {{mr:'auto', mt:3}}>
                  Learn More
                </ButtonStyled>
                <Divider sx = {{borderWidth:3,  borderColor:'black', mt:4, display:{xs:'block',md:'none'}}}/>
              </Grid>

              <Grid item xs = {12} md = {6}  sx = {{padding:4, pt:0, display:'flex', flexDirection:'column', height:{md:'220px'}}}>
                <Typography variant = 'h5' sx = {{flexGrow:1}}>
                  Our vision is beautiful, thriving communities full of happiness, peace, and personal growth.
                </Typography>
                <ButtonStyled variant='outlined'  sx = {{mr:'auto', mt:3}}>
                  Learn More
                </ButtonStyled>
              </Grid>

              <Grid item xs={12} sx={{ m:4, mt:0, position:'relative'}}>
                <Grid item xs={12} 
                  sx={{
                    backgroundColor:'grey', 
                    height:'375px',
                    backgroundImage: 'url(/images/cs/revitalization.webp)',
                    backgroundSize: 'cover', 
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                  }}/>
                <ImageAccordion
                  title = 'Neighborhood Revitalization'
                  content = 'Description or content about Neighborhood Revitalization goes here.'
                />
              </Grid>
              <Grid item xs={12} sx={{ m:4, mt:0, position:'relative'}}>
                <Grid 
                  item 
                  xs={12}
                  sx={{
                    backgroundColor: 'grey',
                    height: '375px',
                    overflow: 'hidden',
                    position: 'relative'
                  }}
                >
                  <img
                    src="/images/cs/education.jpg"
                    alt="Mental Health"
                    loading="lazy" // Lazy load the image
                    style={{
                      width: '100%',
                      height: 'auto',
                      position: 'absolute',
                      top: '-100px', // Adjust this value to move the image down
                      left: '0'
                    }}
                  />
                </Grid>
                  
                <ImageAccordion
                  title = 'Enhancing Public Education'
                  content = 'Description or content about Neighborhood Revitalization goes here.'
                  bgColor = '#188D4E'
                  right
                />
              </Grid>
              <Grid item xs={12} sx={{ m:4, mt:0, position:'relative'}}>
                <Grid 
                  item 
                  xs={12}
                  sx={{
                    backgroundColor: 'grey',
                    height: '375px',
                    overflow: 'hidden',
                    position: 'relative'
                  }}
                >
                  <img
                    src="/images/cs/immigration.jpg"
                    alt="Mental Health"
                    loading="lazy" // Lazy load the image
                    style={{
                      width: '100%',
                      height: 'auto',
                      position: 'absolute',
                      top: '-100px', // Adjust this value to move the image down
                      left: '0'
                    }}
                  />
                </Grid>
                <ImageAccordion
                  title = 'Legal Immigration Assistance'
                  content = 'Description or content about Neighborhood Revitalization goes here.'
                  bgColor = '#DC5331'
                />
              </Grid>
              <Grid item xs={12} sx={{ m:4, mt:0, position:'relative'}}>
                <Grid 
                  item 
                  xs={12}
                  sx={{
                    backgroundColor: 'grey',
                    height: '375px',
                    overflow: 'hidden',
                    position: 'relative'
                  }}
                >
                  <img
                    src="/images/cs/mental-health.jpg"
                    alt="Mental Health"
                    loading="lazy" // Lazy load the image
                    style={{
                      width: '100%',
                      height: 'auto',
                      position: 'absolute',
                      top: '-100px', // Adjust this value to move the image down
                      left: '0'
                    }}
                  />
                </Grid>
                <ImageAccordion
                  title = 'Mental Health Assistance'
                  content = 'Description or content about Neighborhood Revitalization goes here.'
                  bgColor = '#286AA4'
                  right
                />
              </Grid>


            
            </>
          {/* </ContainerStyled> */}
        </CitiesStrongLayout>
      </ProviderWrapper>
      );
    }

export default Page;

const ButtonStyled = styled(Button)({
  borderRadius: "0px",
  textTransform:'capitalize',
  borderColor:'black',
  borderWidth:'2px',
  color:'black',
  fontWeight:'bold'
});


