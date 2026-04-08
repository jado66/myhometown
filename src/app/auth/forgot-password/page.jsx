"use client";
import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Link,
  Alert,
} from "@mui/material";
import { supabase } from "@/util/supabase";
import { useRouter } from "next/navigation";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/password-reset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to send reset email");
      }

      setIsSuccess(true);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
          }}
        >
          {/* Logo */}
          <Box sx={{ mb: 3 }}>
            <img
              src="/svgs/Primary_Logo_Black_Text.svg"
              alt="MyHometown"
              style={{ height: "60px", width: "auto" }}
            />
          </Box>

          <Typography component="h1" variant="h5" sx={{ mb: 1 }}>
            Reset Password
          </Typography>

          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Enter your email address and we'll send you instructions to reset
            your password.
          </Typography>

          {isSuccess ? (
            <Box sx={{ width: "100%" }}>
              <Alert severity="success" sx={{ mb: 3 }}>
                Check your email for a link to reset your password. If it
                doesn't appear within a few minutes, check your spam folder.
              </Alert>
              <Button
                fullWidth
                variant="contained"
                onClick={() =>
                  router.push(process.env.NEXT_PUBLIC_DOMAIN + "/auth/login")
                }
                sx={{
                  backgroundColor: "#318d43",
                  ":hover": { backgroundColor: "#4ab55f" },
                }}
              >
                Return to Login
              </Button>
            </Box>
          ) : (
            <Box
              component="form"
              onSubmit={handleSubmit}
              sx={{ width: "100%" }}
            >
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email address"
                name="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                sx={{ mb: 3 }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={isSubmitting}
                sx={{
                  mb: 2,
                  backgroundColor: "#318d43",
                  ":hover": {
                    backgroundColor: "#4ab55f",
                  },
                }}
              >
                {isSubmitting ? "Sending..." : "Send Reset Link"}
              </Button>

              <Box sx={{ textAlign: "center" }}>
                <Link
                  href={process.env.NEXT_PUBLIC_DOMAIN + "/auth/login"}
                  variant="body2"
                  sx={{ textDecoration: "none" }}
                >
                  Back to Login
                </Link>
              </Box>
            </Box>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default ForgotPasswordPage;
