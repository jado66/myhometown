"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  IconButton,
  InputAdornment,
  Paper,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { supabase } from "@/util/supabase";
import { useRouter, useSearchParams } from "next/navigation";

const SetupPasswordPage = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleTogglePassword = (field) => {
    if (field === "password") {
      setShowPassword(!showPassword);
    } else {
      setShowConfirmPassword(!showConfirmPassword);
    }
  };

  const validatePassword = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length < minLength) {
      return "Password must be at least 8 characters long";
    }
    if (!hasUpperCase) {
      return "Password must contain at least one uppercase letter";
    }
    if (!hasLowerCase) {
      return "Password must contain at least one lowercase letter";
    }
    if (!hasNumbers) {
      return "Password must contain at least one number";
    }
    if (!hasSpecialChar) {
      return "Password must contain at least one special character";
    }
    return null;
  };

  const handleSetupPassword = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Validate passwords match
      if (password !== confirmPassword) {
        throw new Error("Passwords do not match");
      }

      // Validate password strength
      const passwordError = validatePassword(password);
      if (passwordError) {
        throw new Error(passwordError);
      }

      // Get the token from the URL
      const token = searchParams.get("token");
      if (!token) {
        throw new Error("No recovery token found");
      }

      // Update the password using the recovery token
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) {
        throw updateError;
      }

      // Redirect to the admin dashboard
      router.push(process.env.NEXT_PUBLIC_DOMAIN + "/admin-dashboard");
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) {
    return null;
  }

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
          <Box sx={{ mb: 3 }}>
            <img
              src="/svgs/Primary_Logo_Black_Text.svg"
              alt="MyHometown"
              style={{ height: "60px", width: "auto" }}
            />
          </Box>

          <Typography component="h1" variant="h5" sx={{ mb: 1 }}>
            Set Up Your Password
          </Typography>

          <Typography variant="body1" color="#318d43" sx={{ mb: 3 }}>
            Create a secure password for your account
          </Typography>

          <Box
            component="form"
            onSubmit={handleSetupPassword}
            sx={{ width: "100%" }}
          >
            {error && (
              <Typography color="error" sx={{ mb: 2 }}>
                {error}
              </Typography>
            )}

            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="New Password"
              type={showPassword ? "text" : "password"}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{ mb: 2 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => handleTogglePassword("password")}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="Confirm Password"
              type={showConfirmPassword ? "text" : "password"}
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle confirm password visibility"
                      onClick={() => handleTogglePassword("confirm")}
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 2, mb: 2 }}
            >
              Password must be at least 8 characters long and contain:
              <ul style={{ marginTop: "0.5rem", marginBottom: "0.5rem" }}>
                <li>At least one uppercase letter</li>
                <li>At least one lowercase letter</li>
                <li>At least one number</li>
                <li>At least one special character</li>
              </ul>
            </Typography>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{
                mt: 2,
                mb: 2,
                backgroundColor: "#318d43",
                ":hover": {
                  backgroundColor: "#4ab55f",
                },
              }}
            >
              {loading ? "Setting up..." : "Set Password"}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default SetupPasswordPage;
