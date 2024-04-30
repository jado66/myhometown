/* eslint-disable react/no-unescaped-entities */
import React from 'react';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import RocketIllustration from '@/assets/svg/illustrations/Rocket';
import Globe from '@/assets/svg/illustrations/Globe';

const Hero = () => {
  const theme = useTheme();
  const isMd = useMediaQuery(theme.breakpoints.up('md'), {
    defaultMatches: true,
  });

  return (
    <Grid container spacing={4}>
      <Grid item container alignItems={'center'} xs={12} md={8}>
        <Box data-aos={isMd ? 'fade-right' : 'fade-up'}>
          <Box marginBottom={2}  sx = {{marginTop:-4}}>
            <Typography
              variant="h2"
              color="textPrimary"
              sx={{
                fontWeight: 700,
              }}
            >
              My Hometown
            </Typography>
          </Box>
          <Box marginBottom={2}>
            <Typography
              variant="h3"
              color="textPrimary"
              sx={{
                fontWeight: 700,
              }}
            >
              Building communities{' '}
              <Typography
                color={'primary'}
                component={'span'}
                variant={'inherit'}
              >
                together.
              </Typography>
            </Typography>
          </Box>
          <Box marginBottom={3}>
            <Typography
              variant="h6"
              component="p"
              color="textSecondary"
              sx={{ fontWeight: 400 }}
            >
              The MyHometown Initiative is a partnership between a city&apos;s government, its residents,
local churches, non-profit organizations, and corporations.
            </Typography>
          </Box>
          
        </Box>
      </Grid>
      <Grid item xs={12} md={4}>
        <Box
          height={'100%'}
          width={'100%'}
          display={'flex'}
          justifyContent={'center'}
          alignItems={'center'}
        >
          <Box height={'100%'} width={'100%'} maxHeight={600}>
            <Globe width={'100%'} height={'100%'} />
          </Box>
        </Box>
      </Grid>
    </Grid>
  );
};

export default Hero;
