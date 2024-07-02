import React from 'react';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import MyHometownLogo from '@/assets/svg/logos/MyHometown';

const Footer = () => {

  const rootUrl = process.env.NEXT_PUBLIC_ENVIRONMENT === 'dev'? '/mht':''

  return (
    <Grid container spacing={2} display='flex' alignItems='center'>
     
      <Grid item xs={4}>
        
        <MyHometownLogo height={'100%'} width={'100%'} type = 'full'/>
        
      </Grid>
      <Grid item xs={4}>
        <Typography
          align={'center'}
          variant={'subtitle2'}
          color="textSecondary"
        >
          © Copyright MyHometown Utah 2024
        </Typography>
        
      </Grid>
      <Grid item xs={4}
        display='flex'
        justifyContent='flex-end'
      >
        <Button
          variant="outlined"
          component="a"
          sx = {{textTransform:'uppercase', borderRadius:5}}
          href={rootUrl+"/admin-dashboard"}
          
        >
          Admin Login
        </Button>
      </Grid>
    </Grid>
  )
};

export default Footer;
