import React from 'react';
import { alpha, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Grid from '@mui/material/Grid';

const Highlights = () => {
  const theme = useTheme();
  return (
    <Box>
      <Grid container spacing={8}>
        {[
          {
            title: 'Community Leadership',
            subtitle:
              'MyHometown initiative helps build community leadership and resilience.',
            color: 'orange'
          },
          {
            title: 'Revitalizing Neighborhoods',
            subtitle:
              'We bring new life and energy to city neighborhoods by improving housing, offering opportunities for families.',
            color: 'red'
          },
          {
            title: 'Camaraderie & Friendship',
            subtitle:
              'The MyHometown Initiative builds camaraderie and strengthens friendships within a city’s neighborhoods.',
            color: 'blue'
          },
        ].map((item, i) => (
          <Grid item xs={12} md={4} key={i}>
            <Box width={1} height={'100%'} data-aos={'fade-up'}>
              <Box
                display={'flex'}
                flexDirection={'column'}
                alignItems={'center'}
                sx = {{
                  border:`2px solid ${item.color}`,
                  color: 'white',
                  minHeight:'180px'
                }}
              >
                
                <Typography
                  variant={'h6'}
                  gutterBottom
                  sx={{ 
                    fontWeight: 500,
                    backgroundColor: item.color
                  }}
                  align={'center'}
                  width='100%'
                >
                  {item.title}
                </Typography>
                <Typography align={'center'} color="textSecondary"
                  sx = {{p:2}}
                >
                  {item.subtitle}
                </Typography>
              </Box>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Highlights;
