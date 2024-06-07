import React from 'react';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import MyHometownLogo from '@/assets/svg/logos/MyHometown';
import CitiesStrongLogo from '@/assets/svg/logos/CitiesStrong';

const Footer = () => (
  
  <Grid container spacing={2}>
    <Grid item xs={12}>
      <Box
        display={'flex'}
        justifyContent={'space-between'}
        alignItems={'center'}
        width={'100%'}
        flexDirection={{ xs: 'column', sm: 'row' }}
      >
        <Box
          display={'flex'}
          title="myhometown"
          height={24}
          width={35}
        >
          <CitiesStrongLogo />
        </Box>
        <Box display="flex" flexWrap={'wrap'} alignItems={'center'}>
          <Box marginTop={1} marginRight={2}>
            <Link
              underline="none"
              component="a"
              href="/"
              color="textPrimary"
              variant={'subtitle2'}
            >
              Home
            </Link>
          </Box>
          <Box  marginTop={1} marginRight={2}>
            <Button
              variant="outlined"
              component="a"
              // href="/admin-dashboard"
              
            >
              Admin Login
            </Button>
          </Box>
        </Box>
      </Box>
    </Grid>
    <Grid item xs={12}>
      <Typography
        align={'center'}
        variant={'subtitle2'}
        color="textSecondary"
        gutterBottom
      >
        Copyright © 2023 Cities Strong
      </Typography>
      
    </Grid>
  </Grid>
);

export default Footer;
