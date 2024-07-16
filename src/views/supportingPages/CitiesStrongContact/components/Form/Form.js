/* eslint-disable react/no-unescaped-entities */
import React from 'react';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import { styled } from '@mui/system';

const Form = () => {
  const theme = useTheme();
  const isMd = useMediaQuery(theme.breakpoints.up('md'), {
    defaultMatches: true,
  });

  return (
    <Box sx = {{px:{xs:4, md:0}}}>
      <Box>
        <Typography
          sx={{
            textTransform: 'uppercase',
            fontWeight: 'medium',
          }}
          gutterBottom
         
        >
          
        </Typography>
        <Box marginBottom={2}>
          <Typography
            variant="h2"
            sx={{
              fontWeight: 700,
            }}
          >
            Send us a message
          </Typography>
        </Box>
        <Box>
          <Typography variant="h6" >
          We'll get back to you in 1-2 business days.
          </Typography>
        </Box>
      </Box>
      <Box
        padding={0}
        width={'100%'}
        my={4}
      >
        <form noValidate autoComplete="off">
          <Grid container spacing={isMd ? 4 : 2}>
            <Grid item xs={12} sm={6}>
              <StyledTextField
                sx={{ height: 54, backgroundColor: 'white' }}
                label="First name"
                variant="outlined"
                color="primary"
                size="medium"
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <StyledTextField
                sx={{ height: 54, backgroundColor: 'white' }}
                label="Last name"
                variant="outlined"
                color="primary"
                size="medium"
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <StyledTextField
                 sx={{
                  
                  height: 54,
                  backgroundColor: 'white',
                  '& .MuiOutlinedInput-input::placeholder': {
                    color: 'black !important',
                  },
                  '& .MuiOutlinedInput-input::-webkit-input-placeholder': {
                    color: 'black !important',
                  },
                }}
                label="Email"
                type="email"
                variant="outlined"
                color="primary"
                size="medium"
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <StyledTextField
                label="Message"
                multiline
                sx = {{backgroundColor: 'white'}}
                rows={6}
                variant="outlined"
                color="primary"
                size="medium"
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                sx={{ height: 54,
                  textTransform:'uppercase',
                  fontSize:'large',
                  fontWeight:'bold'
                 }}
                variant="contained"
                color="primary"
                size="large"
                fullWidth
              >
                Send Message
              </Button>
            </Grid>
            
            <Grid item xs={12}>
              <Box>
                <Typography component="p" variant="body2" align="left">
                  By clicking on "submit" you agree to our{' '}
                  <Box
                    component="a"
                    href=""
                    color={theme.palette.text.primary}
                    fontWeight={'700'}
                  >
                    Privacy Policy
                  </Box>
                  ,{' '}
                  <Box
                    component="a"
                    href=""
                    color={theme.palette.text.primary}
                    fontWeight={'700'}
                  >
                    Data Policy
                  </Box>{' '}
                  and{' '}
                  <Box
                    component="a"
                    href=""
                    color={theme.palette.text.primary}
                    fontWeight={'700'}
                  >
                    Cookie Policy
                  </Box>
                  .
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Box>
    </Box>
  );
};

export default Form;

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiInputBase-root': {
    borderRadius: "0px",
    borderWidth: '2px',
    borderColor:'black',
    fontWeight: 'bold',
    textTransform: 'capitalize',
    color: 'black',
  },
  '& .MuiInputLabel-root': {
    color: 'grey',
  },
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: 'black',
      borderWidth: '2px', // Set your desired border width here

    },
    '&:hover fieldset': {
      borderColor: 'black',
      borderWidth: '2px', // Set your desired border width here

    },
    '&.Mui-focused fieldset': {
      borderColor: 'black',
      borderWidth: '2px', // Set your desired border width here

    },
  },
  '& .MuiOutlinedInput-input': {
    color: 'black',
  },
}));

