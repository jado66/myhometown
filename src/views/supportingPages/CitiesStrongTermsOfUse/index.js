import React from 'react';
import Box from '@mui/material/Box';
import Container from '@/components/util/Container';
import { Divider, Typography, useTheme } from '@mui/material';

const CitiesStrongTermsOfUse = () => {
  const theme = useTheme();

  return (
    <Box>
      <Container>
        <Typography variant='h2' textAlign='center'>Terms of Use</Typography>
      </Container>
      <Divider sx = {{borderWidth:3, mx: 5, mb:4, borderColor:'black'}}/>

      <Container paddingTop={'0 !important'} p = {5}>
        <Box>
          <h2>1. Introduction</h2>
          <p>Welcome to our application. By using our service, you agree to these terms in full.</p>
          
          <h2>2. Intellectual Property Rights</h2>
          <p>Other than the content you own, under these Terms, we own all the intellectual property rights and materials contained in this website.</p>
          
          <h2>3. Restrictions</h2>
          <p>You are specifically restricted from all of the following:</p>
          <ul>
            <li>publishing any material in any other media;</li>
            <li>selling, sublicensing and/or otherwise commercializing any material;</li>
            <li>publicly performing and/or showing any material;</li>
            <li>using this website in any way that is or may be damaging to this website;</li>
            <li>using this website in any way that impacts user access to this website;</li>
          </ul>

          <h2>4. Governing Law</h2>
          <p>These Terms will be governed by and interpreted in accordance with the laws of the State, and you submit to the non-exclusive jurisdiction of the state and federal courts located in the State for the resolution of any disputes.</p>
        </Box>
      </Container>
    </Box>
  );
};

export default CitiesStrongTermsOfUse;
