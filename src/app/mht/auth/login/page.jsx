"use client";
import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  IconButton,
  InputAdornment,
  Link,
  Paper,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { supabase } from "@/util/supabase";
import { useRouter } from "next/navigation";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);

  const router = useRouter();

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      // Handle successful login
      console.log("Logged in:", data);

      router.push(process.env.NEXT_PUBLIC_DOMAIN + "/admin-dashboard");

      // Redirect or update app state here
    } catch (error) {
      setError(error.message);
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
              src="/your-logo.png"
              alt="MyHometown"
              style={{ height: "60px", width: "auto" }}
            />
          </Box>

          <Typography component="h1" variant="h5" sx={{ mb: 1 }}>
            Welcome
          </Typography>

          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Log in to your Admin Portal account
          </Typography>

          <Box component="form" onSubmit={handleLogin} sx={{ width: "100%" }}>
            {error && (
              <Typography color="error" sx={{ mb: 2 }}>
                {error}
              </Typography>
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
              sx={{ mb: 2 }}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type={showPassword ? "text" : "password"}
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleTogglePassword}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Link
              href={process.env.NEXT_PUBLIC_DOMAIN + "/auth/forgot-password"}
              variant="body2"
              sx={{ display: "block", mt: 1, mb: 3 }}
            >
              Forgot password?
            </Link>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 2, mb: 2 }}
            >
              Continue
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default LoginPage;
