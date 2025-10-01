"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import Box from "@mui/material/Box";

/**
 * PasswordAuthProvider
 * Optional layer providing a simple shared password gate (NOT secure for production-sensitive data).
 * Stores a timestamped flag in localStorage key `auth` valid for 30 days.
 */

const PasswordAuthContext = createContext(null);

export const usePasswordAuth = () => {
  const context = useContext(PasswordAuthContext);
  if (!context) {
    throw new Error(
      "usePasswordAuth must be used within a PasswordAuthProvider"
    );
  }
  return context;
};

export const PasswordAuthProvider = ({
  children,
  password: gatePassword = "MHT2025!",
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const storedAuth = localStorage.getItem("auth");
    if (storedAuth) {
      try {
        const { timestamp } = JSON.parse(storedAuth);
        const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;
        if (Date.now() - timestamp < thirtyDaysInMs) {
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem("auth");
        }
      } catch (e) {
        localStorage.removeItem("auth");
      }
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password === gatePassword) {
      setIsAuthenticated(true);
      localStorage.setItem("auth", JSON.stringify({ timestamp: Date.now() }));
      setError("");
    } else {
      setError("Invalid password");
    }
  };

  const handleClickShowPassword = () => setShowPassword((p) => !p);

  if (!isAuthenticated) {
    return (
      <Dialog
        open
        fullScreen
        PaperProps={{
          sx: {
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "background.default",
            mt: 0,
          },
        }}
      >
        <DialogContent
          sx={{
            maxWidth: 400,
            width: "100%",
            display: "flex",
            alignItems: "center",
            pb: 10,
          }}
        >
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ textAlign: "center" }}
          >
            <DialogTitle>Authentication Required</DialogTitle>
            <TextField
              fullWidth
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              variant="outlined"
              placeholder="Enter password"
              error={!!error}
              helperText={error}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
              Submit
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <PasswordAuthContext.Provider
      value={{ isAuthenticated, setIsAuthenticated }}
    >
      {children}
    </PasswordAuthContext.Provider>
  );
};

export default PasswordAuthProvider;
