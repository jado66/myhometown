'use client';
import React, { useState } from 'react';
import { Container, Typography, TextField, Button, Box } from '@mui/material';
import TextsmsIcon from '@mui/icons-material/Textsms';

const SendSMS = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});
  const [sendingStatus, setSendingStatus] = useState('');

  const validateForm = () => {
    const newErrors = {};
    if (!phoneNumber.match(/^\+[1-9]\d{1,14}$/)) {
      newErrors.phoneNumber = 'Phone number must be in International format like +1234567890';
    }
    if (message.length < 1 || message.length > 160) {
      newErrors.message = 'Message should be between 1 and 160 characters long';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (validateForm()) {
      setSendingStatus(`Sending SMS to ${phoneNumber}...`);
      // Handle SMS sending logic here
      console.log({ phoneNumber, message });
      // Simulate async SMS send with timeout
      setTimeout(() => {
        setSendingStatus(`SMS successfully sent to ${phoneNumber}`);
        setPhoneNumber('');
        setMessage('');
      }, 2000);
    }
  };

  return (
    <Container maxWidth="sm" sx = {{my:10}}>
      <Typography variant="h4" component="h1" gutterBottom>
        Send SMS Text
      </Typography>
      <Typography variant="body1" paragraph>
        Use the form below to send a test SMS text.
      </Typography>

      {/* SMS Form */}
      <form onSubmit={handleSubmit}>
        {/* Phone Number Input Field */}
        <TextField
          fullWidth
          id="phoneNumber"
          name="phoneNumber"
          label="Phone Number"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          error={Boolean(errors.phoneNumber)}
          helperText={errors.phoneNumber}
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
        
        <Box textAlign='center' marginTop={2}>
          <Button color="primary" variant="contained" type="submit" endIcon={<TextsmsIcon />} size = 'large' fullWidth>
            Send SMS Test
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

export default SendSMS;
