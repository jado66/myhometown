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
                  sx={{
                    backgroundColor: 'grey',
                    height: '375px',
                    overflow: 'hidden',
                    position: 'relative'
                  }}
                >
                  <img
                    src="/cs/homepage/service.webp"
                    alt="Mental Health"
                    loading="lazy" // Lazy load the image
                    style={{
                      width: '100%',
                      height: 'auto',
                      position: 'absolute',
                      top: '-140px', // Adjust this value to move the image down
                      left: '0'
                    }}
                  />
                </Grid>

              <Grid item xs={12} sx = {{pX:0}}>
                <Divider sx = {{borderWidth:3, mx:4, borderColor:'black', mt:5}}/>
              
              </Grid>

              <Grid item xs = {12} md = {6} sx = {{padding:4, display:'flex', flexDirection:'column'}}>
                <Typography variant = 'h4' sx = {{flexGrow:1}}>
                  Our Name is our mission. We build strong cities through a culture of love and service.
                </Typography>
                <ButtonStyled variant='outlined'  sx = {{mr:'auto', mt:3}}
                  href = '/about'
                >
                  Learn More
                </ButtonStyled>
                <Divider sx = {{borderWidth:3,  borderColor:'black', mt:4}}/>
              </Grid>

              <Grid item xs={12} md={6} sx={{ padding: 4, pt: { xs: 0, md: 4 } }}>
                <Grid 
                  item 
                  xs={12}
                  sx={{
                    backgroundColor: 'grey',
                    height: '350px',
                    overflow: 'hidden',
                    position: 'relative'
                  }}
                >
                  <img
                    src="/cs/homepage/mother-daughter.webp"
                    alt="Mental Health"
                    loading="lazy" // Lazy load the image
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover', // Ensures the image covers the entire area
                      position: 'absolute',
                      objectPosition: 'right', // Shifts the image to the left
                      top: '0',
                      left: '0px'
                    }}
                  />
                </Grid>
                
                <Divider sx={{ borderWidth: 3, borderColor: 'black', mt: 4 }} />
              </Grid>

              <Grid item xs = {12} md = {6}  sx = {{padding:4, pt:0, display:'flex', flexDirection:'column', height:{md:'220px'}}}>
                <Typography variant = 'h5' sx = {{flexGrow:1}}>
                  We do it by supporting community programs that revitalize neighborhoods, inspire education &amp; lift lives.
                </Typography>
                <ButtonStyled variant='outlined'  sx = {{mr:'auto', mt:3}}
                  href = '/about'
                >
                  Learn More
                </ButtonStyled>
                <Divider sx = {{borderWidth:3,  borderColor:'black', mt:4, display:{xs:'block',md:'none'}}}/>
              </Grid>

              <Grid item xs = {12} md = {6}  sx = {{padding:4, pt:0, display:'flex', flexDirection:'column', height:{md:'220px'}}}>
                <Typography variant = 'h5' sx = {{flexGrow:1}}>
                  Our vision is beautiful, thriving communities full of happiness, peace, and personal growth.
                </Typography>
                <ButtonStyled variant='outlined'  sx = {{mr:'auto', mt:3}}
                  href = '/about'
                >
                  Learn More
                </ButtonStyled>
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
                    src="/cs/homepage/neighborhood-revitalization.webp"
                    alt="Mental Health"
                    loading="lazy" // Lazy load the image
                    style={{
                      width: '100%',
                      height: 'auto',
                      position: 'absolute',
                      top: '-240px', // Adjust this value to move the image down
                      left: '0'
                    }}
                  />
                </Grid>
                <ImageAccordion
                  title = 'Neighborhood Revitalization'
                  content = {`We support My Hometown's neighbor helping neighbor programs including Days of Service and Community Resource Centers.`}
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
                    src="/cs/homepage/kids-learning.webp"
                    alt="Mental Health"
                    loading="lazy" // Lazy load the image
                    style={{
                      width: '100%',
                      height: 'auto',
                      position: 'absolute',
                      top: '0px', // Adjust this value to move the image down
                      left: '0'
                    }}
                  />
                </Grid>
                  
                <ImageAccordion
                  title = 'Enhancing Public Education'
                  content = 'We partner with schools to enhance literacy, leadership and academic achievement that will help students succeed in life.'
                  bgColor = '#188D4E'
                  contentColor = '#ffffff'

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
                    src="/cs/homepage/Family-Seated-on-Bench.webp"
                    alt="Legal Immigration Assistance"
                    loading="lazy" // Lazy load the image
                    style={{
                      width: '100%',
                      height: 'auto',
                      position: 'absolute',
                      top: '-60px', // Adjust this value to move the image down
                      left: '0'
                    }}
                  />
                </Grid>
                <ImageAccordion
                  title = 'Legal Immigration Assistance'
                  content = 'We help provide legal immigration assistance with relevant information and resources that will empower candidates to achieve their goals.'
                  bgColor = '#DC5331'
                  contentColor = '#ffffff'

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
                    src="/cs/homepage/college-kids-seated.webp"
                    alt="Mental Health"
                    loading="lazy" // Lazy load the image
                    style={{
                      width: '100%',
                      height: 'auto',
                      position: 'absolute',
                      top: '-520px', // Adjust this value to move the image down
                      left: '0'
                    }}
                  />
                </Grid>
                <ImageAccordion
                  title = 'Mental Health Assistance'
                  content = 'We help provide mental health programs, including a hotline and training for parents so they can talk with their pre-teen and teenage children.'
                  bgColor = '#286AA4'
                  contentColor = '#ffffff'
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


