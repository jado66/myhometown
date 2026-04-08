'use client';

import React, { useState } from 'react';
import { Container, Typography, TextField, Button, Box } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

const SendEmail = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sendingStatus, setSendingStatus] = useState('');
  const [errors, setErrors] = useState({ email: '', message: '' });

  const validateEmail = (email) => {
    if (!email) return 'Email is required';
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email) ? '' : 'Enter a valid email';
  };

  const validateMessage = (message) => {
    if (!message) return 'Message is required';
    return message.length >= 20 ? '' : 'Message should be of minimum 20 characters length';
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    // Validate form fields
    const emailError = validateEmail(email);
    const messageError = validateMessage(message);
    if (emailError || messageError) {
      setErrors({ email: emailError, message: messageError });
      return;
    }

    setSendingStatus(`Sending email to ${email}...`);
    // Handle email sending logic here
    console.log({ email, message });
    // After email is sent
    setSendingStatus(`Email successfully sent to ${email}`);
    // Reset form
    setEmail('');
    setMessage('');
  };

  return (
    <Container maxWidth="sm"  sx = {{my:10}}>
      <Typography variant="h4" component="h1" gutterBottom>
        Send Test Email
      </Typography>
      <Typography variant="body1" paragraph>
        Use the form below to send a test email.
      </Typography>

      {/* Email Form */}
      <form onSubmit={handleSubmit}>
        {/* Email Input Field */}
        <TextField
          fullWidth
          id="email"
          name="email"
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={Boolean(errors.email)}
          helperText={errors.email}
          margin="normal"
        />
        {/* Message Input Field */}
        <TextField
          fullWidth
          id="message"
          name="message"
          label="Message"
          multiline
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          error={Boolean(errors.message)}
          helperText={errors.message}
          margin="normal"
        />
        
        <Box textAlign='center'>
          <Button color="primary" variant="contained" type="submit" endIcon={<SendIcon />} size = 'large' fullWidth>
            Send
          </Button>
        </Box>
      </form>

      {/* Status message */}
      {sendingStatus && (
        <Typography color="textSecondary" gutterBottom>
          {sendingStatus}
        </Typography>
      )}
    </Container>
  );
};

export default SendEmail;
