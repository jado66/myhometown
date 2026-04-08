"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Button,
  IconButton,
  InputAdornment,
  Alert,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";

export default function AccessCodeDialog({ children }) {
  const [showDialog, setShowDialog] = useState(true);
  const [accessCode, setAccessCode] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  // Check for existing valid session on component mount
  useEffect(() => {
    const sessionData = localStorage.getItem("accessCodeSession");
    if (sessionData) {
      const { timestamp } = JSON.parse(sessionData);
      const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;

      if (Date.now() - timestamp < thirtyDaysInMs) {
        setShowDialog(false);
      } else {
        // Session expired, clear it
        localStorage.removeItem("accessCodeSession");
      }
    }
  }, []);

  useEffect(() => {
    if (attempts >= 3) {
      router.push("../");
    }
  }, [attempts, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("/api/verify-access-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessCode }),
      });

      if (response.ok) {
        // Store session with timestamp
        localStorage.setItem(
          "accessCodeSession",
          JSON.stringify({
            timestamp: Date.now(),
          })
        );
        setShowDialog(false);
      } else {
        const data = await response.json();
        setError(data.message || "Invalid access code. Please try again.");
        setAttempts(attempts + 1);
        setAccessCode("");
      }
    } catch (err) {
      setError("An error occurred. Please try again later.");
      console.error("Error verifying access code:", err);
    }
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  if (!showDialog) return children;

  return (
    <Dialog
      open={showDialog}
      onClose={() => router.push("../")}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>Enter Access Code</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Please enter the access code to view class details.
          </DialogContentText>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <TextField
            autoFocus
            margin="dense"
            id="accessCode"
            label="Access Code"
            type={showPassword ? "text" : "password"}
            fullWidth
            variant="outlined"
            value={accessCode}
            onChange={(e) => setAccessCode(e.target.value)}
            error={!!error}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleClickShowPassword}
                    onMouseDown={handleMouseDownPassword}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          {attempts > 0 && (
            <DialogContentText sx={{ mt: 1, color: "warning.main" }}>
              Remaining attempts: {3 - attempts}
            </DialogContentText>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => router.push("../")}>Cancel</Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={!accessCode.trim()}
          >
            Submit
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
