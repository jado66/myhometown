"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Grid,
  Radio,
  RadioGroup,
  FormControlLabel,
  Paper,
  TextField,
  Divider,
} from "@mui/material";
import GroupIcon from "@mui/icons-material/Group";
import HomeIcon from "@mui/icons-material/Home";
import VolunteerActivismIcon from "@mui/icons-material/VolunteerActivism";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { useDayOfServiceId } from "@/contexts/DayOfServiceIdProvider";
import { useDaysOfService } from "@/hooks/useDaysOfService";
import { useDaysOfServiceProjects } from "@/hooks/useDaysOfServiceProjects";
import { Dangerous, Warning } from "@mui/icons-material";

// WhoAreYou Component using MUI
export const WhoAreYouComponent = ({
  field,
  config,
  value,
  onChange,
  error,
}) => {
  // Initialize with a default tab index of 0 (Missionary)

  const [dayOfService, setDayOfService] = useState(null);
  const [partnerStakes, setPartnerStakes] = useState([]);
  const [groups, setGroups] = useState([]);
  const [groupsLoading, setGroupsLoading] = useState(false);

  const [activeTab, setActiveTab] = useState(-1);
  const [organization, setOrganization] = useState(
    value?.type === "groupMember" ? value?.value?.split(" - ")[0] : ""
  );
  const [group, setGroup] = useState(
    value?.type === "groupMember" ? value?.value?.split(" - ")[1] : ""
  );
  const [otherText, setOtherText] = useState(
    value?.type === "other" &&
      !["City Staff", "Family Member/Friend"].includes(value?.value)
      ? value?.value
      : ""
  );

  const { dayOfServiceId } = useDayOfServiceId();

  const { fetchDayOfService } = useDaysOfService();
  const { fetchProjectsByDaysOfStakeId } = useDaysOfServiceProjects();

  useEffect(() => {
    if (dayOfServiceId) {
      const fetchDayOfServiceById = async () => {
        try {
          const { data } = await fetchDayOfService(dayOfServiceId);
          setDayOfService(data);

          // Parse the partner_stakes array
          if (data.partner_stakes && data.partner_stakes.length > 0) {
            const parsedStakes = data.partner_stakes
              .map((stakeStr) => {
                try {
                  return JSON.parse(stakeStr);
                } catch (e) {
                  console.error("Error parsing stake data:", e);
                  return null;
                }
              })
              .filter(Boolean); // Remove any null values

            setPartnerStakes(parsedStakes);
          }
        } catch (error) {
          console.error("Error fetching day of service by ID", error);
        }
      };

      fetchDayOfServiceById();
    }
  }, [dayOfServiceId]);

  // Initialize state based on existing value or defaults
  // Set active tab based on formData.type if available
  useEffect(() => {
    if (value?.type) {
      switch (value.type) {
        case "myHometown":
          setActiveTab(0);
          break;
        case "volunteer":
          setActiveTab(1);
          break;
        case "groupMember":
          setActiveTab(2);
          break;
        case "other":
          setActiveTab(3);
          break;
        default:
          setActiveTab(0);
      }
    }
  }, []);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);

    // Set type based on tab selection
    let type;
    switch (newValue) {
      case 0:
        type = "missionary";
        break;
      case 1:
        type = "volunteer";
        break;
      case 2:
        type = "groupMember";
        break;
      case 3:
        type = "other";
        break;
      default:
        type = "missionary";
    }

    // Update formData and parent component
    const updatedFormData = {
      type,
    };

    onChange(updatedFormData);
  };

  // Handle group member organization selection
  const handleOrganizationChange = async (e) => {
    const stakeId = e.target.value;
    setOrganization(stakeId);
    setGroup(""); // Reset group selection when organization changes

    // Initialize with empty form data
    const updatedFormData = {
      type: "groupMember",
      value: `${stakeId} - `,
    };

    onChange(updatedFormData);

    // Only fetch groups if a stake is selected
    if (stakeId) {
      try {
        setGroupsLoading(true);

        // Fetch projects for this stake
        const projects = await fetchProjectsByDaysOfStakeId(stakeId, false);

        if (projects && projects.length > 0) {
          // Extract unique partner_ward values
          const uniqueGroups = [
            ...new Set(
              projects
                .map((project) => project.partner_ward)
                .filter((ward) => ward) // Filter out undefined/null/empty values
            ),
          ].sort(); // Sort alphabetically

          setGroups(uniqueGroups);
        } else {
          setGroups([]);
        }
      } catch (error) {
        console.error("Error fetching groups for stake:", error);
        setGroups([]);
      } finally {
        setGroupsLoading(false);
      }
    } else {
      setGroups([]);
    }
  };

  // Handle group member group selection
  const handleGroupChange = (e) => {
    const groupName = e.target.value;
    setGroup(groupName);

    const updatedFormData = {
      type: "groupMember",
      value: `${organization} - ${groupName}`,
    };

    onChange(updatedFormData);
  };

  // Handle other source selection
  const handleOtherSourceChange = (e) => {
    const source = e.target.value;
    const updatedFormData = {
      type: "other",
      value: source === "Other" ? otherText : source,
    };

    onChange(updatedFormData);
  };

  // Handle other text input
  const handleOtherTextChange = (e) => {
    const text = e.target.value;
    setOtherText(text);

    const updatedFormData = {
      type: "other",
      value: text,
    };

    onChange(updatedFormData);
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Typography
        variant="h6"
        color="text.primary"
        sx={{ mb: 2, fontWeight: 600, color: "#318D43" }}
      >
        {config.label} *
      </Typography>
      {config.helpText && activeTab < 0 && (
        <FormHelperText
          sx={{
            mt: 1,
            color: "text.secondary",
            fontSize: "0.875rem",
          }}
        >
          {config.helpText}
        </FormHelperText>
      )}
      <FormControl component="fieldset" sx={{ width: "100%" }}>
        <RadioGroup
          value={activeTab}
          onChange={(e, newValue) =>
            handleTabChange(null, Number.parseInt(newValue))
          }
          sx={{ width: "100%" }}
        >
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Paper
                elevation={activeTab === 2 ? 3 : 0}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  transition: "all 0.3s ease",
                  height: "100%",
                  border: "1px solid",
                  borderColor: activeTab === 2 ? "primary.main" : "divider",
                  backgroundColor:
                    activeTab === 2 ? "rgba(25, 118, 210, 0.05)" : "white",
                  "&:hover": {
                    borderColor: "primary.main",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  },
                }}
              >
                <FormControlLabel
                  value={2}
                  control={<Radio color="primary" />}
                  label={
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <GroupIcon
                        color={activeTab === 2 ? "primary" : "action"}
                      />
                      <Typography
                        fontWeight={activeTab === 2 ? 600 : 400}
                        color={
                          activeTab === 2 ? "primary.main" : "text.primary"
                        }
                      >
                        Organization/Group
                      </Typography>
                    </Box>
                  }
                />

                <FormHelperText sx={{ ml: 4, mt: 1 }}>
                  Select this if you represent an organization/stake or
                  group/ward
                </FormHelperText>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Paper
                elevation={activeTab === 1 ? 3 : 0}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  transition: "all 0.3s ease",
                  height: "100%",
                  border: "1px solid",
                  borderColor: activeTab === 1 ? "primary.main" : "divider",
                  backgroundColor:
                    activeTab === 1 ? "rgba(25, 118, 210, 0.05)" : "white",
                  "&:hover": {
                    borderColor: "primary.main",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  },
                }}
              >
                <FormControlLabel
                  value={1}
                  control={<Radio color="primary" />}
                  label={
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <HomeIcon
                        color={activeTab === 1 ? "primary" : "action"}
                      />
                      <Typography
                        fontWeight={activeTab === 1 ? 600 : 400}
                        color={
                          activeTab === 1 ? "primary.main" : "text.primary"
                        }
                      >
                        Neighborhood
                      </Typography>
                    </Box>
                  }
                />
                <FormHelperText sx={{ ml: 4, mt: 1 }}>
                  Select this if you are from West Valley City
                </FormHelperText>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Paper
                elevation={activeTab === 0 ? 3 : 0}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  transition: "all 0.3s ease",
                  height: "100%",
                  border: "1px solid",
                  borderColor: activeTab === 0 ? "primary.main" : "divider",
                  backgroundColor:
                    activeTab === 0 ? "rgba(25, 118, 210, 0.05)" : "white",
                  "&:hover": {
                    borderColor: "primary.main",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  },
                }}
              >
                <FormControlLabel
                  value={0}
                  control={<Radio color="primary" />}
                  label={
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <VolunteerActivismIcon
                        color={activeTab === 0 ? "primary" : "action"}
                      />
                      <Typography
                        fontWeight={activeTab === 0 ? 600 : 400}
                        color={
                          activeTab === 0 ? "primary.main" : "text.primary"
                        }
                      >
                        myHometown Volunteer
                      </Typography>
                    </Box>
                  }
                />
                <FormHelperText sx={{ ml: 4, mt: 1 }}>
                  Select this if you are an official missionary/volunteer of
                  myHometown
                </FormHelperText>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Paper
                elevation={activeTab === 3 ? 3 : 0}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  transition: "all 0.3s ease",
                  height: "100%",
                  border: "1px solid",
                  borderColor: activeTab === 3 ? "primary.main" : "divider",
                  backgroundColor:
                    activeTab === 3 ? "rgba(25, 118, 210, 0.05)" : "white",
                  "&:hover": {
                    borderColor: "primary.main",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  },
                }}
              >
                <FormControlLabel
                  value={3}
                  control={<Radio color="primary" />}
                  label={
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <MoreHorizIcon
                        color={activeTab === 3 ? "primary" : "action"}
                      />
                      <Typography
                        fontWeight={activeTab === 3 ? 600 : 400}
                        color={
                          activeTab === 3 ? "primary.main" : "text.primary"
                        }
                      >
                        Other
                      </Typography>
                    </Box>
                  }
                />
                <FormHelperText sx={{ ml: 4, mt: 1 }}>
                  Select this if no other options apply to you
                </FormHelperText>
              </Paper>
            </Grid>
          </Grid>
        </RadioGroup>
      </FormControl>
      {/* Group Member Tab */}
      {activeTab === 2 && (
        <>
          <Divider sx={{ my: 3 }} />
          <Grid container spacing={3}>
            {dayOfServiceId ? (
              <>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel id="organization-label">
                      Which organization are you from?
                    </InputLabel>
                    <Select
                      labelId="organization-label"
                      value={organization}
                      onChange={handleOrganizationChange}
                      label="Which organization are you from?"
                      required={config.required}
                      sx={{ borderRadius: 1 }}
                    >
                      <MenuItem value="">Select an organization</MenuItem>
                      {partnerStakes.map((stake) => (
                        <MenuItem key={stake.id} value={stake.id}>
                          {stake.name}
                        </MenuItem>
                      ))}
                    </Select>
                    {!organization && (
                      <FormHelperText>
                        Please select your organization
                      </FormHelperText>
                    )}
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel id="group-label">
                      Which group are you from?
                    </InputLabel>
                    <Select
                      labelId="group-label"
                      value={group}
                      onChange={handleGroupChange}
                      label="Which group are you from?"
                      required={config.required}
                      disabled={!organization || groupsLoading}
                      sx={{ borderRadius: 1 }}
                    >
                      <MenuItem value="">Select a group</MenuItem>
                      {groups.map((groupName) => (
                        <MenuItem key={groupName} value={groupName}>
                          {groupName}
                        </MenuItem>
                      ))}
                      {groupsLoading && (
                        <MenuItem disabled>Loading groups...</MenuItem>
                      )}
                      {!groupsLoading &&
                        groups.length === 0 &&
                        organization && (
                          <MenuItem disabled>No groups found</MenuItem>
                        )}
                    </Select>
                    {organization && !group && !groupsLoading && (
                      <FormHelperText>Please select your group</FormHelperText>
                    )}
                    {groupsLoading && (
                      <FormHelperText>
                        Loading available groups...
                      </FormHelperText>
                    )}
                  </FormControl>
                </Grid>
              </>
            ) : (
              <Grid item xs={12} md={6}>
                <Typography
                  variant="body1"
                  display="flex"
                  alignItems="center"
                  sx={{ color: "red" }}
                >
                  <Warning sx={{ mr: 1 }} />
                  Please select a day of service
                </Typography>
              </Grid>
            )}
          </Grid>
        </>
      )}
      {/* Other Tab */}
      {activeTab === 3 && (
        <>
          <Divider sx={{ my: 3 }} />
          <Box>
            <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
              <InputLabel id="other-source-label">
                Where are you from?
              </InputLabel>
              <Select
                labelId="other-source-label"
                value={
                  ["City Staff", "Family Member/Friend", "Other"].includes(
                    value?.value
                  )
                    ? value?.value
                    : "Other"
                }
                onChange={handleOtherSourceChange}
                label="Where are you from?"
                required={config.required}
                sx={{ borderRadius: 1 }}
              >
                <MenuItem value="">Select a source</MenuItem>
                <MenuItem value="City Staff">City Staff</MenuItem>
                <MenuItem value="Family Member/Friend">
                  Family Member/Friend
                </MenuItem>
                <MenuItem value="Other">Other (specify below)</MenuItem>
              </Select>
            </FormControl>

            {(value?.value === "Other" ||
              (value?.type === "other" &&
                !["City Staff", "Family Member/Friend"].includes(
                  value?.value
                ))) && (
              <TextField
                fullWidth
                label="Please specify"
                variant="outlined"
                value={otherText}
                onChange={handleOtherTextChange}
                sx={{ mt: 2, borderRadius: 1 }}
                required={config.required}
              />
            )}
          </Box>
        </>
      )}
      {error && (
        <FormHelperText
          error
          sx={{
            mt: 1,
            fontSize: "0.875rem",
            fontWeight: 500,
            display: "flex",
            alignItems: "center",
            gap: 0.5,
          }}
        >
          {error}
        </FormHelperText>
      )}
    </Box>
  );
};
