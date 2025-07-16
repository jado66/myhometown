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

  if (!open) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
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
          <Typography variant="h6" gutterBottom sx={{ mt: 2, mb: 2 }}>
            Basic Information
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
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
            <Grid item xs={12} sm={6}>
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
            <Grid item xs={12} sm={6}>
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
            <Grid item xs={12} sm={6}>
              <TextField
                label="Phone Number"
                type="tel"
                fullWidth
                value={formData.contact_number}
                onChange={(e) =>
                  setFormData({ ...formData, contact_number: e.target.value })
                }
                margin="normal"
              />
            </Grid>
          </Grid>

          {/* Assignment Information */}
          <Typography variant="h6" gutterBottom sx={{ mt: 3, mb: 2 }}>
            Assignment Information
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Assignment Level</InputLabel>
                <Select
                  value={formData.assignment_level}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      assignment_level: e.target.value,
                      group: "",
                      title: "",
                    })
                  }
                  label="Assignment Level"
                >
                  <MenuItem value="state">State</MenuItem>
                  <MenuItem value="city">City</MenuItem>
                  <MenuItem value="community">Community</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.assignment_status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      assignment_status: e.target.value,
                    })
                  }
                  label="Status"
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                  <MenuItem value="unassigned">Unassigned</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {(formData.assignment_level === "city" ||
              formData.assignment_level === "community") && (
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>City</InputLabel>
                  <Select
                    value={formData.city_id}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        city_id: e.target.value,
                        community_id: "",
                      })
                    }
                    label="City"
                  >
                    <MenuItem value="">Select City</MenuItem>
                    {cities.map((city) => (
                      <MenuItem key={city.id} value={city.id}>
                        {city.name}, {city.state}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}

            {formData.assignment_level === "community" && formData.city_id && (
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Community</InputLabel>
                  <Select
                    value={formData.community_id}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        community_id: e.target.value,
                      })
                    }
                    label="Community"
                  >
                    <MenuItem value="">Select Community</MenuItem>
                    {communities
                      .filter((c) => c.city_id === formData.city_id)
                      .map((community) => (
                        <MenuItem key={community.id} value={community.id}>
                          {community.name}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
              </Grid>
            )}

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Group</InputLabel>
                <Select
                  value={formData.group}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      group: e.target.value,
                      title: "",
                    })
                  }
                  label="Group"
                >
                  <MenuItem value="">Select Group</MenuItem>
                  {Object.keys(availablePositions).map((group) => (
                    <MenuItem key={group} value={group}>
                      {group}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {formData.group && (
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Title</InputLabel>
                  <Select
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    label="Title"
                  >
                    <MenuItem value="">Select Title</MenuItem>
                    {(availablePositions[formData.group] || []).map((title) => (
                      <MenuItem key={title} value={title}>
                        {title}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}

            <Grid item xs={12} sm={6}>
              <TextField
                label="Start Date"
                type="date"
                fullWidth
                value={formData.start_date}
                onChange={(e) =>
                  setFormData({ ...formData, start_date: e.target.value })
                }
                margin="normal"
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
