import React from 'react';
import Grid from '@mui/material/Grid';
import { Box, Divider, Typography } from '@mui/material';
import Link from 'next/link';
import { Instagram, LinkedIn, YouTube } from '@mui/icons-material';
import Twitter from '@mui/icons-material/Twitter';
import { styled } from '@mui/system';
import CitiesStrongShieldIcon from '@/assets/svg/logos/CitiesStrongShieldIcon';
import CitiesStrongHorizontalLogo from '@/assets/svg/logos/CitiesStrongHorizontalLogo';

const Footer = () => (
  <Grid xs={12}>
    <Grid container spacing={2} mt={3} px={4}>
      <Grid item
        xs={4}
        sx={{
          pX: 0,
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <Divider sx={{ borderWidth: 3, borderColor: 'black', mb: 2 }} />
        <Typography variant='h6' sx={{ textTransform: 'uppercase' }} textAlign='center'>
          Strength through service
        </Typography>
        <Grid sx={{ flex: 1 }} />
        <Divider sx={{ borderWidth: 3, borderColor: 'black', my: 2 }} />
      </Grid>
      <Grid item xs={4} sx={{ pX: 0 }} display='flex' flexDirection='column'>
        <Divider sx={{ borderWidth: 3, borderColor: 'black', mb: 2 }} />
        <FooterLink href="/about"><Typography sx={{ textTransform: 'uppercase', textDecoration:'none' }}>About</Typography></FooterLink>
        <FooterLink href="/media" ><Typography sx={{ textTransform: 'uppercase' }}>Media</Typography></FooterLink>
        <FooterLink href="/contact" ><Typography sx={{ textTransform: 'uppercase' }}>Contact</Typography></FooterLink>
        {/* <FooterLink href="/careers" ><Typography sx={{ textTransform: 'uppercase' }}>Careers</Typography></FooterLink> */}
      
        <Divider sx={{ borderWidth: 3, borderColor: 'black', my: 2, mt:'auto' }} />
      </Grid>
      <Grid item xs={4} sx={{ pX: 0 }} display='flex' flexDirection='column'>
        <Divider sx={{ borderWidth: 3, borderColor: 'black', mb: 2 }} />
       
        {/* <FooterLink href="/careers" ><Typography sx={{ textTransform: 'uppercase' }}>Careers</Typography></FooterLink> */}
        <FooterLink href="/donate" ><Typography sx={{ textTransform: 'uppercase' }}>Donate</Typography></FooterLink>
        <FooterLink href="/terms-of-use" ><Typography sx={{ textTransform: 'uppercase' }}>Terms Of Use</Typography></FooterLink>
        <FooterLink href="/privacy-policy" ><Typography sx={{ textTransform: 'uppercase' }}>Privacy Policy</Typography></FooterLink>
        <Divider sx={{ borderWidth: 3, borderColor: 'black', my: 2, mt:'auto' }} />
      </Grid>
    </Grid>
    <Grid container spacing={2} mt={.5} mb={5} px={4}>
      <CitiesStrongHorizontalLogo/>
    </Grid>
    <Checkerboard />
  </Grid>
);

export default Footer;

const FooterLink = styled(Link)({
  textTransform: 'uppercase',
  color: 'black',
  textDecoration: 'none'
});


const Checkerboard = () => {
  const rows = 5;
  const cols = 6;
  
  return (
      <Grid container sx={{ height: '200px' }}>
          {[...Array(rows * cols)].map((_, i) => (
              <Grid 
                  item 
                  xs={2} 
                  key={i} 
                  sx={{ 
                      height: '40px', 
                      backgroundColor: (i + Math.floor(i / cols)) % 2 === 0 ? 'green' : 'darkgreen' 
                  }}
              />
          ))}
      </Grid>
  );
};