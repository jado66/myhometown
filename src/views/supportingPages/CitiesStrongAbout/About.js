import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Container from '@/components/util/Container';
import { Headline, Team } from './components';
import { useTheme } from '@mui/material';
import Stats from './components/Stats';

const CitiesStrongAbout = () => {

  const [viewPortEntered, setViewPortEntered] = useState(false);
  const setViewPortVisibility = (isVisible) => {
      if (viewPortEntered) {
      return;
      }
      setViewPortEntered(isVisible);
  };

  const stats = {
    volunteerHours: 1500,
    numTeachersVolunteers: 75,
    serviceProjects: 20,
  };

  const theme = useTheme()

  return (
    <Box >
      <Container>
        <Headline />
      </Container>
           
      <Container paddingTop={'0 !important'}  >
        <Team />
      </Container>
      
      <Container paddingTop={'0 !important'}  >
        <Stats 
          viewPortEntered={viewPortEntered}
          setViewPortVisibility = {setViewPortVisibility}
          stats = {stats}
        />
      </Container>
      
    </Box>
  );
};

export default CitiesStrongAbout;
