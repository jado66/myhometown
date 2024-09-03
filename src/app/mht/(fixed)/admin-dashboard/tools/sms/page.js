"use client";
import React from "react";
import { Container } from "@mui/material";
import BulkSimpleTexting from "./components/BulkSimpleTexting";

const SendSMS = () => {
  return (
    <Container maxWidth="sm" sx={{ my: 10 }}>
      <BulkSimpleTexting />
    </Container>
  );
};

export default SendSMS;
