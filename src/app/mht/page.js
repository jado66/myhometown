'use client'
import React from 'react';
import { useTheme, List, ListItem, Typography, Container, Button, Grid, Box, Card, CardContent, Divider } from '@mui/material';

import { styled } from '@mui/system';
import { Circle } from '@mui/icons-material';
import ProviderWrapper from '@/contexts/ProviderWrapper';
import { CitiesStrongLayout } from '@/layout';

const ContainerStyled = styled(Container)({
    flexGrow: 1,
    padding: "2em",
    backgroundColor: "#fafafa", 
    height: "100%",
    minHeight: "100vh",
});

const CardStyled = styled(Card)({
    boxShadow: "0px 5px 15px rgba(0,0,0,0.1)",
    borderRadius: "10px"
});

const Page = () => {

    const theme = useTheme()

    return (
      <ProviderWrapper theme = 'alt'>
        <CitiesStrongLayout>
          <ContainerStyled >
            <Typography variant="h3" sx = {{my:3}} align='center'>
              Welcome to Cities Strong
            </Typography>
            


              <Divider sx = {{my:3}} />
              <Typography variant="h6" sx = {{my:3}} align='center'>
              Our 4 Pillars
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <CardStyled>
                  <CardContent>
                    <Typography variant="h5" gutterBottom  align='center'>
                      Support for MyHometown Community Resource Centers and Days of Service
                    </Typography>
                    <Typography variant="body1">
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero.
                    </Typography>
                  </CardContent>
                </CardStyled>
              </Grid>
              <Grid item xs={12} md={6}>
                <CardStyled>
                  <CardContent>
                    <Typography variant="h5" gutterBottom align='center'>
                      Support proactive mental health programs for youth and adults
                    </Typography>
                    <Typography variant="body1">
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero.
                    </Typography>
                  </CardContent>
                </CardStyled>
              </Grid>
              {/* Repeat the above pattern for the remaining two pillars */}
              <Grid item xs={12} md={6}>
                <CardStyled>
                  <CardContent>
                    <Typography variant="h5" gutterBottom align='center'>
                      Support legal immigration assistance
                    </Typography>
                    <Typography variant="body1">
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero.
                    </Typography>
                  </CardContent>
                </CardStyled>
              </Grid>
              <Grid item xs={12} md={6}>
                <CardStyled>
                  <CardContent>
                    <Typography variant="h5" gutterBottom align='center'>
                      Support Public Education
                    </Typography>
                    <Typography variant="body1">
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero.
                    </Typography>
                  </CardContent>
                </CardStyled>
              </Grid>
            </Grid>

            <Divider sx = {{my:3}} />

            <Typography variant="body1" paragraph>
              Why donate to CitiesStrong?
            </Typography>
            <Typography variant="h4" gutterBottom>
              About Us
            </Typography>
            <Typography variant="body1" paragraph>
              Our Hometown Communities Foundation is directed by a dedicated group of business, church and education leaders who are passionate about making Utah a special place to live and raise a family for all residents.
            </Typography>
            <Typography variant="h5" gutterBottom>
              Our Values:
            </Typography>
            
              {/* Complete Transparency 
              Dollars multiplied by thousands of volunteer hours  
              Real results you can see and feel  
              Many kinds of projects to fund  
              Long term sustainability  
              Able to build strong community relationships  
              Easy to involve your organization’s staff in community projects  
              Visibility in the community */}
              <List>
                  <ListItem>
                      <Typography variant="body1" gutterBottom>Complete Transparency</Typography>
                  </ListItem>
                  <ListItem>
                      <Typography variant="body1" gutterBottom>Dollars multiplied by thousands of volunteer hours</Typography>
                  </ListItem>
                  <ListItem>
                      <Typography variant="body1" gutterBottom>Real results you can see and feel</Typography>
                  </ListItem>
                  <ListItem>
                      <Typography variant="body1" gutterBottom>Many kinds of projects to fund</Typography>
                  </ListItem>
                  <ListItem>
                      <Typography variant="body1" gutterBottom>Long term sustainability</Typography>
                  </ListItem>
                  <ListItem>
                      <Typography variant="body1" gutterBottom>Able to build strong community relationships</Typography>
                  </ListItem>
                  <ListItem>
                      <Typography variant="body1" gutterBottom>Easy to involve your organization's staff in community projects</Typography>
                  </ListItem>
                  <ListItem>
                      <Typography variant="body1" gutterBottom>Visibility in the community</Typography>
                  </ListItem>
              </List>


            {/* More values here */}
          </ContainerStyled>
        </CitiesStrongLayout>
      </ProviderWrapper>
      );
    }

export default Page;
