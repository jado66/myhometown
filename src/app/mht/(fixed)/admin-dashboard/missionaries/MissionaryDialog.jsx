import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Typography,
  FormControl,
  InputLabel,
  FormLabel,
  FormControlLabel,
  Radio,
  RadioGroup,
  Select,
  MenuItem,
  IconButton,
  Box,
} from "@mui/material";
import { Close as CloseIcon, Save as SaveIcon } from "@mui/icons-material";
import { POSITIONS_BY_LEVEL } from "./positions";

const MissionaryDialog = ({
  open,
  onClose,
  onSave,
  missionary,
  cities,
  communities,
  assignmentLevel,
}) => {
  const [formData, setFormData] = useState({
    email: "",
    first_name: "",
    last_name: "",
    profile_picture_url: "",
    city_id: "",
    community_id: "",
    assignment_status: "active",
    assignment_level: assignmentLevel,
    contact_number: "",
    notes: "",
    group: "",
    title: "",
    start_date: "",
  });

  React.useEffect(() => {
    if (missionary) {
      setFormData({
        email: missionary.email || "",
        first_name: missionary.first_name || "",
        last_name: missionary.last_name || "",
        profile_picture_url: missionary.profile_picture_url || "",
        city_id: missionary.city_id || "",
        community_id: missionary.community_id || "",
        assignment_status: missionary.assignment_status || "active",
        assignment_level: missionary.assignment_level || assignmentLevel,
        contact_number: missionary.contact_number || "",
        notes: missionary.notes || "",
        group: missionary.group || "",
        title: missionary.title || "",
        start_date: missionary.start_date || "",
      });
    } else {
      setFormData((prev) => ({ ...prev, assignment_level: assignmentLevel }));
    }
  }, [missionary, assignmentLevel]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const availablePositions =
    POSITIONS_BY_LEVEL[formData.assignment_level] || {};

  const calculateReleaseDate = (startDate, duration) => {
    if (!startDate || !duration) return "";

    const start = new Date(startDate);
    let monthsToAdd = duration.match(/\d+/);
    if (monthsToAdd) {
      monthsToAdd = parseInt(monthsToAdd[0], 10);

      start.setMonth(start.getMonth() + monthsToAdd);
      return start.toISOString().split("T")[0]; // Format as YYYY-MM-DD
    }
    return "";
  };

  if (!open) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xl"
      fullWidth
      PaperProps={{
        sx: { maxHeight: "90vh" },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h6">
          {missionary ? "Edit Missionary" : "Add New Missionary"}
        </Typography>
        <IconButton onClick={onClose} edge="end">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Box component="form" onSubmit={handleSubmit}>
          {/* Basic Information */}
          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            Basic Information
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={2.25}>
              <TextField
                label="First Name"
                required
                fullWidth
                value={formData.first_name}
                onChange={(e) =>
                  setFormData({ ...formData, first_name: e.target.value })
                }
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={2.25}>
              <TextField
                label="Last Name"
                required
                fullWidth
                value={formData.last_name}
                onChange={(e) =>
                  setFormData({ ...formData, last_name: e.target.value })
                }
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={2.25}>
              <TextField
                label="Email"
                type="email"
                required
                fullWidth
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                margin="normal"
              />
            </Grid>

            <Grid item xs={12} sm={2.25}>
              <TextField
                label="Phone Number"
                type="tel"
                fullWidth
                required
                value={formData.contact_number}
                onChange={(e) =>
                  setFormData({ ...formData, contact_number: e.target.value })
                }
                margin="normal"
              />
            </Grid>

            <Grid
              item
              xs={12}
              sm={3} // Adjusted sm size for better responsiveness in a demo
              sx={{
                // Mimic TextField styling

                padding: "8px 12px", // Standard MUI TextField padding
                display: "flex",
                flexDirection: "row", // Keep label and radio group in a row
                alignItems: "center", // Vertically align items

                gap: 2, // Space between label and radio group
                minWidth: 250, // Ensure it has some width
                maxWidth: 400, // Max width for better presentation
              }}
            >
              <FormControl
                component="fieldset"
                sx={{
                  flexDirection: "row",
                  alignItems: "center",
                  width: "100%",
                  height: "56px",
                  mt: "16px",
                  border: "1px solid #ccc",
                  borderRadius: "4px", // Standard MUI border-radius
                  flexGrow: 1, // Allow it to grow and fill available space
                }}
              >
                <FormLabel
                  id="gender-radio-buttons-group-label"
                  sx={{
                    // Style the label to look like a TextField label
                    ml: "14px",
                    color: "text.secondary", // Grey out like a placeholder/label
                    fontSize: "16", // Smaller font size
                    marginRight: 2, // Space between label and radio buttons
                    whiteSpace: "nowrap", // Prevent label from wrapping
                    flexShrink: 0, // Prevent label from shrinking
                  }}
                >
                  Gender *
                </FormLabel>
                <RadioGroup
                  row
                  aria-labelledby="gender-radio-buttons-group-label"
                  name="gender-row-radio-buttons-group"
                  defaultValue="female" // Added a default value
                  sx={{ flexGrow: 1, justifyContent: "flex-end" }} // Allow radio group to take available space and push to end
                >
                  <FormControlLabel
                    value="female"
                    control={<Radio size="small" />}
                    label="Female"
                  />
                  <FormControlLabel
                    value="male"
                    control={<Radio size="small" />}
                    label="Male"
                  />
                </RadioGroup>
              </FormControl>
            </Grid>
          </Grid>
          {/* Assignment Information */}
          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            Assignment Information
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={3}>
              <TextField
                label="Name of Stake"
                type="text"
                fullWidth
                value={formData.stake_name}
                onChange={(e) =>
                  setFormData({ ...formData, stake_name: e.target.value })
                }
                margin="normal"
                InputLabelProps={{
                  shrink: true,
                }}
                helperText="Missionary's home stake"
              />
            </Grid>

            <Grid item xs={12} sm={2}>
              <TextField
                label="Call Date"
                type="date"
                fullWidth
                value={formData.call_date}
                onChange={(e) =>
                  setFormData({ ...formData, call_date: e.target.value })
                }
                margin="normal"
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={2}>
              <FormControl fullWidth margin="normal" sx={{ mt: 2 }}>
                <InputLabel id="assignment-duration">Duration</InputLabel>

                <Select
                  label="Duration"
                  fullWidth
                  value={formData.duration}
                  onChange={(e) =>
                    setFormData({ ...formData, duration: e.target.value })
                  }
                >
                  <MenuItem value="6 months">6 months</MenuItem>
                  <MenuItem value="12 months">12 months</MenuItem>
                  <MenuItem value="18 months">18 months</MenuItem>
                  <MenuItem value="24 months">24 months</MenuItem>
                  <MenuItem value="36 months">36 months</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={2}>
              <TextField
                label="Release Date (Calculated)"
                type="date"
                InputProps={{ readOnly: true }}
                fullWidth
                value={calculateReleaseDate(
                  formData.call_date,
                  formData.duration
                )}
                sx={{
                  mt: 2,
                  "& .MuiInputBase-input": {
                    color: "text.primary", // Use regular text color
                  },
                }}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
          </Grid>
          {/* Notes */}
          <Typography variant="h6" gutterBottom sx={{ mt: 3, mb: 2 }}>
            Notes
          </Typography>
          <TextField
            label="Notes"
            multiline
            rows={3}
            fullWidth
            value={formData.notes}
            onChange={(e) =>
              setFormData({ ...formData, notes: e.target.value })
            }
            placeholder="Additional notes about this missionary's service..."
            margin="normal"
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="outlined">
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          startIcon={<SaveIcon />}
          sx={{ ml: 1 }}
        >
          {missionary ? "Update" : "Create"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export { MissionaryDialog };
