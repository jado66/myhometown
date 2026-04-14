"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  Box,
  CircularProgress,
} from "@mui/material";
import { Print } from "@mui/icons-material";

const REPORT_TYPES = [
  {
    value: "org_summary",
    label: "Organization Summary Reports",
    description: "High-level summary of each organization's projects and hours",
  },
  {
    value: "project_detail",
    label: "Project Detailed Reports",
    description: "Full project details including tasks, materials, and photos",
  },
];

export const PrintDayReportDialog = ({ open, onClose, day, onGenerate }) => {
  const [reportType, setReportType] = useState("org_summary");
  const [selectedStakeIds, setSelectedStakeIds] = useState([]);
  const [generating, setGenerating] = useState(false);

  const stakes = day?.partner_stakes || [];

  useEffect(() => {
    if (open) {
      setSelectedStakeIds(stakes.map((s) => s.id));
      setReportType("org_summary");
    }
  }, [open, day]);

  const handleToggle = (stakeId) => {
    setSelectedStakeIds((prev) =>
      prev.includes(stakeId)
        ? prev.filter((id) => id !== stakeId)
        : [...prev, stakeId],
    );
  };

  const handleSelectAll = () => setSelectedStakeIds(stakes.map((s) => s.id));
  const handleDeselectAll = () => setSelectedStakeIds([]);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await onGenerate(reportType, selectedStakeIds);
      onClose();
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={generating ? undefined : onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>Print Day of Service Report</DialogTitle>
      <DialogContent dividers>
        <FormControl component="fieldset" sx={{ mb: 2, width: "100%" }}>
          <FormLabel sx={{ mb: 1, fontWeight: 600 }}>Report Type</FormLabel>
          <RadioGroup
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
          >
            {REPORT_TYPES.map((rt) => (
              <FormControlLabel
                key={rt.value}
                value={rt.value}
                control={<Radio />}
                label={
                  <Box>
                    <Typography variant="body2" fontWeight={500}>
                      {rt.label}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {rt.description}
                    </Typography>
                  </Box>
                }
                sx={{ mb: 0.5 }}
              />
            ))}
          </RadioGroup>
        </FormControl>

        {stakes.length > 1 && (
          <>
            <Divider sx={{ mb: 2 }} />
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 1,
              }}
            >
              <FormLabel sx={{ fontWeight: 600 }}>
                Organizations ({selectedStakeIds.length}/{stakes.length}{" "}
                selected)
              </FormLabel>
              <Box sx={{ display: "flex", gap: 0.5 }}>
                <Button
                  size="small"
                  onClick={handleSelectAll}
                  disabled={generating}
                >
                  All
                </Button>
                <Button
                  size="small"
                  onClick={handleDeselectAll}
                  disabled={generating}
                >
                  None
                </Button>
              </Box>
            </Box>

            <List dense disablePadding>
              {stakes.map((stake) => (
                <ListItem key={stake.id} disablePadding>
                  <ListItemButton
                    onClick={() => handleToggle(stake.id)}
                    disabled={generating}
                    dense
                  >
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <Checkbox
                        edge="start"
                        checked={selectedStakeIds.includes(stake.id)}
                        tabIndex={-1}
                        disableRipple
                        size="small"
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary={stake.name || "Unnamed Organization"}
                      primaryTypographyProps={{ variant: "body2" }}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={generating}>
          Cancel
        </Button>
        <Button
          variant="contained"
          startIcon={
            generating ? (
              <CircularProgress size={16} color="inherit" />
            ) : (
              <Print />
            )
          }
          onClick={handleGenerate}
          disabled={generating || selectedStakeIds.length === 0}
        >
          {generating ? "Generating..." : "Generate Report"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
