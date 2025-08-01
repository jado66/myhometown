import React, { useState, useEffect } from "react";
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
  Card,
  Tooltip,
  Avatar,
  CircularProgress,
} from "@mui/material";
import {
  Close as CloseIcon,
  Save as SaveIcon,
  Business as BusinessIcon,
  LocationCity as LocationCityIcon,
  Group as GroupIcon,
  CloudUpload as CloudUploadIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import ReactSelect from "react-select";
import JsonViewer from "@/components/util/debug/DebugOutput";
import { useImageUpload } from "@/hooks/use-upload-image";
import InfoIcon from "@mui/icons-material/Info";
// Title positions organized by level and group
const POSITIONS_BY_LEVEL = {
  state: {
    "Executive Board": [
      "Utah Director",
      "Associate Director",
      "Special Projects",
      "Executive Secretary",
    ],
  },
  city: {
    "Executive Board": [
      "City Chair",
      "Associate City Chair",
      "Executive Secretary",
      "Technology Specialist",
      "Event Coordinator",
    ],
  },
  community: {
    "Executive Board": [
      "Community Executive Director",
      "Technology Specialist",
    ],
    "Community Resource Center": [
      "Director",
      "Associate Director",
      "Teacher",
      "Supervisor",
      "Administrator",
    ],
    "Neighborhood Services": [
      "Neighborhood Services Director",
      "Project Developer",
      "Resource Couple",
      "Support Staff",
    ],
  },
};

interface MissionaryDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (formData: any) => void;
  missionary?: any;
  cities: any[];
  communities: any[];
  user?: {
    permissions?: {
      administrator?: boolean;
    };
    cities?: string[];
    communities?: string[];
  };
}

const MissionaryDialog: React.FC<MissionaryDialogProps> = ({
  open,
  onClose,
  onSave,
  missionary,
  cities,
  communities,
  user = {},
}) => {
  const [formData, setFormData] = useState({
    email: "",
    first_name: "",
    last_name: "",
    profile_picture_url: "",
    city_id: "",
    community_id: "",
    assignment_status: "active",
    assignment_level: "state",
    contact_number: "",
    notes: "",
    group: "",
    title: "",
    start_date: "",
    call_date: "",
    duration: "",
    stake_name: "",
    gender: "female",
  });

  const isAdmin = user?.permissions?.administrator || false;

  // Initialize image upload hook
  const { handleFileUpload, loading: uploadLoading } = useImageUpload(
    (url: string) =>
      setFormData((prev) => ({ ...prev, profile_picture_url: url }))
  );

  useEffect(() => {
    if (missionary) {
      setFormData({
        email: missionary.email || "",
        first_name: missionary.first_name || "",
        last_name: missionary.last_name || "",
        profile_picture_url: missionary.profile_picture_url || "",
        city_id: missionary.city_id || "",
        community_id: missionary.community_id || "",
        assignment_status: missionary.assignment_status || "active",
        assignment_level: missionary.assignment_level || "state",
        contact_number: missionary.contact_number || "",
        notes: missionary.notes || "",
        group: missionary.group || "",
        title: missionary.title || "",
        start_date: missionary.start_date || "",
        call_date: missionary.call_date || "",
        duration: missionary.duration || "",
        stake_name: missionary.stake_name || "",
        gender: missionary.gender || "female",
      });
    }
  }, [missionary]);

  // Get available cities based on permissions
  // Use _id for MongoDB style, fallback to id if needed
  const getAvailableCities = () => {
    if (isAdmin) return cities;
    if (!user?.cities || user.cities.length === 0) return [];
    return cities.filter((city) => user.cities!.includes(city._id || city.id));
  };

  // Get available communities based on permissions and selected city
  const getAvailableCommunities = () => {
    let availableCommunities = communities;

    // Filter by selected city (match by city name if city_id is Mongo style)
    if (formData.city_id) {
      const selectedCity = cities.find(
        (city) => (city._id || city.id) === formData.city_id
      );
      if (selectedCity) {
        availableCommunities = availableCommunities.filter(
          (comm) => comm.city === selectedCity.name
        );
      }
    }

    // Filter by permissions
    if (!isAdmin && user?.communities && user.communities.length > 0) {
      availableCommunities = availableCommunities.filter((comm) =>
        user.communities!.includes(comm._id || comm.id)
      );
    }

    return availableCommunities;
  };

  // Get title options for react-select
  const getTitleOptions = () => {
    const positions = POSITIONS_BY_LEVEL[formData.assignment_level] || {};
    const options = [];

    Object.entries(positions).forEach(([group, titles]) => {
      options.push({
        label: group,
        options: titles.map((title) => ({
          value: title,
          label: title,
          group: group,
        })),
      });
    });

    return options;
  };

  // Get grouped city options for react-select
  const getCityOptions = () => {
    const availableCities = getAvailableCities();
    const grouped = {};
    availableCities.forEach((city) => {
      const state = city.state || "Unknown";
      if (!grouped[state]) grouped[state] = [];
      grouped[state].push({
        value: city._id || city.id,
        label: `${city.name}`,
        city: city.name,
        state: city.state,
      });
    });
    return Object.entries(grouped).map(([state, cities]) => ({
      label: state,
      options: cities,
    }));
  };

  // Get grouped community options for react-select
  const getCommunityOptions = () => {
    const availableCommunities = getAvailableCommunities();
    const grouped = {};
    availableCommunities.forEach((comm) => {
      const city = `${comm.city}, ${comm.state} ` || "Unknown";
      if (!grouped[city]) grouped[city] = [];
      grouped[city].push({
        value: comm._id || comm.id,
        label: `${comm.name}`,
        city: comm.city,
        state: comm.state,
      });
    });
    return Object.entries(grouped).map(([city, communities]) => ({
      label: city,
      options: communities,
    }));
  };

  const handleAssignmentLevelChange = (level: string) => {
    setFormData({
      ...formData,
      assignment_level: level,
      city_id: "",
      community_id: "",
      group: "",
      title: "",
    });
  };

  const handleTitleChange = (selectedOption: any) => {
    if (selectedOption) {
      setFormData({
        ...formData,
        title: selectedOption.value,
        group: selectedOption.group,
      });
    } else {
      setFormData({
        ...formData,
        title: "",
        group: "",
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Clear location fields based on assignment level
    const submitData = { ...formData };
    if (submitData.assignment_level === "state") {
      submitData.city_id = "";
      submitData.community_id = "";
    } else if (submitData.assignment_level === "city") {
      submitData.community_id = "";
    }

    onSave(submitData);
  };

  const calculateReleaseDate = (startDate: string, duration: string) => {
    if (!startDate || !duration) return "";

    const start = new Date(startDate);
    let monthsToAdd = duration.match(/\d+/);
    if (monthsToAdd) {
      monthsToAdd = parseInt(monthsToAdd[0], 10);
      start.setMonth(start.getMonth() + monthsToAdd);
      return start.toISOString().split("T")[0];
    }
    return "";
  };

  const levelCards = [
    {
      value: "state",
      icon: BusinessIcon,
      title: "State Assignment",
      desc: "Utah state-wide assignments",
    },
    {
      value: "city",
      icon: LocationCityIcon,
      title: "City Assignment",
      desc: "City-specific assignments",
    },
    {
      value: "community",
      icon: GroupIcon,
      title: "Community Assignment",
      desc: "Community assignments",
    },
  ];

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
          {/* Assignment Level Selection */}
          <Typography variant="h6" gutterBottom>
            Assignment
          </Typography>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {levelCards.map(({ value, icon: Icon, title, desc }) => (
              <Grid item xs={12} md={4} key={value}>
                <Card
                  elevation={formData.assignment_level === value ? 3 : 1}
                  sx={{
                    p: 2,
                    cursor: "pointer",
                    border:
                      formData.assignment_level === value
                        ? "2px solid"
                        : "1px solid",
                    borderColor:
                      formData.assignment_level === value
                        ? "primary.main"
                        : "divider",
                    backgroundColor:
                      formData.assignment_level === value
                        ? "primary.50"
                        : "background.paper",
                    "&:hover": {
                      borderColor:
                        formData.assignment_level === value
                          ? "primary.main"
                          : "primary.light",
                    },
                  }}
                  onClick={() => handleAssignmentLevelChange(value)}
                >
                  <Box
                    sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}
                  >
                    <Icon
                      sx={{
                        color:
                          formData.assignment_level === value
                            ? "primary.main"
                            : "text.secondary",
                        fontSize: 24,
                      }}
                    />
                    <Box>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {desc}
                      </Typography>
                    </Box>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Location & Position Selection Inline */}
          {(formData.assignment_level === "city" ||
            formData.assignment_level === "community") && (
            <Grid container spacing={2} sx={{ mb: 3 }}>
              {formData.assignment_level === "city" && (
                <Grid item xs={12} md={6}>
                  <ReactSelect
                    options={getCityOptions()}
                    value={(() => {
                      const selected = getAvailableCities().find(
                        (city) => (city._id || city.id) === formData.city_id
                      );
                      return selected
                        ? {
                            value: selected._id || selected.id,
                            label: `${selected.name}, ${selected.state}`,
                            city: selected.name,
                            state: selected.state,
                          }
                        : null;
                    })()}
                    onChange={(option) =>
                      setFormData({
                        ...formData,
                        city_id: option ? option.value : "",
                      })
                    }
                    isClearable
                    placeholder="Select a city..."
                    styles={{
                      control: (base) => ({ ...base, minHeight: "56px" }),
                      menu: (base) => ({
                        ...base,
                        zIndex: 13000,
                        position: "absolute",
                      }),
                      menuPortal: (base) => ({ ...base, zIndex: 13000 }),
                    }}
                    menuPortalTarget={document.body}
                    menuPosition="absolute"
                    menuShouldBlockScroll={true}
                  />
                </Grid>
              )}
              {formData.assignment_level === "community" && (
                <Grid item xs={12} md={6}>
                  <ReactSelect
                    options={getCommunityOptions()}
                    value={(() => {
                      const selected = getAvailableCommunities().find(
                        (comm) =>
                          (comm._id || comm.id) === formData.community_id
                      );
                      return selected
                        ? {
                            value: selected._id || selected.id,
                            label: `${selected.name} (${selected.city}, ${selected.state})`,
                            city: selected.city,
                            state: selected.state,
                          }
                        : null;
                    })()}
                    onChange={(option) =>
                      setFormData({
                        ...formData,
                        community_id: option ? option.value : "",
                      })
                    }
                    isClearable
                    placeholder="Select a community..."
                    styles={{
                      control: (base) => ({ ...base, minHeight: "56px" }),
                      menu: (base) => ({
                        ...base,
                        zIndex: 13000,
                        position: "absolute",
                      }),
                      menuPortal: (base) => ({ ...base, zIndex: 13000 }),
                    }}
                    menuPortalTarget={document.body}
                    menuPosition="absolute"
                    menuShouldBlockScroll={true}
                  />
                </Grid>
              )}
              {/* Position Assignment Inline */}
              <Grid item xs={12} md={6}>
                <ReactSelect
                  options={getTitleOptions()}
                  value={
                    formData.title
                      ? {
                          value: formData.title,
                          label: formData.title,
                          group: formData.group,
                        }
                      : null
                  }
                  onChange={handleTitleChange}
                  isClearable
                  placeholder="Select a title..."
                  styles={{
                    control: (base) => ({
                      ...base,
                      minHeight: "56px",
                    }),
                    menu: (base) => ({
                      ...base,
                      zIndex: 13000,
                      position: "absolute",
                    }),
                    menuPortal: (base) => ({
                      ...base,
                      zIndex: 13000,
                    }),
                  }}
                  menuPortalTarget={document.body}
                  menuPosition="absolute"
                  menuShouldBlockScroll={true}
                />
              </Grid>
            </Grid>
          )}

          {/* Position Assignment for State Level */}
          {formData.assignment_level === "state" && (
            <>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12}>
                  <ReactSelect
                    options={getTitleOptions()}
                    value={
                      formData.title
                        ? {
                            value: formData.title,
                            label: formData.title,
                            group: formData.group,
                          }
                        : null
                    }
                    onChange={handleTitleChange}
                    isClearable
                    placeholder="Select a title..."
                    styles={{
                      control: (base) => ({
                        ...base,
                        minHeight: "56px",
                      }),
                      menu: (base) => ({
                        ...base,
                        zIndex: 13000,
                        position: "absolute",
                      }),
                      menuPortal: (base) => ({
                        ...base,
                        zIndex: 13000,
                      }),
                    }}
                    menuPortalTarget={document.body}
                    menuPosition="absolute"
                    menuShouldBlockScroll={true}
                  />
                </Grid>
              </Grid>
            </>
          )}

          {/* Basic Information */}
          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            Basic Information
          </Typography>

          <Grid container spacing={2}>
            {/* Profile Picture Upload Section */}
            <Grid item xs={12} sm={3}>
              <Box
                sx={{ mb: 3, display: "flex", alignItems: "center", gap: 3 }}
              >
                <Avatar
                  src={formData.profile_picture_url}
                  sx={{
                    width: 100,
                    height: 100,
                    bgcolor: formData.profile_picture_url
                      ? "transparent"
                      : "grey.300",
                  }}
                >
                  {!formData.profile_picture_url && (
                    <PersonIcon sx={{ fontSize: 40 }} />
                  )}
                </Avatar>

                <Box>
                  <input
                    accept="image/*"
                    style={{ display: "none" }}
                    id="profile-picture-upload"
                    type="file"
                    onChange={handleFileUpload}
                    disabled={uploadLoading}
                  />
                  <label htmlFor="profile-picture-upload">
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={
                        uploadLoading ? (
                          <CircularProgress size={20} />
                        ) : (
                          <CloudUploadIcon />
                        )
                      }
                      disabled={uploadLoading}
                      sx={{ mb: 1 }}
                    >
                      {uploadLoading ? "Uploading..." : "Upload Photo"}
                    </Button>
                  </label>
                  <Box
                    sx={{
                      mt: 1,
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    <Tooltip title="Recommended: Square image, at least 200x200px">
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ cursor: "help" }}
                      >
                        Need Help? <InfoIcon />
                      </Typography>
                    </Tooltip>
                  </Box>
                  {formData.profile_picture_url && (
                    <Button
                      size="small"
                      color="error"
                      onClick={() =>
                        setFormData({ ...formData, profile_picture_url: "" })
                      }
                      sx={{ mt: 1 }}
                    >
                      Remove Photo
                    </Button>
                  )}
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} sm={9} gap={2} container>
              <Grid item xs={12} sm={3.5}>
                <TextField
                  label="First Name"
                  required
                  fullWidth
                  sx={{ mt: 0 }}
                  value={formData.first_name}
                  onChange={(e) =>
                    setFormData({ ...formData, first_name: e.target.value })
                  }
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={3.5}>
                <TextField
                  label="Last Name"
                  required
                  sx={{ mt: 0 }}
                  fullWidth
                  value={formData.last_name}
                  onChange={(e) =>
                    setFormData({ ...formData, last_name: e.target.value })
                  }
                  margin="normal"
                />
              </Grid>
              <Grid
                item
                xs={12}
                sm={4}
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 2,
                  mt: 0,
                  minWidth: 250,
                  maxWidth: 400,
                }}
              >
                <FormControl
                  component="fieldset"
                  sx={{
                    flexDirection: "row",
                    alignItems: "center",
                    width: "100%",
                    height: "56px",
                    alignSelf: "baseline",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    flexGrow: 1,
                  }}
                >
                  <FormLabel
                    id="gender-radio-buttons-group-label"
                    sx={{
                      ml: "14px",
                      color: "text.secondary",
                      fontSize: "16",
                      marginRight: 2,
                      whiteSpace: "nowrap",
                      flexShrink: 0,
                    }}
                  >
                    Gender *
                  </FormLabel>
                  <RadioGroup
                    row
                    aria-labelledby="gender-radio-buttons-group-label"
                    name="gender-row-radio-buttons-group"
                    value={formData.gender}
                    onChange={(e) =>
                      setFormData({ ...formData, gender: e.target.value })
                    }
                    sx={{ flexGrow: 1, justifyContent: "flex-end" }}
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
              <Grid item xs={12} sm={3.5} sx={{ mt: 0 }}>
                <TextField
                  label="Email"
                  type="email"
                  required
                  sx={{ mt: 0 }}
                  fullWidth
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  margin="normal"
                />
              </Grid>

              <Grid item xs={12} sm={3.5}>
                <TextField
                  label="Phone Number"
                  type="tel"
                  fullWidth
                  required
                  sx={{ mt: 0 }}
                  value={formData.contact_number}
                  onChange={(e) =>
                    setFormData({ ...formData, contact_number: e.target.value })
                  }
                  margin="normal"
                />
              </Grid>
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
                    color: "text.primary",
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
          disabled={uploadLoading}
        >
          {missionary ? "Update" : "Create"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export { MissionaryDialog };
