import React from 'react';
import Grid from '@mui/material/Grid';
import { Box, Divider, Typography } from '@mui/material';
import Link from 'next/link';
import { Instagram, LinkedIn, YouTube } from '@mui/icons-material';
import Twitter from '@mui/icons-material/Twitter';
import { styled } from '@mui/system';
import CitiesStrongShieldIcon from '@/assets/svg/logos/CitiesStrongShieldIcon';

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
        <FooterLink href="/pressroom"><Typography sx={{ textTransform: 'uppercase', textDecoration:'none' }}>Pressroom</Typography></FooterLink>
        <FooterLink href="/newsletter" ><Typography sx={{ textTransform: 'uppercase' }}>Newsletter</Typography></FooterLink>
        <FooterLink href="/contact" ><Typography sx={{ textTransform: 'uppercase' }}>Contact</Typography></FooterLink>
        <FooterLink href="/careers" ><Typography sx={{ textTransform: 'uppercase' }}>Careers</Typography></FooterLink>
        <FooterLink href="/donate" ><Typography sx={{ textTransform: 'uppercase' }}>Donate</Typography></FooterLink>
        <FooterLink href="/terms-of-use" ><Typography sx={{ textTransform: 'uppercase' }}>Terms Of Use</Typography></FooterLink>
        <FooterLink href="/privacy-policy" ><Typography sx={{ textTransform: 'uppercase' }}>Privacy Policy</Typography></FooterLink>
        <Divider sx={{ borderWidth: 3, borderColor: 'black', my: 2 }} />
      </Grid>
      <Grid
        item
        xs={4}
        sx={{
          pX: 0,
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <Divider sx={{ borderWidth: 3, borderColor: 'black', mb: 2 }} />
        <Grid display='flex' flexDirection='row'>
          <FooterLink href="https://www.linkedin.com/" >
            <Typography sx={{ textTransform: 'uppercase', mr: 1 }}><LinkedIn /></Typography>
          </FooterLink>
          <FooterLink href="https://www.instagram.com/" >
            <Typography sx={{ textTransform: 'uppercase', mx: 1 }}><Instagram /></Typography>
          </FooterLink>
          <FooterLink href="https://www.twitter.com/" >
            <Typography sx={{ textTransform: 'uppercase', mx: 1 }}><Twitter /></Typography>
          </FooterLink>
          <FooterLink href="https://www.youtube.com/" >
            <Typography sx={{ textTransform: 'uppercase', ml: 1 }}><YouTube /></Typography>
          </FooterLink>
        </Grid>
        <Grid sx={{ flex: 1 }} />
        <Divider sx={{ borderWidth: 3, borderColor: 'black', my: 2 }} />
      </Grid>
    </Grid>
    <Grid container spacing={2} mt={.5} mb={5} px={4}>
      <Typography variant='h3' sx={{ textTransform: 'uppercase', width: '100%', fontWeight:'bold' }} textAlign='center'>
        <Box component="span" sx={{ color: '#2D903C', mr:2 }}>
          Cities Strong
        </Box>  
        Foundation
        <CitiesStrongShieldIcon sx = {{ml:1}}/>
      </Typography>
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