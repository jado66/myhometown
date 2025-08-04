import React, { useState, useEffect } from "react";
import RefreshIcon from "@mui/icons-material/Refresh";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import StorageIcon from "@mui/icons-material/Storage";
import {
  Box,
  Typography,
  Paper,
  Button,
  CircularProgress,
} from "@mui/material";

export default function RedisHealth() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStatus = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/health/redis");
      if (!res.ok) throw new Error("Failed to fetch Redis health");
      const data = await res.json();
      setStatus(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Box display="flex" alignItems="center" mb={2}>
        <StorageIcon sx={{ mr: 1 }} color="primary" />
        <Typography variant="h6">Redis Health</Typography>
        <Button
          onClick={fetchStatus}
          sx={{ ml: "auto" }}
          variant="outlined"
          size="small"
          startIcon={<RefreshIcon />}
        >
          Refresh
        </Button>
      </Box>
      {loading ? (
        <Box display="flex" alignItems="center" gap={1}>
          <CircularProgress size={20} />
          <Typography>Checking Redis...</Typography>
        </Box>
      ) : error ? (
        <Box display="flex" alignItems="center" color="error.main" gap={1}>
          <ErrorIcon color="error" />
          <Typography>Error: {error}</Typography>
        </Box>
      ) : status?.isConnected ? (
        <Box display="flex" alignItems="center" color="success.main" gap={1}>
          <CheckCircleIcon color="success" />
          <Typography>Connected (latency: {status.latency} ms)</Typography>
        </Box>
      ) : (
        <Box display="flex" alignItems="center" color="error.main" gap={1}>
          <ErrorIcon color="error" />
          <Typography>
            Not Connected: {status?.error || "Unknown error"}
          </Typography>
        </Box>
      )}
      <Typography variant="caption" color="text.secondary">
        Last checked:{" "}
        {status?.timestamp ? new Date(status.timestamp).toLocaleString() : "-"}
      </Typography>
    </Paper>
  );
}
