import React from 'react';
import Box from '@mui/material/Box';
import Container from '@/components/util/Container';
import { Form } from './components';

const ForgotPasswordSimple = () => {
  return (
    <Box
      position={'relative'}
      minHeight={'calc(100vh - 247px)'}
      display={'flex'}
      alignItems={'center'}
      justifyContent={'center'}
      height={'100%'}
    >
      <Container maxWidth={600}>
        <Form />
      </Container>
    </Box>
  );
};

export default ForgotPasswordSimple;
