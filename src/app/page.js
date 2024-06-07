'use client';

import React from 'react';
import { Typography, Card, CardActionArea, Grid } from '@mui/material';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  const handleCardClick = (path) => {
    router.push(path);
  };

  return (
    <div style={{ padding: '2rem' }}>
      <Typography variant="h3" component="h1"  textAlign='center' gutterBottom sx = {{mt:10}}>
        Welcome to The Development Environment
      </Typography>
      <Typography variant="h5" gutterBottom textAlign='center'>
        Which site would you like to enter?
      </Typography>

      <Grid container sx = {{mt:8}}>
        <Grid item xs = {12} md = {8} display = 'flex' spacing={4} container sx = {{mx:'auto'}}> 
            <Grid item xs={12} md={6}>
                <Card sx = {{minHeight:'400px', border:'1px solid #ff4d06'}} display = 'flex' >
                    <CardActionArea onClick={() => handleCardClick('/mht')} sx = {{minHeight:'400px'}} >
                        <Typography variant="h3" component="div" textAlign='center' color = '#ff4d06'>
                            MyHometown
                        </Typography>
                    </CardActionArea>
                </Card>
            </Grid>
            <Grid item xs={12} md={6}>
                <Card  display = 'flex' >
                    <CardActionArea onClick={() => handleCardClick('/cs')} sx = {{minHeight:'400px', backgroundColor:'#ECE5F0'}} alignItems = 'center'>
                        <Typography variant="h3" component="div" textAlign='center'>
                            Cities Strong
                        </Typography>
                    </CardActionArea>
                </Card>
            </Grid>
        </Grid>
      </Grid>
    </div>
  );
}
