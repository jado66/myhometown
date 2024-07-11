/* eslint-disable react/no-unescaped-entities */
import React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import { Divider } from '@mui/material';

const Map = ({ themeMode = 'light' }) => {
  return (
    <>
      <Typography
        sx={{
          textTransform: 'uppercase',
          fontWeight: 'medium',
        }}
        gutterBottom
      >
        Contact us
      </Typography>
      <Box marginBottom={2}>
        <Typography
          variant="h2"
          sx={{
            fontWeight: 700,
          }}
        >
          Get in touch
        </Typography>
      </Box>
      <Box marginBottom={2}>
        <Typography variant="h6">
          We'd love to talk about how we can help you.
        </Typography>
      </Box>
      
      <Grid container spacing={4}>
        <Grid item xs={12} md={7}>
          <Box
            component={'iframe'}
            borderRadius={2}
            minHeight={400}
            width="100%"
            frameBorder="0"
            title="map"
            marginHeight="0"
            marginWidth="0"
            scrolling="no"
            src="https://maps.google.com/maps?width=100%&height=100%&hl=en&q=SaltLakeCity&ie=UTF8&t=&z=14&iwloc=B&output=embed"
            sx={{
              filter: themeMode === 'dark' ? 'grayscale(0.5) opacity(0.7)' : 'none',
              boxShadow: '0px 2px 8px 0px rgba(0, 0, 0, 0.5)'
            }}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <Grid container spacing={2}>
            <Grid item xs={12} sx = {{ml:1, mt: 3}}>
              <Typography
                variant={'body1'}
                gutterBottom
                sx={{ 
                  fontWeight: 'medium',
                  borderRadius: "0px",
                  textTransform:'capitalize',
                  color:'black',
                  fontWeight:'bold'
                 }}
              >
                Call us:
              </Typography>
              <Typography variant={'subtitle1'}>
                <a href="tel:+18011234567" style={{textDecoration:'none', color:'black'}}>+1.801.123.4567</a>
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Divider sx = {{borderWidth:2, borderColor:'black'}}/>
            </Grid>
            <Grid item xs={12}  sx = {{ml:1}}>
              <Typography
                variant={'body1'}
                gutterBottom
                sx={{ 
                  fontWeight: 'medium',
                  borderRadius: "0px",
                  textTransform:'capitalize',
                  borderColor:'black',
                  borderWidth:'2px',
                  color:'black',
                  fontWeight:'bold'
                 }}
              >
                Email us:
              </Typography>
              <Typography variant={'subtitle1'}>
                <a href="mailto:Contact@CitiesStrong.com" style={{textDecoration:'none', color:'black'}}>
                  Contact@CitiesStrong.com
                </a>
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Divider sx = {{borderWidth:2, borderColor:'black'}}/>
            </Grid>
            <Grid item xs={12}  sx = {{ml:1}}>
              <Typography
                variant={'body1'}
                gutterBottom
                sx={{ 
                  fontWeight: 'medium',
                  borderRadius: "0px",
                  textTransform:'capitalize',
                  borderColor:'black',
                  borderWidth:'2px',
                  color:'black',
                  fontWeight:'bold'
                 }}

              >
                Address:
              </Typography>
              <Typography variant="subtitle1">
                <a 
                  href="https://www.google.com/maps/search/?api=1&query=50+E+North+Temple+St,+Salt+Lake+City,+UT+84150" 
                  target="_blank" rel="noopener noreferrer"
                  style={{textDecoration:'none', color:'black'}}
                >
                  50 E North Temple St, Salt Lake City, UT 84150
                </a>
              </Typography>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};

Map.propTypes = {
  themeMode: PropTypes.string.isRequired,
};

export default Map;
