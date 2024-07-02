import React from 'react';
import Box from '@mui/material/Box';
import Container from '@/components/util/Container';
import { Divider, Typography, useTheme } from '@mui/material';

const CitiesStrongPrivacyPolicy = () => {
  const theme = useTheme();

  return (
    <Box>
      <Container>
        <Typography variant='h2' textAlign='center'>Privacy Policy</Typography>
      </Container>
      <Divider sx = {{borderWidth:3, mx: 5, mb:4, borderColor:'black'}}/>
      
      <Container paddingTop={'0 !important'}  p = {5}>
        <Box>
          <h2>1. Introduction</h2>
          <p>Our privacy policy explains how we collect, use, disclose, and safeguard your information when you visit our website.</p>

          <h2>2. Information We Collect</h2>
          <p>We may collect information about you in a variety of ways. The information we may collect on the Site includes:</p>
          <ul>
            <li>Personal Data: Personally identifiable information, such as your name, shipping address, email address, and telephone number.</li>
            <li>Derivative Data: Information our servers automatically collect when you access the Site, such as your IP address, browser type, and access times.</li>
          </ul>

          <h2>3. Use of Your Information</h2>
          <p>Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Site to:</p>
          <ul>
            <li>Create and manage your account.</li>
            <li>Increase the efficiency and operation of the Site.</li>
            <li>Monitor and analyze usage and trends to improve your experience with the Site.</li>
          </ul>

          <h2>4. Disclosure of Your Information</h2>
          <p>We may share information we have collected about you in certain situations. Your information may be disclosed as follows:</p>
          <ul>
            <li>By Law or to Protect Rights: If we believe the release of information about you is necessary to respond to legal process, to investigate or remedy potential violations of our policies, or to protect the rights, property, and safety of others.</li>
            <li>Third-Party Service Providers: We may share your information with third parties that perform services for us or on our behalf, including payment processing, data analysis, email delivery, hosting services, customer service, and marketing assistance.</li>
          </ul>
        </Box>
      </Container>
    </Box>
  );
};

export default CitiesStrongPrivacyPolicy;
