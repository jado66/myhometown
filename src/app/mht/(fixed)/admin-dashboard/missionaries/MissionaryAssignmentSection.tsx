import React, { useMemo } from "react";
import {
  Card,
  CardContent,
  Box,
  Typography,
  Divider,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  TextField,
} from "@mui/material";
import AssignmentIcon from "@mui/icons-material/Assignment";
import BusinessIcon from "@mui/icons-material/Business";
import LocationCityIcon from "@mui/icons-material/LocationCity";
import GroupIcon from "@mui/icons-material/Group";
import VolunteerIcon from "@mui/icons-material/VolunteerActivism";
import BadgeIcon from "@mui/icons-material/Badge";
import ThemedReactSelect from "@/components/ThemedReactSelect";

interface MissionaryAssignmentSectionProps {
  formData: any;
  setFormData: (fn: (prev: any) => any) => void;
  getCityOptions: () => any;
  getAvailableCities: () => any;
  getCommunityOptions: () => any;
  getAvailableCommunities: () => any;
  getTitleOptions: () => any;
  handlePersonTypeChange: (type: string) => void;
  handleAssignmentLevelChange: (level: string) => void;
  handleTitleChange: (option: any) => void;
  calculateEndDate: (startDate: string, duration: string) => string;
}

const personTypeCards = [
  {
    value: "missionary",
    icon: BadgeIcon,
    title: "Missionary",
    desc: "Full-time missionary service",
  },
  {
    value: "volunteer",
    icon: VolunteerIcon,
    title: "Volunteer",
    desc: "Volunteer service assignment",
  },
];

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

const MissionaryAssignmentSection: React.FC<
  MissionaryAssignmentSectionProps
> = ({
  formData,
  setFormData,
  getCityOptions,
  getAvailableCities,
  getCommunityOptions,
  getAvailableCommunities,
  getTitleOptions,
  handlePersonTypeChange,
  handleAssignmentLevelChange,
  handleTitleChange,
  calculateEndDate,
}) => {
  // Memoize options to prevent recreation on every render
  const cityOptions = useMemo(() => getCityOptions(), [getCityOptions]);
  const communityOptions = useMemo(
    () => getCommunityOptions(),
    [getCommunityOptions]
  );
  const titleOptions = useMemo(() => getTitleOptions(), [getTitleOptions]);
  const availableCities = useMemo(
    () => getAvailableCities(),
    [getAvailableCities]
  );
  const availableCommunities = useMemo(
    () => getAvailableCommunities(),
    [getAvailableCommunities]
  );

  // Memoize selected values to maintain object reference stability
  const selectedCity = useMemo(() => {
    if (!formData.city_id) return null;

    const selected = availableCities.find(
      (city: any) => (city._id || city.id) === formData.city_id
    );

    return selected
      ? {
          value: selected._id || selected.id,
          label: `${selected.name}, ${selected.state}`,
          city: selected.name,
          state: selected.state,
        }
      : null;
  }, [formData.city_id, availableCities]);

  const selectedCommunity = useMemo(() => {
    if (!formData.community_id) return null;

    const selected = availableCommunities.find(
      (comm: any) => (comm._id || comm.id) === formData.community_id
    );

    return selected
      ? {
          value: selected._id || selected.id,
          label: `${selected.name} (${selected.city}, ${selected.state})`,
          city: selected.city,
          state: selected.state,
        }
      : null;
  }, [formData.community_id, availableCommunities]);

  const selectedTitle = useMemo(() => {
    return formData.title
      ? {
          value: formData.title,
          label: formData.title,
          group: formData.group,
        }
      : null;
  }, [formData.title, formData.group]);

  return (
    <Card variant="outlined" sx={{ mb: 3, overflow: "visible" }}>
      <CardContent sx={{ p: 3, overflow: "visible" }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <AssignmentIcon sx={{ mr: 1, color: "primary.main" }} />
          <Typography variant="h6" fontWeight="bold">
            Assignment Details
          </Typography>
        </Box>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {personTypeCards.map(({ value, icon: Icon, title, desc }) => (
            <Grid item xs={6} key={value}>
              <Card
                elevation={formData.person_type === value ? 3 : 1}
                sx={{
                  p: 2,
                  cursor: "pointer",
                  border:
                    formData.person_type === value ? "2px solid" : "1px solid",
                  borderColor:
                    formData.person_type === value ? "primary.main" : "divider",
                  backgroundColor:
                    formData.person_type === value
                      ? "primary.50"
                      : "background.paper",
                  "&:hover": { borderColor: "primary.light", elevation: 2 },
                }}
                onClick={() => handlePersonTypeChange(value)}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Icon
                    sx={{
                      color:
                        formData.person_type === value
                          ? "primary.main"
                          : "text.secondary",
                      fontSize: 24,
                    }}
                  />
                  <Box>
                    <Typography variant="body2" fontWeight="bold">
                      {title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {desc}
                    </Typography>
                  </Box>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
        <Divider sx={{ mb: 3, mt: 1.5 }} />
        <Grid container spacing={1} sx={{ mb: 2 }}>
          {levelCards.map(({ value, icon: Icon, title }) => (
            <Grid item xs={4} key={value}>
              <Card
                elevation={formData.assignment_level === value ? 3 : 1}
                sx={{
                  p: 1.5,
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
                  "&:hover": { borderColor: "primary.light" },
                }}
                onClick={() => handleAssignmentLevelChange(value)}
              >
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    textAlign: "center",
                    gap: 0.5,
                  }}
                >
                  <Icon
                    sx={{
                      color:
                        formData.assignment_level === value
                          ? "primary.main"
                          : "text.secondary",
                      fontSize: 20,
                    }}
                  />
                  <Typography variant="caption" fontWeight="bold">
                    {title.replace(" Assignment", "")}
                  </Typography>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
        <Box sx={{ flexGrow: 1, minHeight: 6 }} />
        <Grid container spacing={2} sx={{ mb: 2 }}>
          {formData.assignment_level === "city" && (
            <Grid item xs={12} md={6}>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                City Assignment
              </Typography>
              <ThemedReactSelect
                options={cityOptions}
                value={selectedCity}
                onChange={(option: any) =>
                  setFormData((prev: any) => ({
                    ...prev,
                    city_id: option?.value || "",
                  }))
                }
                isClearable
                placeholder="Select a city..."
                isSearchable
                blurInputOnSelect
                closeMenuOnSelect
                getOptionLabel={(option: any) => option.label}
                getOptionValue={(option: any) => option.value}
              />
            </Grid>
          )}
          {formData.assignment_level === "community" && (
            <Grid item xs={12} md={6}>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                Community Assignment
              </Typography>
              <ThemedReactSelect
                options={communityOptions}
                value={selectedCommunity}
                onChange={(option: any) =>
                  setFormData((prev: any) => ({
                    ...prev,
                    community_id: option?.value || "",
                  }))
                }
                isClearable
                placeholder="Select a community..."
                isSearchable
                blurInputOnSelect
                closeMenuOnSelect
                getOptionLabel={(option: any) => option.label}
                getOptionValue={(option: any) => option.value}
              />
            </Grid>
          )}
          <Grid
            item
            xs={12}
            md={formData.assignment_level === "state" ? 12 : 6}
          >
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
              Position
            </Typography>
            <ThemedReactSelect
              options={titleOptions}
              value={selectedTitle}
              onChange={handleTitleChange}
              isClearable
              placeholder="Select a title..."
              isSearchable
              blurInputOnSelect
              closeMenuOnSelect
              getOptionLabel={(option: any) => option.label}
              getOptionValue={(option: any) => option.value}
            />
          </Grid>
        </Grid>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField
              label={
                formData.person_type === "missionary"
                  ? "Call Date"
                  : "Start Date"
              }
              type="date"
              fullWidth
              size="small"
              value={
                formData.start_date ? formData.start_date.split("T")[0] : ""
              }
              onChange={(e) =>
                setFormData((prev: any) => ({
                  ...prev,
                  start_date: e.target.value,
                }))
              }
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel id="assignment-duration">Duration</InputLabel>
              <Select
                label="Duration"
                fullWidth
                value={formData.duration}
                onChange={(e) =>
                  setFormData((prev: any) => ({
                    ...prev,
                    duration: e.target.value,
                  }))
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
          <Grid item xs={12} md={4}>
            <TextField
              label={
                formData.person_type === "missionary"
                  ? "Release Date (Calculated)"
                  : "End Date (Calculated)"
              }
              type="date"
              InputProps={{ readOnly: true }}
              fullWidth
              size="small"
              value={calculateEndDate(formData.start_date, formData.duration)}
              sx={{
                "& .MuiInputBase-input": {
                  color: "text.primary",
                  backgroundColor: "grey.100",
                },
              }}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default MissionaryAssignmentSection;
