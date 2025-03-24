"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  FormControl,
  InputLabel,
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
import { AccountBalance, Dangerous, Warning } from "@mui/icons-material";
import { useClassSignup } from "../ClassSignupContext";
import Select from "react-select"; // Import react-select
import JsonViewer from "@/components/util/debug/DebugOutput";

// WhoAreYou Component using React Select for searchable dropdown
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

  const [selectedProject, setSelectedProject] = useState(null);

  const [projects, setProjects] = useState([]);

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
  const { fetchProjectsByDaysOfServiceId } = useDaysOfServiceProjects();
  const { resetKey } = useClassSignup();

  useEffect(() => {
    if (dayOfServiceId) {
      const fetchDayOfServiceById = async () => {
        try {
          const { data: daysOfService } = await fetchDayOfService(
            dayOfServiceId
          );
          setDayOfService(daysOfService);

          const projects = await fetchProjectsByDaysOfServiceId(
            daysOfService.id,
            false
          );

          if (projects) {
            setProjects(projects);
          }

          // Parse the partner_stakes array
        } catch (error) {
          console.error("Error fetching day of service by ID", error);
        }
      };

      fetchDayOfServiceById();
    }
  }, [dayOfServiceId]);

  //reset
  useEffect(() => {
    if (resetKey) {
      setActiveTab(-1);
      setOrganization("");
      setGroup("");
      setOtherText("");
    }
  }, [resetKey]);

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
        case "cityStaff":
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
        type = "cityStaff";
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

  // Create options for react-select
  const organizationOptions = partnerStakes.map((stake) => ({
    value: stake.id,
    label: stake.name,
  }));

  // Handle group member organization selection with react-select

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

  const handleProjectChange = (selectedOption) => {
    if (selectedOption) {
      setSelectedProject(selectedOption);
      const updatedFormData = {
        type: "groupMember",
        value: selectedOption.label,
      };

      onChange(updatedFormData);
    }
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

  // Find the current organization option for react-select
  const groupProjectOptions = projects.map((project, index) => ({
    value: project.id,
    label: `${index + 1} ${project.partner_ward} - ${project.project_name}`,
  }));
  // .sort((a, b) => a.label.localeCompare(b.label));

  // Custom styles for react-select
  const customSelectStyles = {
    control: (provided) => ({
      ...provided,
      borderRadius: "4px",
      minHeight: "56px",
      boxShadow: "none",
      "&:hover": {
        borderColor: "#90caf9",
      },
    }),
    placeholder: (provided) => ({
      ...provided,
      color: "#757575",
    }),
    menu: (provided) => ({
      ...provided,
      zIndex: 9999,
    }),
  };

  return (
    <Box sx={{ mb: 3 }}>
      <JsonViewer data={projects} />

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
            mt: 1.25,
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
                      <AccountBalance
                        color={activeTab === 3 ? "primary" : "action"}
                      />
                      <Typography
                        fontWeight={activeTab === 3 ? 600 : 400}
                        color={
                          activeTab === 3 ? "primary.main" : "text.primary"
                        }
                      >
                        City Staff
                      </Typography>
                    </Box>
                  }
                />
                <FormHelperText sx={{ ml: 4, mt: 1 }}>
                  Select this if you are a city staff member
                </FormHelperText>
              </Paper>
            </Grid>
          </Grid>
        </RadioGroup>
      </FormControl>
      {/* Group Member Tab */}
      {activeTab !== -1 && (
        <>
          <Divider sx={{ my: 3 }} />
          <Grid container spacing={3}>
            {dayOfServiceId ? (
              <>
                <Grid item xs={12}>
                  <FormControl fullWidth variant="outlined">
                    <Typography variant="body2" sx={{ mb: 1, ml: 1 }}>
                      Which group and project are you assigned to?
                    </Typography>
                    <Select
                      value={selectedProject}
                      onChange={handleProjectChange}
                      options={groupProjectOptions}
                      placeholder="Search for an organization..."
                      isClearable
                      isSearchable
                      styles={customSelectStyles}
                      className="react-select-container"
                      classNamePrefix="react-select"
                    />
                    {!organization && (
                      <FormHelperText>
                        Please select your group and project
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
      {activeTab === 3 && <></>}
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
