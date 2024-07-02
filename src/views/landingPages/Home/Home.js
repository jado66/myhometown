import React from 'react';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Container from '@/components/util/Container';
import { ImageAccordion } from '@/components/ImageAccordion';
import { Divider, Grid, Typography, Button } from '@mui/material';
import { styled } from '@mui/system';
import { MyHometownHouse } from '@/assets/svg/logos/MyHometownHouse';

const Home = () => {
  const theme = useTheme();
  return (
    <Box>
      <Box bgcolor={theme.palette.alternate.main} position={'relative'}>
        <Container position="relative" zIndex={2}>
          
        <Grid container 
              sx ={{
                mx:'auto',

              }}
              maxWidth='lg'
            >

              <Grid item xs={12} style={{backgroundColor:'grey', height:'250px'}}>
                
              
              </Grid>

              <Grid item xs={6} sx = {{pX:0, mb:4}}>
                <Divider sx = {{borderWidth:3, mx:4, borderColor:'black', mt:5}}/>
              
              </Grid>

              <Grid item xs = {12} md = {12}  sx = {{padding:4, pt:0, display:'flex', flexDirection:'column', mb:2}}>
                <Typography variant = 'h5' sx = {{flexGrow:1}}>
                  The myHometown Initiative is a partnership between a city's government, its residents, local churches, non-profit organizations, and corporations.
                </Typography>
               
              </Grid>

              <Grid item xs={12} sx={{ m:4, mt:0, position:'relative'}}>
                <Grid item xs={12} sx={{backgroundColor:'grey', height:'300px'}}/>
                <ImageAccordion
                  title = 'Community Leadership'
                  content = 'The myHometown initiative helps build community leadership and resilience.'
                  cornerIcon={<MyHometownHouse/>}
                />
              </Grid>
              <Grid item xs={12} sx={{ m:4, mt:0, position:'relative'}}>
                <Grid item xs={12} sx={{backgroundColor:'grey', height:'300px'}}/>
                <ImageAccordion
                  title = 'Camaraderie & Friendship'
                  content = 'Description goes here.'
                  bgColor = '#286AA4'
                  cornerIcon={<MyHometownHouse/>}
                  right
                />
              </Grid>
              <Grid item xs={12} sx={{ m:4, mt:0, position:'relative'}}>
                <Grid item xs={12} sx={{backgroundColor:'grey', height:'300px'}}/>
                <ImageAccordion
                  title = 'Revitalizing Neighborhoods'
                  content = 'Description or content about Neighborhood Revitalization goes here.'
                  bgColor = '#DC5331'
                  cornerIcon={<MyHometownHouse/>}
                />
              </Grid>
              

            </Grid>


            <Grid xs = {12} display='flex' justifyContent='center'>
              <ButtonStyled variant='outlined' sx = {{textTransform:'uppercase', mx:'auto'}}>
                Become a MyHometown Community
              </ButtonStyled>
            </Grid>

        </Container>
      </Box>
      
      
    </Box>
  );
};

export default Home;


const ButtonStyled = styled(Button)({
  borderRadius: '0px',
  textTransform: 'uppercase',
  borderColor: '#188D4E',
  borderWidth: '2px',
  borderRight: 'none',
  // backgroundColor: 'white',
  color: 'black',
  fontWeight: 'bold',
  position: 'relative',
  paddingRight: '20px',
  height: '40px',
  '&::after': {
    content: '""',
    position: 'absolute',
    top: '-2px',
    bottom: '-2px',
    right: '-17px',
    width: '17px',
    backgroundColor: '#188D4E',
    clipPath: `polygon(
      0 0,
      calc(100% - 2px) 50%,
      0 100%,
      0 calc(100% - 2px),
      calc(100% - 4px) 50%,
      0 2px
    )`,
    pointerEvents: 'none'
  }
});