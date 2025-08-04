
import React, { useState, useEffect } from "react";
import {
  Alert as MuiAlert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  Grid,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Paper,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import MonitorHeartIcon from "@mui/icons-material/MonitorHeart";

export default function StreamMonitor() {
  const [monitorData, setMonitorData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchMonitorData = async () => {
    try {
      setError(null);
      const response = await fetch("/api/communications/send-texts/monitor");
      if (!response.ok) throw new Error("Failed to fetch monitor data");
      const data = await response.json();
      setMonitorData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const cleanupOrphaned = async () => {
    try {
      const response = await fetch("/api/communications/send-texts/monitor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "cleanup-orphaned" }),
      });

      if (!response.ok) throw new Error("Failed to cleanup");
      const result = await response.json();
      alert(
        `Cleaned up ${result.cleaned.orphanedControllers} orphaned controllers and ${result.cleaned.expiredStreams} expired streams`
      );
      fetchMonitorData();
    } catch (err) {
      alert("Cleanup failed: " + err.message);
    }
  };

  useEffect(() => {
    fetchMonitorData();

    if (autoRefresh) {
      const interval = setInterval(fetchMonitorData, 5000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);


  if (loading && !monitorData) {
    return (
      <Box display="flex" alignItems="center" justifyContent="center" p={8}>
        <CircularProgress size={28} sx={{ mr: 2 }} />
        <Typography>Loading monitor data...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <MuiAlert severity="error" sx={{ m: 4 }} icon={<WarningAmberIcon color="error" />}>Error: {error}</MuiAlert>
    );
  }

  return (
    <Box maxWidth="lg" mx="auto" p={2}>
      <Card elevation={3} sx={{ borderRadius: 2, p: 3 }}>
        <CardContent>
          <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems="center" mb={3}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <MonitorHeartIcon color="primary" sx={{ fontSize: 32 }} />
              <Typography variant="h5" fontWeight="bold">
                Stream Monitor Dashboard
              </Typography>
            </Stack>
            <Stack direction="row" spacing={2} alignItems="center">
              <FormControlLabel
                control={
                  <Checkbox
                    checked={autoRefresh}
                    onChange={(e) => setAutoRefresh(e.target.checked)}
                  />
                }
                label="Auto-refresh"
              />
              <Button
                variant="contained"
                color="primary"
                startIcon={<RefreshIcon />}
                onClick={fetchMonitorData}
              >
                Refresh
              </Button>
              <Button
                variant="contained"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={cleanupOrphaned}
              >
                Cleanup Orphaned
              </Button>
            </Stack>
          </Stack>

          <Grid container spacing={3} mb={3}>
            <Grid item xs={12} md={4}>
              <Paper elevation={1} sx={{ p: 2, borderRadius: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Active Streams
                </Typography>
                <Typography variant="h4" fontWeight="bold">
                  {monitorData?.activeStreams?.count || 0}
                </Typography>
                {monitorData?.health?.recommendation && (
                  <Typography variant="caption" color="warning.main">
                    {monitorData.health.recommendation}
                  </Typography>
                )}
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper elevation={1} sx={{ p: 2, borderRadius: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Daily Stream Counter
                </Typography>
                <Typography variant="h4" fontWeight="bold">
                  {monitorData?.dailyStreamCounter || 0}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper elevation={1} sx={{ p: 2, borderRadius: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Health Status
                </Typography>
                <Stack direction="row" alignItems="center" spacing={1}>
                  {(monitorData?.health?.orphanedControllers || monitorData?.health?.longRunningStreams > 0) ? (
                    <>
                      <WarningAmberIcon color="warning" fontSize="small" />
                      <Typography color="warning.main">
                        {monitorData.health.longRunningStreams} long-running
                      </Typography>
                    </>
                  ) : (
                    <>
                      <CheckCircleIcon color="success" fontSize="small" />
                      <Typography color="success.main">Healthy</Typography>
                    </>
                  )}
                </Stack>
              </Paper>
            </Grid>
          </Grid>

          {monitorData?.activeStreams?.details && monitorData.activeStreams.details.length > 0 && (
            <Box mt={4}>
              <Typography variant="h6" fontWeight="bold" mb={2}>
                Active Stream Details
              </Typography>
              <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Message ID</TableCell>
                      <TableCell>User ID</TableCell>
                      <TableCell>Age</TableCell>
                      <TableCell>TTL</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {monitorData.activeStreams.details.map((stream, idx) => {
                      const age = monitorData.activeStreams.ages?.find(
                        (a) => a.messageId === stream.messageId
                      );
                      return (
                        <TableRow key={idx}>
                          <TableCell sx={{ fontFamily: 'monospace' }}>{stream.messageId}</TableCell>
                          <TableCell>{stream.data?.userId || "anonymous"}</TableCell>
                          <TableCell>
                            {age ? (
                              <Typography
                                color={age.age > 300 ? "error" : undefined}
                                fontWeight={age.age > 300 ? "bold" : undefined}
                                component="span"
                              >
                                {Math.floor(age.age / 60)}m {age.age % 60}s
                              </Typography>
                            ) : (
                              "-"
                            )}
                          </TableCell>
                          <TableCell>{stream.ttl}s</TableCell>
                          <TableCell>{stream.data?.status || "unknown"}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          <Typography variant="caption" color="text.secondary" mt={4} display="block">
            Last updated: {monitorData?.timestamp ? new Date(monitorData.timestamp).toLocaleString() : "Never"}
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
