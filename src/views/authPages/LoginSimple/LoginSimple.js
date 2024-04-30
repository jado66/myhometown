'use client'
import React from 'react';
import Box from '@mui/material/Box';
import Container from '@/components/util/Container';
import { Form } from './components';

const LoginSimple = () => {
  return (
    <Box
      display={'flex'}
      alignItems={'center'}
      justifyContent={'center'}
    >
      <Container maxWidth={600}>
        <Form />
      </Container>
    </Box>
  );
};

export default LoginSimple;
