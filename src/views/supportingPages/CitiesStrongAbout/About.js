import React from 'react';
import Box from '@mui/material/Box';
import Container from '@/components/util/Container';
import { Headline, Team } from './components';
import { useTheme } from '@mui/material';

const CitiesStrongAbout = () => {

  const theme = useTheme()

  return (
    <Box sx ={{backgroundColor:theme.palette.background.paper}}>
      <Container>
        <Headline />
      </Container>
           
      <Container paddingTop={'0 !important'}  >
        <Team />
      </Container>
    </Box>
  );
};

export default CitiesStrongAbout;
