import * as React from 'react';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import { Divider } from '@mui/material';

// My Hometown Initiative Utah
// https://myhometownut.com/
 
// Our Hometown Communities Foundation
// http://our-hometown.org/
 
// My Hometown West Valley City
// https://www.wvc-ut.gov/1789/My-Hometown-Initiative
 
// My Hometown Provo
// https://www.facebook.com/myhometownprovo/
 
// https://www.provo.org/community/my-hometown-initiative
 
// My Hometown Ogden
// https://www.youtube.com/watch?v=lgCRObBrT4g
// https://myhometownogdencrc.wixsite.com/myhometownogden-1
// https://www.facebook.com/MyHometownOgden/
 
// My Hometown is Salt Lake City
// https://myhometownslc.org/about-us/
 
 

export default function Home() {
  return (
    <main>
      <Grid container spacing={2} px={10} pt={5}>
       
        <Grid item xs={12}>
          <Box display="flex" justifyContent="center">
            <Typography variant="h3" component="h1" gutterBottom >
              MyHometown - OurHometown
            </Typography>
          </Box>
        </Grid>

        <Divider style={{width:'100%'}} />
        
        <Grid item xs={6}>
          <Typography variant="h4" component="h1" gutterBottom textAlign='center'>
            Current Sites
          </Typography>
          
          <Link
            href={'https://www.our-hometown.org/'}
            rel="noopener noreferrer"
            underline="hover"
            color="inherit"
            sx={{ display: 'block', marginBottom: 2 }}
            target="_blank"
          >
            <Typography variant="h5" component="h2">
              OurHometown →
            </Typography>
          </Link>

          <Link
            href={'https://myhometownut.com/'}
            rel="noopener noreferrer"
            underline="hover"
            color="inherit"
            sx={{ display: 'block', marginBottom: 2}}
            target="_blank"
          >
            <Typography variant="h5" component="h2">
              MyHometown Utah →
            </Typography>
          </Link>

          <Divider style={{width:'40%'}} />

          <Link
            href={'https://www.wvc-ut.gov/1789/My-Hometown-Initiative'}
            rel="noopener noreferrer"
            underline="hover"
            color="inherit"
            target="_blank"
            sx={{ display: 'block', marginBottom: 2, marginTop: 2 }}
          >
            <Typography variant="h5" component="h2">
              MyHometown West Valley City →
            </Typography>
          </Link>

          <Link
            href={'https://www.facebook.com/myhometownprovo/'}
            rel="noopener noreferrer"
            underline="hover"
            color="inherit"
            target="_blank"
            sx={{ display: 'block', marginBottom: 2 }}
          >
            <Typography variant="h5" component="h2">
              MyHometown Provo →
            </Typography>
          </Link>

          <Link
            href={'https://www.facebook.com/MyHometownOgden/'}
            rel="noopener noreferrer"
            underline="hover"
            color="inherit"
            sx={{ display: 'block', marginBottom: 2 }}
            target="_blank"
          >
            <Typography variant="h5" component="h2">
              MyHometown Ogden →
            </Typography>

          </Link>

          <Link
            href={'https://myhometownslc.org/about-us/'}
            rel="noopener noreferrer"
            underline="hover"
            color="inherit"
            sx={{ display: 'block', marginBottom: 2 }}
            target="_blank"
          >
            <Typography variant="h5" component="h2">
              MyHometown Salt Lake City →
            </Typography>
          </Link>




        
        </Grid>

        <Grid item xs={6} >
          <Typography variant="h4" component="h1" gutterBottom textAlign='center'>
            API Demos
          </Typography>
          
          <Link
            href={'/api/givebutter'}
            target="_blank"
            rel="noopener noreferrer"
            underline="hover"
            color="inherit"
            sx={{ display: 'block', marginBottom: 2 }}
          >
            <Typography variant="h5" component="h2">
              GiveButter Demo →
            </Typography>
            <Typography>
              Click here to see the GiveButter API in action
            </Typography>
          </Link>

          <Link
            href={'/api/airtable'}
            target="_blank"
            rel="noopener noreferrer"
            underline="hover"
            color="inherit"
            sx={{ display: 'block', marginBottom: 2 }}
          >
            <Typography variant="h5" component="h2">
              Airtable Demo →
            </Typography>
            <Typography>
              Click here to see the Airtable API in action
            </Typography>
          </Link>
          
        </Grid>
      </Grid>
    </main>
  );
}