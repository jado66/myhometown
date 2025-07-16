import React, { useState, useMemo } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Avatar,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  Divider,
} from "@mui/material";
import {
  Schedule as ScheduleIcon,
  TrendingUp as TrendingUpIcon,
  Person as PersonIcon,
  Check as CheckIcon,
  Pending as PendingIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import type { Missionary, HoursRecord } from "./types";

interface HoursOverviewProps {
  missionaries: Missionary[];
}

export const HoursOverview: React.FC<HoursOverviewProps> = ({
  missionaries,
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [selectedMissionary, setSelectedMissionary] = useState("all");
  const [hoursDialogOpen, setHoursDialogOpen] = useState(false);
  const [selectedMissionaryForHours, setSelectedMissionaryForHours] =
    useState<Missionary | null>(null);

  // Generate some mock hours data for demonstration
  const mockHours = useMemo(() => {
    const hours: HoursRecord[] = [];
    const now = new Date();

    missionaries.forEach((missionary) => {
      // Generate 1-10 hours entries per missionary for the last 30 days
      const numEntries = Math.floor(Math.random() * 10) + 1;

      for (let i = 0; i < numEntries; i++) {
        const date = new Date(now);
        date.setDate(date.getDate() - Math.floor(Math.random() * 30));

        hours.push({
          id: `${missionary.id}-${i}`,
          missionary_id: missionary.id,
          date: date.toISOString().split("T")[0],
          hours: Math.floor(Math.random() * 8) + 1,
          description: [
            "Community outreach",
            "Administrative tasks",
            "Training session",
            "Event planning",
            "Volunteer coordination",
            "Data entry",
            "Meeting attendance",
          ][Math.floor(Math.random() * 7)],
          approved: Math.random() > 0.3,
          created_at: date.toISOString(),
        });
      }
    });

    return hours;
  }, [missionaries]);

  const hoursStats = useMemo(() => {
    const now = new Date();
    const periodStart = new Date();

    switch (selectedPeriod) {
      case "week":
        periodStart.setDate(now.getDate() - 7);
        break;
      case "month":
        periodStart.setMonth(now.getMonth() - 1);
        break;
      case "quarter":
        periodStart.setMonth(now.getMonth() - 3);
        break;
      default:
        periodStart.setMonth(now.getMonth() - 1);
    }

    const relevantHours = mockHours.filter((h) => {
      const hourDate = new Date(h.date);
      const matchesPeriod = hourDate >= periodStart;
      const matchesMissionary =
        selectedMissionary === "all" || h.missionary_id === selectedMissionary;
      return matchesPeriod && matchesMissionary;
    });

    const totalHours = relevantHours.reduce((sum, h) => sum + h.hours, 0);
    const approvedHours = relevantHours
      .filter((h) => h.approved)
      .reduce((sum, h) => sum + h.hours, 0);
    const pendingHours = totalHours - approvedHours;
    const uniqueMissionaries = new Set(
      relevantHours.map((h) => h.missionary_id)
    ).size;

    return {
      total: totalHours,
      approved: approvedHours,
      pending: pendingHours,
      activeMissionaries: uniqueMissionaries,
      averagePerMissionary:
        uniqueMissionaries > 0
          ? Math.round(totalHours / uniqueMissionaries)
          : 0,
    };
  }, [mockHours, selectedPeriod, selectedMissionary]);

  const missionaryHoursSummary = useMemo(() => {
    const summary = new Map();

    mockHours.forEach((h) => {
      const missionary = missionaries.find((m) => m.id === h.missionary_id);
      if (!missionary) return;

      const key = h.missionary_id;
      if (!summary.has(key)) {
        summary.set(key, {
          missionary,
          totalHours: 0,
          approvedHours: 0,
          pendingHours: 0,
          entries: 0,
        });
      }

      const current = summary.get(key);
      current.totalHours += h.hours;
      current.entries += 1;

      if (h.approved) {
        current.approvedHours += h.hours;
      } else {
        current.pendingHours += h.hours;
      }
    });

    return Array.from(summary.values()).sort(
      (a, b) => b.totalHours - a.totalHours
    );
  }, [mockHours, missionaries]);

  const handleAddHours = (missionary: Missionary) => {
    setSelectedMissionaryForHours(missionary);
    setHoursDialogOpen(true);
  };

  return (
    <Box>
      {/* Filter Controls */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Time Period</InputLabel>
            <Select
              value={selectedPeriod}
              label="Time Period"
              onChange={(e) => setSelectedPeriod(e.target.value)}
            >
              <MenuItem value="week">Last 7 Days</MenuItem>
              <MenuItem value="month">Last 30 Days</MenuItem>
              <MenuItem value="quarter">Last 3 Months</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Missionary</InputLabel>
            <Select
              value={selectedMissionary}
              label="Missionary"
              onChange={(e) => setSelectedMissionary(e.target.value)}
            >
              <MenuItem value="all">All Missionaries</MenuItem>
              {missionaries.map((missionary) => (
                <MenuItem key={missionary.id} value={missionary.id}>
                  {missionary.first_name} {missionary.last_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: "center" }}>
              <Avatar sx={{ mx: "auto", mb: 2, bgcolor: "primary.main" }}>
                <ScheduleIcon />
              </Avatar>
              <Typography variant="h4" color="primary" fontWeight="bold">
                {hoursStats.total}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Hours
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: "center" }}>
              <Avatar sx={{ mx: "auto", mb: 2, bgcolor: "success.main" }}>
                <CheckIcon />
              </Avatar>
              <Typography variant="h4" color="success.main" fontWeight="bold">
                {hoursStats.approved}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Approved Hours
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: "center" }}>
              <Avatar sx={{ mx: "auto", mb: 2, bgcolor: "warning.main" }}>
                <PendingIcon />
              </Avatar>
              <Typography variant="h4" color="warning.main" fontWeight="bold">
                {hoursStats.pending}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Pending Hours
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: "center" }}>
              <Avatar sx={{ mx: "auto", mb: 2, bgcolor: "info.main" }}>
                <PersonIcon />
              </Avatar>
              <Typography variant="h4" color="info.main" fontWeight="bold">
                {hoursStats.activeMissionaries}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active Missionaries
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Hours Summary Table */}
      <Card>
        <CardContent>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography variant="h6">Hours Summary by Missionary</Typography>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => setHoursDialogOpen(true)}
            >
              Add Hours
            </Button>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Missionary</TableCell>
                  <TableCell>Assignment</TableCell>
                  <TableCell align="right">Total Hours</TableCell>
                  <TableCell align="right">Approved</TableCell>
                  <TableCell align="right">Pending</TableCell>
                  <TableCell align="right">Entries</TableCell>
                  <TableCell align="center">Status</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {missionaryHoursSummary.map((summary) => (
                  <TableRow key={summary.missionary.id}>
                    <TableCell>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Avatar sx={{ width: 32, height: 32 }}>
                          {summary.missionary.first_name[0]}
                          {summary.missionary.last_name[0]}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {summary.missionary.first_name}{" "}
                            {summary.missionary.last_name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {summary.missionary.email}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">
                          {summary.missionary.title || "No Title"}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {summary.missionary.group || "No Group"}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight="bold">
                        {summary.totalHours}h
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" color="success.main">
                        {summary.approvedHours}h
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" color="warning.main">
                        {summary.pendingHours}h
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2">{summary.entries}</Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={summary.missionary.assignment_status}
                        color={
                          summary.missionary.assignment_status === "active"
                            ? "success"
                            : "default"
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleAddHours(summary.missionary)}
                      >
                        Add Hours
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {missionaryHoursSummary.length === 0 && (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <Typography variant="body2" color="text.secondary">
                No hours recorded for the selected period.
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Add Hours Dialog */}
      <Dialog
        open={hoursDialogOpen}
        onClose={() => setHoursDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add Hours</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Select Missionary</InputLabel>
              <Select
                value={selectedMissionaryForHours?.id || ""}
                label="Select Missionary"
                onChange={(e) => {
                  const missionary = missionaries.find(
                    (m) => m.id === e.target.value
                  );
                  setSelectedMissionaryForHours(missionary || null);
                }}
              >
                {missionaries.map((missionary) => (
                  <MenuItem key={missionary.id} value={missionary.id}>
                    {missionary.first_name} {missionary.last_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Date"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              defaultValue={new Date().toISOString().split("T")[0]}
            />

            <TextField
              label="Hours"
              type="number"
              fullWidth
              placeholder="Enter hours worked"
              inputProps={{ min: 0, max: 24, step: 0.5 }}
            />

            <TextField
              label="Description"
              multiline
              rows={3}
              fullWidth
              placeholder="Describe the work performed..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHoursDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => {
              // Here you would normally save the hours
              setHoursDialogOpen(false);
              setSelectedMissionaryForHours(null);
            }}
          >
            Add Hours
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
