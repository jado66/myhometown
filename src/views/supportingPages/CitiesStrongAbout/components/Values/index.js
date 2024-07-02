import React from 'react';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { Divider } from '@mui/material';
import { Diversity1, Handshake, VolunteerActivism, WorkspacePremium } from '@mui/icons-material';


const ourValues = [
    {
        title: 'Service',
        content: 'Provide personal, grass-roots service to those in need',
        icon: Diversity1
    },
    {
        title: 'Heart',
        content: 'Motivated exclusively by love for all mankind',
        icon: VolunteerActivism
    },
    {
        title: 'Excellence',
        content: 'Provide and outstanding experience to all we work with',
        icon: WorkspacePremium
    },
    {
        title: 'Transparency',
        content: 'Be intentionally accountable and clear in all we do',
        icon:Handshake,
    }   
]

const Values = () => {
  const theme = useTheme();

  return (
    <Box>
    
        <Divider sx = {{width:"100%",borderWidth:3, mb:4, borderColor:'black'}}/>

        <Box position="relative" zIndex={2}>
           
            <Box marginBottom={2}>
            <Typography
                variant="h2"
                align={'center'}
                sx={{
                fontWeight: 700,
                }}
            >
                Values
               
            </Typography>
            </Box>
            <Box display="flex" flexWrap="wrap" justifyContent="center">
          {ourValues.map((value, index) => (
            <Box 
              key={index} 
              display="flex" 
              flexDirection="column" 
              alignItems="center" 
              m={2} 
              p={2} 
              bgcolor="background.paper" 
              boxShadow={3} 
              maxWidth={300}
            >
              <value.icon color="primary" style={{ fontSize: 50 }} />
              <Typography variant="h5" align="center" gutterBottom>
                {value.title}
              </Typography>
              <Typography align="center">{value.content}</Typography>
            </Box>
          ))}
        </Box>
            {/* <Box display="flex" justifyContent={'center'}>
            <Box
                component={Button}
                variant="contained"
                color="primary"
                size="large"
            >
                Learn more
            </Box>
            </Box> */}
        </Box>
    </Box>
  );
};

export default Values;
