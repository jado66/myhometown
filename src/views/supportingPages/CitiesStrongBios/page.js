// pages/bios.js

import * as React from 'react';
import { Container, Grid, Box, Typography } from '@mui/material';
import { boardOfDirectors, executiveCommittee } from '@/constants/boardOfDirectors';

const bios = [
  { name: 'Jane Doe', bio: 'Lorem ipsum dolor sit amet...', image: '/images/jane.jpg' },
  { name: 'John Smith', bio: 'Consectetur adipiscing elit...', image: '/images/john.jpg' },
  // Add more bios as needed
];

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
            <Grid
                container
                spacing={2}
                alignItems="center"
                sx={{ mb: 4 }}
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
        ))}
        </Grid>
    </Container>
    </Box>
  );
}
