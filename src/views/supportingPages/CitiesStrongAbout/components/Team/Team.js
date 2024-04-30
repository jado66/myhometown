'use client'

import React, { useEffect, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import ListItemText from '@mui/material/ListItemText';
import Avatar from '@mui/material/Avatar';


import { boardOfDirectors } from '@/constants/boardOfDirectors';
import { Divider } from '@mui/material';



const Team = () => {
  const theme = useTheme();

  const [teamData, setTeamData] = useState([]);

  useEffect(() => {
    setTeamData(boardOfDirectors);
  }
  , []);

  return (
    <Box>
            <Divider sx = {{width:"100%", mb:4}} my = {3} />

      <Box marginBottom={4}>
        <Typography
          sx={{
            textTransform: 'uppercase',
            fontWeight: 'medium',
          }}
          gutterBottom
          align={'center'}
        >
          Our team
        </Typography>
        <Box
          component={Typography}
          fontWeight={700}
          variant={'h3'}
          align={'center'}
        >
          Board Of Directors
        </Box>
      </Box>

    
      <Grid container spacing={2} justifyContent='space-around'>
        {teamData.map((item, i) => (
          <Grid item xs={12} sm={6} md={2} key={i}>
            <Box
              component={Card}
              borderRadius={3}
              boxShadow={2}
              sx={{
                backgroundColor: theme.palette.background.level2,
                textDecoration: 'none',
                transition: 'all .2s ease-in-out',
                '&:hover': {
                  transform: `translateY(-${theme.spacing(1 / 2)})`,
                },
              }}
            >
              <CardContent>
                <Box
                  component={Avatar}
                  src={item.avatar}
                  height={220}
                  width={150}
                  variant="square"
                  sx = {{mx:'auto', borderRadius:1.5}}
                />
                <Box marginTop={4}>
                  <ListItemText
                    primaryTypographyProps={{ textAlign:'center' }}
                    secondaryTypographyProps={{ color:"black", textAlign:'center'}}
                    primary={item.name}
                    secondary={item.position}
                  />
                </Box>
              </CardContent>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Team;
