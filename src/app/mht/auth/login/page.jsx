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
  Link,
  Paper,
  Divider,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { supabase } from "@/util/supabase";
import { useRouter, useSearchParams } from "next/navigation";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [mounted, setMounted] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();

  // Add useEffect to handle client-side mounting
  useEffect(() => {
    setMounted(true);
  }, []);

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

      const returnTo = searchParams.get("returnTo");
      const redirectUrl = returnTo
        ? decodeURIComponent(returnTo)
        : process.env.NEXT_PUBLIC_DOMAIN + "/admin-dashboard";

      router.push(redirectUrl);
    } catch (error) {
      setError(error.message);
    }
  };

  // Return null or loading state while not mounted
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
            {/* Use next/image instead of img tag */}
            <img
              src="/svgs/Primary_Logo_Black_Text.svg"
              alt="MyHometown"
              style={{ height: "60px", width: "auto" }}
            />
          </Box>

          <Typography component="h1" variant="h5" sx={{ mb: 1 }}>
            Welcome
          </Typography>

          <Typography variant="body1" color="#318d43" sx={{ mb: 3 }}>
            Log in to your Admin Portal account
          </Typography>

          <Box component="form" onSubmit={handleLogin} sx={{ width: "100%" }}>
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
            {error && (
              <>
                <Typography color="error" sx={{ mb: 2 }}>
                  {error}
                </Typography>

                <Divider sx={{ my: 2 }} />

                <Typography sx={{ mb: 2 }}>
                  Are you sure you are in the right place? If you are a teacher,
                  Days of Service support, volunteer, or missionary, you can log
                  in{" "}
                  <Link href={process.env.NEXT_PUBLIC_DOMAIN + "/login"}>
                    here.
                  </Link>
                </Typography>
              </>
            )}

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
              sx={{
                mt: 2,
                mb: 2,
                backgroundColor: "#318d43",
                ":hover": {
                  backgroundColor: "#4ab55f",
                },
              }}
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
