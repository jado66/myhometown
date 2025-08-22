"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Container,
  Paper,
} from "@mui/material";
import { Mail, Login } from "@mui/icons-material";

export default function MissionaryLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const rootUrl = process.env.NEXT_PUBLIC_ENVIRONMENT === "dev" ? "/mht" : "";

    try {
      const response = await fetch("/api/missionary/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(true);
        setMessage("Login successful! Redirecting...");
        setTimeout(() => {
          router.push(rootUrl + `/admin-dashboard/volunteer-hours/${email}`);
        }, 1000);
      } else {
        setSuccess(false);
        setMessage(result.message || "Login failed");
      }
    } catch (error) {
      setMessage("Failed to login");
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f5f5f5",
        p: 2,
      }}
    >
      <Container maxWidth="sm">
        <Paper elevation={3}>
          <Card>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ textAlign: "center", mb: 4 }}>
                <Mail sx={{ fontSize: 64, color: "primary.main", mb: 2 }} />
                <Typography
                  variant="h3"
                  component="h1"
                  gutterBottom
                  fontWeight="bold"
                >
                  Volunteer Hours
                </Typography>
                <Typography variant="h6" color="text.secondary">
                  Enter your email address to login
                </Typography>
              </Box>

              <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
                <TextField
                  fullWidth
                  type="email"
                  label="Email Address"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  sx={{
                    mb: 3,
                    "& .MuiInputBase-input": {
                      fontSize: "1.2rem",
                      padding: "16px 14px",
                    },
                    "& .MuiInputLabel-root": {
                      fontSize: "1.1rem",
                    },
                  }}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={loading}
                  startIcon={
                    loading ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : (
                      <Login />
                    )
                  }
                  sx={{
                    mb: 2,
                    py: 2,
                    fontSize: "1.2rem",
                    fontWeight: "bold",
                  }}
                >
                  {loading ? "Logging in..." : "Login"}
                </Button>
              </Box>

              {message && (
                <Alert
                  severity={success ? "success" : "error"}
                  sx={{ mt: 2, fontSize: "1rem" }}
                >
                  {message}
                </Alert>
              )}

              <Alert severity="info" sx={{ mt: 3 }}>
                <Typography variant="body2">
                  <strong>
                    If you do not have an account reach out to your Community
                    Resource Center admin.
                  </strong>
                </Typography>
              </Alert>
            </CardContent>
          </Card>
        </Paper>
      </Container>
    </Box>
  );
}
