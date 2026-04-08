'use client';
import React, { useState } from 'react';
import { Container, TextField, Checkbox, FormControlLabel, Button, Typography } from '@mui/material';

export default function Notifications() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isOptedIn, setIsOptedIn] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (isOptedIn) {
      // Implement the logic to handle the phone number submission
      console.log('Phone number submitted:', phoneNumber);
      // You would typically want to send this data to your backend.
    } else {
      alert('You must opt-in to receive SMS messages.');
    }
  };

  return (
    <Container maxWidth="sm" sx = {{py:10}}>
      <Typography variant="h4" component="h1" gutterBottom>
        Receive SMS Notifications
      </Typography>

      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Phone Number"
          variant="outlined"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          margin="normal"
        />

        <FormControlLabel
          control={
            <Checkbox
              checked={isOptedIn}
              onChange={(e) => setIsOptedIn(e.target.checked)}
              name="optIn"
              color="primary"
            />
          }
          label="By checking this box, you are opting in to receiving SMS messages for regular account updates and appointment reminders to your provided contact phone number."
        />

        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={!isOptedIn || !phoneNumber}
        >
          Submit
        </Button>
      </form>
    </Container>
  );
}
