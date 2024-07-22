import React from 'react';
import { AppBar, Toolbar, Typography, Container, Grid, Card, CardContent, CardMedia, Box, Divider } from '@mui/material';
import MyHometownLogo from '@/assets/svg/logos/MyHometown';

const CitiesStrongMediaPage = () => {
  return (

      <Container maxWidth="xl" sx={{ marginTop: 4, mx: 'auto' }}>
        {/* Featured Stories */}
        <Grid item xs={12} display = 'flex' justifyContent = 'center'>
        <Box
          height={'100%'}
          width={'100%'}
          display={'flex'}
          justifyContent={'center'}
          alignItems={'center'}

          
        >
          <Box height={'100%'} width={'100%'} mx = "auto" maxHeight={600}>
            <Typography
              variant="h2"
              sx={{
                fontWeight: 700,
              }}
              
              textAlign='center'
            >
                Who is Cities Strong?
            </Typography>
            <Box>
              <Typography
                variant='h6'
                textAlign='center'
                mb = {3}
              >
                See below to find out, who we are, what we do, and how we do it
              </Typography>
            </Box>
          </Box>
        </Box>
      </Grid>
        
        
        <Grid container spacing={4}>
          <Grid item xs={12} >
            <Card >
              <CardMedia
                component="iframe"
                sx = {{
                  boxShadow: '0px 2px 8px 0px rgba(0, 0, 0, 0.5)',
                  height:{md:"485px", xs:'230px'}
                }}
                
                src="https://myhometown-bucket.s3.us-west-1.amazonaws.com/videos/Donor+Final+100624.mp4"
                title="Video 1"
              />
            </Card>
          </Grid>
        
        </Grid>
 
        <Divider sx = {{borderWidth:3,  borderColor:'black', mt:4}}/>

        <Typography variant="h4" component="h5" gutterBottom sx={{ marginTop: 4, mb:3, textAlign:'center' }}>
          What city leaders are saying about <br/> <MyHometownLogo type = 'full'/>
        </Typography>
        <Grid container spacing={4}>
          
          <Grid item xs={12} display = 'flex' justifyContent = 'center' flexDirection='column'>
            <Typography variant= 'h5' textAlign='center'>
            Salt Lake City
            </Typography>
            <iframe src="https://drive.google.com/file/d/1mVhOwAvNOtJlmCAimxGkeJE6FBh6k5JN/preview" width="100%" height="480" allow="autoplay"></iframe>
          </Grid>
          <Grid item xs={12} display = 'flex' justifyContent = 'center' flexDirection='column'>
            <Typography variant= 'h5' textAlign='center'>
              Provo
            </Typography>
            <iframe src="https://drive.google.com/file/d/18rjyp7DkBpJuuDPCxPZ5Iljphy8YBuBW/preview" width="100%" height="480" allow="autoplay"></iframe>
          </Grid>
          <Grid item xs={12} display = 'flex' justifyContent = 'center' flexDirection='column'>
            <Typography variant= 'h5' textAlign='center'>
              West Valley City
            </Typography>
            <iframe src="https://drive.google.com/file/d/1UIjnSOzEqF-tBVrvIFYH6StHoSSEWS7H/preview" width="100%" height="480" allow="autoplay"></iframe>
          </Grid>
        </Grid>
      </Container>
  );
};

export default CitiesStrongMediaPage;
