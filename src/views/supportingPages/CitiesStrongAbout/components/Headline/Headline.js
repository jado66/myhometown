import React from 'react';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

const Headline = () => {
  const theme = useTheme();

  return (
    <Box paddingBottom={0}>
      <Box position="relative" zIndex={2}>
        <Typography
          sx={{
            textTransform: 'uppercase',
            fontWeight: 'medium',
          }}
          gutterBottom
          // color={'textSecondary'}
          align={'center'}
        >
          About us
        </Typography>
        <Box marginBottom={2}>
          <Typography
            variant="h2"
            align={'center'}
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
        <Box marginBottom={4}>
          <Typography variant="h6" align={'center'} sx = {{maxWidth:'700px', mx:'auto'}} >
          Cities Strong Foundation is directed by a dedicated group of business, church and education leaders. Cities Strong Foundation is passionate about making our communities special places to live.

          </Typography>
        </Box>
        {/* <Box display="flex" justifyContent={'center'}>
          <Box
            component={Button}
            variant="contained"
            color="primary"
            size="large"
          >
            Learn more
          </Box>
        </Box> */}
      </Box>
    </Box>
  );
};

export default Headline;
