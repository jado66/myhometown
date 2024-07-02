import React from 'react';
import { AppBar, Toolbar, Typography, Container, Grid, Card, CardContent, CardMedia, Box } from '@mui/material';

const CitiesStrongMediaPage = () => {
  return (
    <div>
      {/* Header */}
      {/*  */}

      <Container maxWidth="lg" sx={{ marginTop: 4 }}>
        {/* Featured Stories */}
        <Grid item xs={12}>
        <Box
          height={'100%'}
          width={'100%'}
          display={'flex'}
          justifyContent={'center'}
          alignItems={'center'}
        >
          <Box height={'100%'} width={'60%'} maxHeight={600}>
            <Typography
              variant='h3'

              textAlign='center'
              mb = {3}
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
        
        {/* Videos */}
        <Typography variant="h4" component="h2" gutterBottom sx={{ marginTop: 4 }}>
          Videos
        </Typography>
        <Grid container spacing={4}>
          <Grid item xs={12} >
            <Card>
              <CardMedia
                component="iframe"
                height="485"
                src="https://myhometown-bucket.s3.us-west-1.amazonaws.com/videos/Donor+Final+100624.mp4"
                title="Video 1"
              />
            </Card>
          </Grid>
        
        </Grid>

        {/* Images */}
        <Typography variant="h4" component="h2" gutterBottom sx={{ marginTop: 4 }}>
          Images
        </Typography>
        <Grid container spacing={4}>
          <Grid item xs={12} sm={6} md={4}>
            <Card>
              <CardMedia
                component="img"
                height="200"
                image="https://via.placeholder.com/300x200?text=Image+1"
                title="Image 1"
              />
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Card>
              <CardMedia
                component="img"
                height="200"
                image="https://via.placeholder.com/300x200?text=Image+2"
                title="Image 2"
              />
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Card>
              <CardMedia
                component="img"
                height="200"
                image="https://via.placeholder.com/300x200?text=Image+3"
                title="Image 3"
              />
            </Card>
          </Grid>
        </Grid>
      </Container>
    </div>
  );
};

export default CitiesStrongMediaPage;
