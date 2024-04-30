'use client'
import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import CountUp from 'react-countup';
import VisibilitySensor from 'react-visibility-sensor';

const Numbers = () => {
  
  const [viewPortEntered, setViewPortEntered] = useState(false);
  const setViewPortVisibility = (isVisible) => {
    if (viewPortEntered) {
      return;
    }

    setViewPortEntered(isVisible);
  };
  return (
    <Box>
      <Grid container spacing={2}>
        {[
          {
            title: '1500',
            subtitle: '1,500 service volunteers.',
            suffix: '',
          },
          {
            title: '52',
            subtitle: '52,000 collective volunteer hours.',
            suffix: 'k',
          },
          {
            title: '556',
            subtitle: '556 families served this year.',
            suffix: '',
          },
        ].map((item, i) => (
          <Grid key={i} item xs={12} md={4}>
            <Typography
              variant="h3"
              align={'center'}
              gutterBottom
              sx={{
                fontWeight: 'medium',
              }}
            >
              <VisibilitySensor
                onChange={(isVisible) => setViewPortVisibility(isVisible)}
                delayedCall
                >
                <CountUp
                  redraw={false}
                  end={viewPortEntered ? item.title : 0}
                  start={0}
                  suffix={item.suffix}
                />
              </VisibilitySensor>
            </Typography>
           
            <Typography color="text.secondary" align={'center'} component="p">
              {item.subtitle}
            </Typography>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Numbers;
