import React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Container from '@/components/util/Container';
import CloudHostingIllustration from '@/assets/svg/illustrations/CloudHosting';

const MaintenanceMode = () => {
  return (
    <Box
      minHeight={'calc(100vh - 64px - 183px)'}
      height={'100%'}
      display={'flex'}
      alignItems={'center'}
    >
      <Container>
        <Grid container spacing={4}>
          <Grid item container justifyContent={'center'} xs={12}>
            <Box height={'100%'} width={'100%'} maxWidth={500}>
              <CloudHostingIllustration width={'100%'} height={'100%'} />
            </Box>
          </Grid>
          <Grid
            item
            container
            alignItems={'center'}
            justifyContent={'center'}
            xs={12}
          >
            <Box>
              <Typography
                variant="h4"
                component={'h4'}
                align={'center'}
                gutterBottom
                sx={{ fontWeight: 700 }}
              >
                This page is in maintenance mode
              </Typography>
              <Typography component="p" color="textSecondary" align={'center'}>
                We are working hard to deliver great new features.
              </Typography>
             
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default MaintenanceMode;
