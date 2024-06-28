/* eslint-disable react/no-unescaped-entities */
import React, { useEffect, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import RocketIllustration from '@/assets/svg/illustrations/Rocket';
import Globe from '@/assets/svg/illustrations/Globe';
import { Card, CardContent, CardActions, Alert } from '@mui/material';
import { RevisitCommunity } from '../RevisitCommunity';

const Hero = () => {
  const theme = useTheme();
  const isMd = useMediaQuery(theme.breakpoints.up('md'), {
    defaultMatches: true,
  });

  return (
    <Grid container spacing={4}>
     
      <RevisitCommunity/>

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
              Building communities together
            </Typography>
            <Box>
              <Typography
                variant='h6'
                textAlign='center'
                mb = {3}
              >
                The myHometown Initiative is a partnership between a city&apos;s government, its residents, local churches, non-profit organizations, and corporations.
              </Typography>
            </Box>
          </Box>
        </Box>
      </Grid>
    </Grid>
  );
};

export default Hero;

