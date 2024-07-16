import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Container from '@/components/util/Container';
import { Headline, Team } from './components';
import { useTheme } from '@mui/material';
import Stats from './components/Stats';
import Values from './components/Values';

const CitiesStrongAbout = () => {

  const [viewPortEntered, setViewPortEntered] = useState(false);
  const setViewPortVisibility = (isVisible) => {
      if (viewPortEntered) {
      return;
      }
      setViewPortEntered(isVisible);
  };

  const stats = {
    volunteerHours: 1837,
    numTeachersVolunteers: 92,
    serviceProjects: 27,
  };

  const theme = useTheme()

  return (
    <Box sx = {{mx:'auto'}}>
      <Container>
        <Headline />
      </Container>

      <Container paddingTop={'0 !important'} >
        <Values />
      </Container>
           
      <Container paddingTop={'0 !important'}  >
        <Team />
      </Container>
      
      <Container paddingTop={'0 !important'} paddingBottom ={'0 !important'}  >
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
