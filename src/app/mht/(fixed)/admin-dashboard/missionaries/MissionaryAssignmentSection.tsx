import React, { useMemo, useCallback, useRef } from "react";
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
  errors?: { [key: string]: string };
  missionary?: any;
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

// Debounce utility outside component to avoid recreation
function debounce<T extends (...args: any[]) => void>(func: T, wait: number) {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

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
  errors = {},
  missionary,
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

  // Debounced handler for duration input
  const debouncedSetDuration = useRef(
    debounce((val: string) => {
      let rounded = Math.round(Number(val));
      if (!val || isNaN(rounded) || rounded < 1) {
        setFormData((prev: any) => ({
          ...prev,
          duration: "",
        }));
      } else {
        setFormData((prev: any) => ({
          ...prev,
          duration: String(rounded),
        }));
      }
    }, 100)
  );

  const handleDurationChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      // Only allow whole numbers (no decimals, no non-numeric)
      if (/^\d*$/.test(val)) {
        debouncedSetDuration.current(val);
      }
      // else ignore input
    },
    []
  );

  const formattedDuration = formData.duration
    ? formData.duration.split(" ")[0]
    : "";

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
            <Grid item xs={12} md={4}>
              <Typography
                variant="body2"
                sx={{ mb: 1, fontWeight: 500 }}
                color="#318D43"
              >
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
              {errors.city_id && (
                <Typography color="error" variant="caption">
                  {errors.city_id}
                </Typography>
              )}
            </Grid>
          )}
          {formData.assignment_level === "community" && (
            <Grid item xs={12} md={4}>
              <Typography
                variant="body2"
                sx={{ mb: 1, fontWeight: 500 }}
                color="#318D43"
              >
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
              {errors.community_id && (
                <Typography color="error" variant="caption">
                  {errors.community_id}
                </Typography>
              )}
            </Grid>
          )}
          <Grid item xs={12} md={formData.assignment_level === "state" ? 8 : 4}>
            <Typography
              variant="body2"
              color="#318D43"
              sx={{ mb: 1, fontWeight: 500 }}
            >
              Position
            </Typography>
            <ThemedReactSelect
              options={titleOptions}
              value={selectedTitle}
              onChange={handleTitleChange}
              isClearable
              placeholder="Select a position..."
              isSearchable
              blurInputOnSelect
              closeMenuOnSelect
              getOptionLabel={(option: any) => option.label}
              getOptionValue={(option: any) => option.value}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography
              variant="body2"
              color="#318D43"
              sx={{ mb: 1, fontWeight: 500 }}
            >
              Position Detail (Optional)
            </Typography>
            <TextField
              type="text"
              fullWidth
              size="small"
              value={formData.position_detail}
              onChange={(e) =>
                setFormData((prev: any) => ({
                  ...prev,
                  position_detail: e.target.value,
                }))
              }
              InputLabelProps={{ shrink: true }}
              error={!!errors.position_detail}
              helperText={errors.position_detail}
            />
          </Grid>
          {errors.group && (
            <Typography color="error" variant="caption" sx={{ ml: 3 }}>
              Position is recommended. Please select a position if possible.
            </Typography>
          )}
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
              error={!!errors.start_date}
              helperText={errors.start_date}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              label="Duration"
              type="text"
              fullWidth
              size="small"
              value={formattedDuration}
              onChange={handleDurationChange}
              InputProps={{
                endAdornment: (
                  <Typography
                    variant="body2"
                    sx={{ ml: 1 }}
                    color="text.secondary"
                  >
                    months
                  </Typography>
                ),
              }}
              error={!!errors.duration}
              helperText={errors.duration || "Enter a whole number (months)"}
            />
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
              value={calculateEndDate(
                formData.start_date,
                formData.duration ? `${formData.duration} months` : ""
              )}
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
