'use client'
import React from 'react';
import { 
  useTheme,
  Accordion, 
  AccordionSummary, 
  AccordionDetails, 
  Typography, 
  Button,
  Grid, 
  Divider
} from '@mui/material';

import Fade from '@mui/material/Fade';

import { styled } from '@mui/system';
import { Circle, ExpandLess } from '@mui/icons-material';
import ProviderWrapper from '@/contexts/ProviderWrapper';
import { CitiesStrongLayout } from '@/layout';

const Page = () => {

    const theme = useTheme()

    return (
      <ProviderWrapper theme = 'alt'>
        <CitiesStrongLayout>
          {/* <ContainerStyled maxWidth = "md" id = 'main-container' > */}

            <Grid container 
              sx ={{
                backgroundColor: "#fafafa", 
                mx:'auto',
                boxShadow: 'rgba(0, 0, 0, 0.24) 0px 3px 8px',

              }}
              maxWidth='md'
            >

              <Grid item xs={12} style={{backgroundColor:'grey', height:'250px'}}>
                
              
              </Grid>

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
                <Grid item xs={12} style={{backgroundColor:'grey', height:'250px'}}>
                </Grid>
                <Divider sx = {{borderWidth:3,  borderColor:'black', mt:4}}/>
              </Grid>

              <Grid item xs = {12} md = {6}  sx = {{padding:4, pt:0, display:'flex', flexDirection:'column', height:{md:'220px'}}}>
                <Typography variant = 'h5' sx = {{flexGrow:1}}>
                  We do it by supporting commuinty programs that revitalize neighborhoods, inspire education &amp; lift lives.
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

              {/* <Grid item xs={12} sx={{ m:4, mt:0, position:'relative'}}>
                <pre>
                Palette: {JSON.stringify(theme.palette, null, 4)}

                </pre>
              </Grid> */}
              <Grid item xs={12} sx={{ m:4, mt:0, position:'relative'}}>
                <Grid item xs={12} sx={{backgroundColor:'grey', height:'300px'}}/>
                <ImageAccordion
                  title = 'Neighborhood Revitalization'
                  content = 'Description or content about Neighborhood Revitalization goes here.'
                />
              </Grid>
              <Grid item xs={12} sx={{ m:4, mt:0, position:'relative'}}>
                <Grid item xs={12} sx={{backgroundColor:'grey', height:'300px'}}/>
                <ImageAccordion
                  title = 'Enhancing Public Eduacation'
                  content = 'Description or content about Neighborhood Revitalization goes here.'
                  bgColor = '#188D4E'
                  right
                />
              </Grid>
              <Grid item xs={12} sx={{ m:4, mt:0, position:'relative'}}>
                <Grid item xs={12} sx={{backgroundColor:'grey', height:'300px'}}/>
                <ImageAccordion
                  title = 'Legal Immigration Assistance'
                  content = 'Description or content about Neighborhood Revitalization goes here.'
                  bgColor = '#DC5331'
                />
              </Grid>
              <Grid item xs={12} sx={{ m:4, mt:0, position:'relative'}}>
                <Grid item xs={12} sx={{backgroundColor:'grey', height:'300px'}}/>
                
                <ImageAccordion
                  title = 'Mental Health Assistance'
                  content = 'Description or content about Neighborhood Revitalization goes here.'
                  bgColor = '#286AA4'
                  right
                />
              </Grid>

            </Grid>

            

          {/* </ContainerStyled> */}
        </CitiesStrongLayout>
      </ProviderWrapper>
      );
    }

export default Page;


const AccordionStyled = styled(Accordion)(({ theme }) => ({
  position: 'absolute',
  bottom: 0,
  width: '75%',
  maxHeight: '300px', // Max height for the expanded accordion
  boxShadow: 'none', // Optional: remove shadow if needed
  [theme.breakpoints.up('md')]: {
    maxWidth: '50%', // Max width for md breakpoint and up
  },

  '&.Mui-expanded': {
    minHeight: '300px',
  },
  '&:not(.Mui-expanded)': {
    '& .MuiAccordionDetails-root': {
      display: 'none',
    },
  },
  '&::before': {
    display: 'none', // Hide the default MUI accordion expansion line
  },
}));

const AccordionTitle = styled(Typography)({
  textTransform:'capitalize',
  color:'black',
  fontWeight:'bold',
  width:'100%'
});

const ButtonStyled = styled(Button)({
  borderRadius: "0px",
  textTransform:'capitalize',
  borderColor:'black',
  borderWidth:'2px',
  color:'black',
  fontWeight:'bold'
});


const ImageAccordion = ({title, content, bgColor, right}) => {
  return(
    <AccordionStyled 
      square elevation={0} sx={{backgroundColor: bgColor ||'#F1B42D', right: right? 0:""}}
      slotProps={{ transition: { timeout: 400 } }}
      slots={{ transition: Fade}}
    >
      <AccordionSummary aria-controls="panel1a-content" id="panel1a-header"
        expandIcon={<ExpandLess style = {{fontWeight:'bold'}}/>}
      >
        <AccordionTitle variant='h6' textAlign='center' >
          {title}
        </AccordionTitle>
      </AccordionSummary>
      <AccordionDetails>
        <Typography>
          {content}
        </Typography>
      </AccordionDetails>
  </AccordionStyled>
  )
}