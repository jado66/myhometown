'use client'

import React, { useState } from 'react';
import { TextField, Button, Container, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';

const LoginPage = () => {
  const [accessCode, setAccessCode] = useState('');
  const router = useRouter();

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
    <Container maxWidth="sm" sx={{p:5}}>
      <Typography variant="h4" color="primary" gutterBottom>
        Welcome to MyHometown Dev
      </Typography>
      <TextField
        label="Access Code"
        variant="outlined"
        fullWidth
        margin="normal"
        value={accessCode}
        onChange={(e) => setAccessCode(e.target.value)}
        type='password'
      />
      <Button
        variant="contained"
        color="primary"
        fullWidth
        onClick={handleLogin}
      >
        Login
      </Button>
    </Container>
  );
};

export default LoginPage;
