'use client'

import React, { useState } from 'react';
import { TextField, Button, Container, Typography, Grid } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useTheme } from '@emotion/react';
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import IconButton from "@mui/material/IconButton";

const LoginPage = () => {
  const theme = useTheme();
  const [accessCode, setAccessCode] = useState('');
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);

  const handleClickShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  const handleLogin = () => {
    if (accessCode === 'myhometown') {
      localStorage.setItem('isAuthenticated', 'true');
      router.push('/');
    } else {
      // Handle incorrect access code if needed
      alert('Incorrect access code!');
    }
  };

  return (
    <Container maxWidth="md" sx={{p:5}}>
      <Typography variant="h4" gutterBottom textAlign='center'>
        MyHometown is currently in development
      </Typography>
      <Typography variant="h5" gutterBottom textAlign='center'>
        If you have an access code, please enter it below
      </Typography>
      <Grid container spacing={2}>
      <Grid xs = {6} sx = {{mt:2, mx:'auto'}}>
        <TextField
          label="Access Code"
          variant="outlined"
          fullWidth
          margin="normal"
          value={accessCode}
          onChange={(e) => setAccessCode(e.target.value)}
          type={showPassword ? "text" : "password"} // switch input type between text and password
          InputProps={{
            endAdornment: ( // Add eye(visibility) icon button at the end of the text field
              <IconButton onClick={handleClickShowPassword}>
                {showPassword ? <Visibility /> : <VisibilityOff />}
              </IconButton>
            )
          }}
        />
        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={handleLogin}
        >
          Login
        </Button>
      </Grid>
      </Grid>
      
    </Container>
  );
};

export default LoginPage;
