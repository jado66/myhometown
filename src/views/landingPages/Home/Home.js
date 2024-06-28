import React from 'react';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import { DemoPages, Features, Footer, Hero, Highlights } from './components';
import Container from '@/components/util/Container';

const Home = () => {
  const theme = useTheme();
  return (
    <Box>
      <Box bgcolor={theme.palette.alternate.main} position={'relative'}>
        <Container position="relative" zIndex={2}>
          <Box marginTop={{ xs: -4, sm: -6 }}>
            <Hero />
            <Box marginTop={2}>
              <Highlights />
            </Box>
            <Box marginTop={4}>
              <Box>
                Become a myHometown Community
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>
      
      
    </Box>
  );
};

export default Home;


