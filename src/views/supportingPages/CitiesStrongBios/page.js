// pages/bios.js

import * as React from 'react';
import { Container, Grid, Box, Typography, Divider } from '@mui/material';
import { boardOfDirectors, executiveCommittee } from '@/constants/boardOfDirectors';

export default function CitiesStrongBiosPage() {

    React.useEffect(() => {
        const urlHash = window.location.hash;
            if (urlHash) {
            const element = document.querySelector(urlHash);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }, []);

        
  return (
    <Box>
      <Container px = {{md:5,xs:0}}>
        <Grid container>
        <Box marginBottom={2}>
          <Typography
            variant="h2"
            sx={{
              fontWeight: 700,
              textAlign:'center',
              mt:4
            }}
          >
            Bios
          </Typography>
        </Box>
    
        {[...executiveCommittee,...boardOfDirectors].map((person, index) => (
          <>
            <Grid
              container
              spacing={2}
              alignItems="start"
              key={index}
              id={`bio-${person.name.replace(/\s+/g, '-').toLowerCase()}`} // Adding the id here
              direction={index % 2 === 0 ? 'row' : 'row-reverse'}
            >
              <Grid item xs={12} md={4}>
                  <Box
                      component="img"
                      src={person.avatar}
                      alt={`Picture of ${person.name}`}
                      sx={{
                          width: '100%',
                          height: 'auto',
                          borderRadius: '8px',
                      }}
                  />
              </Grid>
              <Grid item xs={12} md={8}>
                  <Typography variant="h5" gutterBottom>
                      {person.name}
                  </Typography>
                  <Typography variant="body1">{person.bio}</Typography>
              </Grid>
            </Grid>
            <Grid item xs = {12}>
            <Divider sx = {{my:3}}/>

            </Grid>
          </>
        ))}
        </Grid>
    </Container>
    </Box>
  );
}
