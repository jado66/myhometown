"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Paper,
  Chip,
  Divider,
  CircularProgress,
  Alert,
  Checkbox,
  Tooltip,
  Menu,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CardHeader,
  useTheme,
  useMediaQuery,
  SvgIcon,
} from "@mui/material";
import {
  Add as AddIcon,
  Assignment,
  CalendarToday,
  Check,
  CheckCircle,
  Delete,
  Delete as DeleteIcon,
  Edit,
  Email,
  ExpandMore,
  Flag,
  Group,
  Info,
  LocationOn,
  Phone,
  Timeline as TimelineIcon,
} from "@mui/icons-material";
import { v4 as uuidv4 } from "uuid";
import moment from "moment";
import { toast } from "react-toastify";
import MoreVertIcon from "@mui/icons-material/MoreVert";

import { useLocalStorageProjectForms } from "@/hooks/use-local-storage-project-forms";
import { supabase } from "@/util/supabase";
import { useCommunities } from "@/hooks/use-communities";
import { useDaysOfServiceProjects } from "@/hooks/useDaysOfServiceProjects";
import { useDaysOfService } from "@/hooks/useDaysOfService";
import { useUser } from "@/hooks/use-user";

import AskYesNoDialog from "@/components/util/AskYesNoDialog";
import DosBreadcrumbs from "@/components/days-of-service/DosBreadcrumbs";
import Loading from "@/components/util/Loading";

export default function ProjectFormsPage({ params }) {
  const { stakeId, communityId, date } = params;
  const router = useRouter();
  const { user } = useUser();

  const theme = useTheme();

  // State management
  const [dayOfService, setDayOfService] = useState();
  const [daysOfServiceLoading, setDaysOfServiceLoading] = useState(true);
  const [cityId, setCityId] = useState();
  const [projects, setProjects] = useState([]);
  const [creatingProject, setCreatingProject] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [partnerWardDialogOpen, setPartnerWardDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const [menuAnchorEl, setMenuAnchorEl] = useState({});

  // Replace your current handleMenuClick and handleMenuClose functions with these
  const handleMenuClick = (event, projectId) => {
    event.stopPropagation();
    console.log("Menu clicked for project ID:", projectId);
    console.log("Current target:", event.currentTarget);
    setMenuAnchorEl((prev) => {
      const newState = {
        ...prev,
        [projectId]: event.currentTarget,
      };
      console.log("New menuAnchorEl state:", newState);
      return newState;
    });
  };

  const handleMenuClose = (projectId) => {
    console.log("Closing menu for project ID:", projectId);
    setMenuAnchorEl((prev) => {
      const newState = {
        ...prev,
        [projectId]: null,
      };
      console.log("Updated menuAnchorEl state:", newState);
      return newState;
    });
  };

  const [partnerWardData, setPartnerWardData] = useState({
    partner_ward: "",
    partner_ward_liaison: "",
    partner_ward_liaison_phone1: "",
    partner_ward_liaison_email1: "",
    partner_ward_liaison_phone2: "",
    partner_ward_liaison_email2: "",
  });
  const handleEditPartnerWard = (e, project) => {
    e.stopPropagation();
    setSelectedProject(project);
    setPartnerWardData({
      partner_ward: project.partner_ward || "",
      partner_ward_liaison: project.partner_ward_liaison || "",
      partner_ward_liaison2: project.partner_ward_liaison2 || "",
      partner_ward_liaison_title: project.partner_ward_liaison_title || "",
      partner_ward_liaison_title2: project.partner_ward_liaison_title2 || "",
      partner_ward_liaison_phone1: project.partner_ward_liaison_phone1 || "",
      partner_ward_liaison_email1: project.partner_ward_liaison_email1 || "",
      partner_ward_liaison_phone2: project.partner_ward_liaison_phone2 || "",
      partner_ward_liaison_email2: project.partner_ward_liaison_email2 || "",
    });
    setPartnerWardDialogOpen(true);
  };
  const handlePartnerWardChange = (field, value) => {
    setPartnerWardData((prev) => ({ ...prev, [field]: value }));
  };

  // Save Partner Group data to Supabase
  const handleSavePartnerWard = async () => {
    try {
      const { error } = await supabase
        .from("days_of_service_project_forms")
        .update(partnerWardData)
        .eq("id", selectedProject.id);

      if (error) throw error;

      setProjects((prev) =>
        prev.map((p) =>
          p.id === selectedProject.id ? { ...p, ...partnerWardData } : p,
        ),
      );
      toast.success("Partner Group information updated successfully");
      setPartnerWardDialogOpen(false);
    } catch (error) {
      console.error("Error updating Partner Group:", error);
      toast.error("Failed to update Partner Group information");
    }
  };

  // Hooks
  const { fetchNewCommunities } = useCommunities();
  const { fetchDayOfServiceByShortId } = useDaysOfService();
  const {
    fetchProjectsByDaysOfStakeId,
    deleteProject,
    error,
    addProject,
    generateReports,
  } = useDaysOfServiceProjects();

  // Fetch day of service data
  useEffect(() => {
    const fetchDays = async () => {
      try {
        const { data, error } = await fetchDayOfServiceByShortId(
          `${communityId}_${date}`,
        );

        if (error) throw error;

        const parsedData = {
          ...data,
          partner_stakes: data.partner_stakes
            .map((stake) => {
              try {
                return JSON.parse(stake);
              } catch (e) {
                console.error("Error parsing stake:", stake, e);
                return null;
              }
            })
            .filter(Boolean), // Remove any null values from parsing errors
        };

        setDayOfService(parsedData);
        setDaysOfServiceLoading(false);
      } catch (error) {
        console.error("Error fetching days of service:", error);
      }
    };

    fetchDays();
  }, [communityId, date]);

  // Fetch city and projects data
  useEffect(() => {
    if (dayOfService) {
      // Get city ID from supabase communities table
      const fetchCityId = async () => {
        const { data, error } = await fetchNewCommunities({
          query: (baseQuery) => baseQuery.eq("id", communityId),
        });

        if (error) {
          console.error("Error fetching community:", error);
          return;
        }
        if (data) {
          setCityId(data[0].city_id);
        }
      };
      fetchCityId();
    }

    if (communityId && date) {
      const fetchProjects = async () => {
        const data = await fetchProjectsByDaysOfStakeId(stakeId);
        setProjects(data);
        setIsLoading(false);
      };
      fetchProjects();
    }
  }, [dayOfService, communityId, date, stakeId]);

  // Event handlers
  const handleProjectClick = (id) => {
    router.push(
      process.env.NEXT_PUBLIC_DOMAIN +
        `/admin-dashboard/days-of-service/${communityId}/${date}/project/${id}`,
    );
  };

  const handleNewProject = async () => {
    if (error) {
      console.error("Error fetching days of service:", error);
      toast.error("Failed to fetch days of service");
      return;
    }

    setCreatingProject(true);

    try {
      const newId = uuidv4();
      await addProject(
        newId,
        dayOfService.community_id,
        dayOfService.city_id || null,
      );

      // Wait for 1.5 seconds to allow for data processing
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Redirect to the project form page with all necessary IDs
      router.push(
        `${process.env.NEXT_PUBLIC_DOMAIN}/admin-dashboard/days-of-service/${communityId}/${date}/project/${newId}`,
      );
    } catch (error) {
      console.error("Error creating new project:", error);
      toast.error("Failed to create new project");
    } finally {
      setCreatingProject(false);
    }
  };

  const handleDeleteClick = (e, project) => {
    e.stopPropagation();
    setProjectToDelete(project);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (projectToDelete) {
      try {
        await deleteProject(projectToDelete.id);
        setDeleteDialogOpen(false);
        setProjectToDelete(null);
        setSelectedProjects((prev) =>
          prev.filter((id) => id !== projectToDelete.id),
        );
        setProjects((prev) =>
          prev.filter((project) => project.id !== projectToDelete.id),
        );
        toast.success("Project deleted successfully");
      } catch (error) {
        console.error("Error deleting project:", error);
        toast.error("Failed to delete project");
      }
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setProjectToDelete(null);
  };

  const handleCheckboxChange = (e, projectId) => {
    e.stopPropagation();
    setSelectedProjects((prev) =>
      prev.includes(projectId)
        ? prev.filter((id) => id !== projectId)
        : [...prev, projectId],
    );
  };

  const handleViewTimelines = () => {
    if (selectedProjects.length === 0) {
      toast.warning("Please select at least one project");
      return;
    }

    router.push(
      process.env.NEXT_PUBLIC_DOMAIN +
        `/admin-dashboard/days-of-service/${communityId}/${date}/view-timeline?projects=${selectedProjects.join(
          ",",
        )}`,
    );
  };

  const handleGenerateSingleReport = async (e, projectId) => {
    e.stopPropagation();
    try {
      await generateReports("single", projectId, date);
    } catch (error) {
      console.error("Error generating report:", error);
      toast.error("Failed to generate project report");
    }
  };

  const handleGenerateDayOfServiceReport = async () => {
    if (!dayOfService?.id) {
      toast.error("Day of Service ID not available");
      return;
    }
    try {
      await generateReports("multiple", dayOfService.id, "daysOfServiceId");
      toast.success("Projects summary generated successfully");
    } catch (error) {
      console.error("Error generating day of service report:", error);
      toast.error("Failed to generate day of service report");
    }
  };

  // Utility functions
  const formatDate = (dateString) => {
    if (!dateString) return "";

    // First try standard moment parsing
    let parsedDate = moment(dateString);

    // If moment couldn't parse it properly, try manual parsing for MM-DD-YYYY format
    if (!parsedDate.isValid() && dateString.includes("-")) {
      const parts = dateString.split("-");
      if (parts.length === 3) {
        // If first part is 4 digits, it's likely YYYY-MM-DD already
        if (parts[0].length === 4) {
          parsedDate = moment(dateString);
        } else {
          // Otherwise, assume MM-DD-YYYY and convert to YYYY-MM-DD for better browser compatibility
          parsedDate = moment(
            `${parts[2]}-${parts[0]}-${parts[1]}`,
            "YYYY-MM-DD",
          );
        }
      }
    }

    return parsedDate.isValid()
      ? parsedDate.format("MMMM D, YYYY")
      : dateString; // Fallback to original string if parsing still fails
  };

  const getProjectTitle = (project) => {
    let projectTitle = "";

    if (project.project_name) projectTitle += project.project_name;

    // if (project.project_development_couple)
    //   projectTitle += ` -  Resource Couple: ${project.project_development_couple}`;

    if (!projectTitle) {
      return `Project ${project.id.slice(0, 8)}...`;
    }

    // Truncate title if longer than 40 characters
    return projectTitle.length > 25
      ? `${projectTitle.substring(0, 25)}...`
      : projectTitle;
  };

  // Find the current Partner Organization
  const partnerStake = dayOfService?.partner_stakes?.find(
    (stake) => stake.id === stakeId,
  );

  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  if (daysOfServiceLoading) {
    return <Loading center />;
  }

  return (
    <Box sx={{ p: { md: 4, xs: 1 } }}>
      <DosBreadcrumbs
        dayOfService={dayOfService}
        date={date}
        stakeId={stakeId}
        sx={{
          justifyContent: {
            xs: "center",
            sm: "flex-start",
          },
          mt: { xs: 2, sm: 0 },
        }}
      />

      <Typography
        variant="h3"
        gutterBottom
        sx={{
          textTransform: "capitalize",
          mb: 4,
          textAlign: { xs: "center", sm: "left" },
        }}
      >
        Projects Summary Page
      </Typography>

      {isMobile ? (
        <>
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            sx={{ textAlign: "center" }}
          >
            {partnerStake?.name || "Day of Service"} Projects
          </Typography>
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            sx={{ textAlign: "center", mb: 5 }}
          >
            for {dayOfService?.name || formatSafeDate(date)}
          </Typography>
        </>
      ) : (
        <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 5 }}>
          {partnerStake?.name || "Day of Service"} Projects for{" "}
          {dayOfService?.name || formatSafeDate(date)}
        </Typography>
      )}

      <Typography variant="h6" color="primary" gutterBottom sx={{ mb: 2 }}>
        {projects?.length === 0 &&
          !isLoading &&
          !error &&
          "No projects have been created yet. Please create a new project to get started."}
      </Typography>

      {projects?.length !== 0 && (
        <Typography variant="h6" color="primary" gutterBottom sx={{ mb: 5 }}>
          Click on a project to view or edit the project form. You can select
          projects using the checkbox and generate reports or view selected
          projects as timelines.
        </Typography>
      )}

      {/* <JsonViewer data={projects} /> */}

      <Paper
        elevation={0}
        sx={{
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          p: 0,
        }}
      >
        {isLoading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flex: 1,
            }}
          >
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              flex: 1,
              p: 3,
            }}
          >
            <Alert severity="error">{error}</Alert>
          </Box>
        ) : projects?.length >= 1 ? (
          <Grid
            container
            spacing={{ xs: 1, sm: 2, lg: 4 }}
            sx={{ p: { lg: 3, md: 0 }, overflowY: "auto" }}
          >
            {projects
              .sort((a, b) => {
                const dateA = moment(a.created_at);
                const dateB = moment(b.created_at);
                return dateB.isValid() && dateA.isValid()
                  ? dateB.diff(dateA)
                  : 0; // Default to no change if dates are invalid
              })
              .map((project) => (
                <Grid item xs={12} sm={6} lg={6} key={project.id}>
                  <Card
                    sx={{
                      cursor: "pointer",
                      "&:hover": { boxShadow: 6 },
                      position: "relative",
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      backgroundColor: theme.palette.grey[50],
                      border:
                        project.status === "completed"
                          ? "2px solid #318D43"
                          : "",
                    }}
                    variant="outlined"
                    onClick={() => handleProjectClick(project.id)}
                  >
                    <Box
                      sx={{
                        position: "absolute",
                        top: 10,
                        left: 8,
                        zIndex: 1,
                      }}
                    >
                      <Checkbox
                        checked={selectedProjects.includes(project.id)}
                        onChange={(e) => handleCheckboxChange(e, project.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </Box>

                    <Box
                      sx={{
                        position: "absolute",
                        top: 10,
                        right: 8,
                        display: "flex",
                        zIndex: 1,
                      }}
                    >
                      {/* Regular buttons for normal screens */}
                      {!isSmallScreen && (
                        <>
                          <IconButton
                            edge="end"
                            aria-label="generate-report"
                            onClick={(e) =>
                              handleGenerateSingleReport(e, project.id)
                            }
                            sx={{ mr: 1 }}
                          >
                            <Tooltip title="Generate Report">
                              <Assignment />
                            </Tooltip>
                          </IconButton>

                          <IconButton
                            edge="end"
                            aria-label="delete"
                            onClick={(e) => handleDeleteClick(e, project)}
                            sx={{ mr: 1 }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </>
                      )}

                      {/* Dropdown menu button for small screens */}
                      {isSmallScreen && (
                        <>
                          {project.volunteers_needed &&
                            project.volunteers_needed > 0 && (
                              <Typography
                                variant="body2"
                                sx={{ display: "flex", alignItems: "center" }}
                              >
                                <Group sx={{ mr: 1 }} size="small" />
                                {project.volunteers_needed}
                              </Typography>
                            )}
                          <IconButton
                            aria-label="more-actions"
                            aria-controls={`action-menu-${project.id}`}
                            aria-haspopup="true"
                            onClick={(e) => {
                              handleMenuClick(e, project.id);
                              e.stopPropagation();
                            }}
                          >
                            <MoreVertIcon />
                          </IconButton>

                          {/* Add debug output */}
                          {console.log(
                            `Menu anchor for ${project.id}:`,
                            menuAnchorEl[project.id],
                          )}
                          <Menu
                            id={`action-menu-${project.id}`}
                            anchorEl={menuAnchorEl[project.id]}
                            open={Boolean(menuAnchorEl[project.id])}
                            onClose={() => handleMenuClose(project.id)}
                            MenuListProps={{
                              "aria-labelledby": `action-button-${project.id}`,
                            }}
                          >
                            <MenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                handleGenerateSingleReport(e, project.id);
                                handleMenuClose(project.id);
                              }}
                            >
                              <Assignment sx={{ mr: 1 }} />
                              Print Report
                            </MenuItem>
                            <MenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteClick(e, project);
                                handleMenuClose(project.id);
                              }}
                            >
                              <DeleteIcon sx={{ mr: 1 }} />
                              Delete
                            </MenuItem>
                          </Menu>
                        </>
                      )}
                    </Box>

                    <CardHeader
                      title={getProjectTitle(project)}
                      subheader={
                        project.address_street1 &&
                        project.address_city && (
                          <Box>
                            <Typography
                              variant="subtitle"
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                ml: -0.5,
                              }}
                            >
                              <LocationOn
                                color="primary"
                                size="small"
                                sx={{ mr: 1 }}
                              />

                              {`${project.address_street1}${
                                project.address_street2
                                  ? `, ${project.address_street2}`
                                  : ""
                              }, ${project.address_city}`}
                            </Typography>
                          </Box>
                        )
                      }
                      sx={{
                        pb: 0,
                        pl: { xs: 6, sm: 6, md: 6 },
                        pt: { xs: 2.5, sm: 3, md: 2 },
                        "& .MuiCardHeader-title": {
                          fontSize: { xs: "0.9rem", sm: "1rem", md: "1.5rem" },
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        },
                        "& .MuiCardHeader-subheader": {
                          fontSize: { xs: "0.5rem", sm: "0.875rem" },
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        },
                      }}
                    />

                    <CardContent sx={{ pt: 2, flex: 1 }}>
                      {project.project_developer && (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mb: 3 }}
                        >
                          {"Resource Couple: " +
                            project.project_development_couple}
                        </Typography>
                      )}

                      {project.project_id && (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mb: 3 }}
                        >
                          {project.project_id}
                        </Typography>
                      )}
                      {project.status === "completed" && (
                        <Chip
                          label="Ready for Day of Service"
                          color="success"
                          size="small"
                          sx={{
                            textTransform: "capitalize",
                            mb: 2,
                          }}
                        />
                      )}

                      <Grid container spacing={2} sx={{ mb: 1 }}>
                        {/* Left column - First liaison */}
                        <Grid item xs={12} md={6}>
                          {project.is_dumpster_needed && (
                            <Box sx={{ mt: 2 }}>
                              <Typography
                                variant="subtitle"
                                gutterBottom
                                sx={{ display: "flex", alignItems: "center" }}
                              >
                                <DumpsterIcon
                                  color="primary"
                                  size="small"
                                  sx={{ mr: 1 }}
                                />
                                Dumpsters
                                {project.is_second_dumpster_needed && (
                                  <Chip
                                    label={"x 2"}
                                    color="primary"
                                    size="small"
                                    sx={{
                                      ml: 1,
                                      backgroundColor:
                                        theme.palette.primary.light,
                                    }}
                                  />
                                )}
                              </Typography>
                            </Box>
                          )}
                        </Grid>
                        <Grid
                          item
                          xs={12}
                          md={6}
                          sx={{ display: "flex", justifyContent: "flex-end" }}
                        >
                          {project.are_blue_stakes_needed && (
                            <Box sx={{ mt: 2 }}>
                              <Typography
                                variant="subtitle"
                                gutterBottom
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  textAlign: "right",
                                }}
                              >
                                {project.called_811 ? (
                                  <CheckCircle
                                    color="primary"
                                    size="small"
                                    sx={{ mr: 1 }}
                                  />
                                ) : (
                                  <Flag
                                    color="info"
                                    size="small"
                                    sx={{ mr: 1 }}
                                  />
                                )}
                                Blue Stakes
                              </Typography>
                            </Box>
                          )}
                        </Grid>
                      </Grid>

                      <Accordion
                        elevation={1}
                        sx={{
                          border: `1px solid ${theme.palette.divider}`,
                          "&:before": {
                            display: "none",
                          },
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <AccordionSummary
                          expandIcon={<ExpandMore />}
                          aria-controls="contact-info-content"
                          id="contact-info-header"
                          sx={{
                            backgroundColor: theme.palette.background.default,
                            display: "flex",
                          }}
                        >
                          <Typography
                            variant="h6"
                            sx={{
                              fontSize: {
                                xs: "0.75rem",
                                sm: "1rem",
                                md: "1rem",
                              },
                              display: "flex",
                              alignItems: "center",
                            }}
                          >
                            <Phone sx={{ mr: 1 }} />
                            Group Assignment &amp; Contact Information
                          </Typography>

                          {!project.partner_ward && (
                            <>
                              <Box sx={{ flexGrow: 1 }} />
                              <Typography
                                variant="subtitle1"
                                gutterBottom
                                sx={{
                                  color: "#cf6179",
                                  display: "flex",
                                  alignItems: "center",
                                  mt: 1,
                                  mr: 2,
                                }}
                              >
                                Partner Group not Assigned
                              </Typography>
                            </>
                          )}
                        </AccordionSummary>
                        <AccordionDetails>
                          <Box sx={{ position: "relative", mb: 2 }}>
                            <Typography variant="subtitle1" gutterBottom>
                              Partner Group: {project.partner_ward || "Not set"}
                            </Typography>
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<Edit />}
                              onClick={(e) => handleEditPartnerWard(e, project)}
                              sx={{ position: "absolute", top: 0, right: 0 }}
                            >
                              Edit
                            </Button>
                          </Box>

                          <Divider sx={{ my: 2 }} />

                          <Grid container spacing={2}>
                            {/* Left column - First liaison */}

                            {/* liaison 1 & 2, Resource Couple, host */}
                            {/* dumpster and blue stakes */}

                            <Grid item xs={12} md={6}>
                              <Box sx={{ p: 1 }}>
                                {project.partner_ward_liaison && (
                                  <Typography variant="h6" gutterBottom>
                                    {project.partner_ward_liaison}
                                  </Typography>
                                )}
                                {project.partner_ward_liaison_title && (
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                  >
                                    Title: {project.partner_ward_liaison_title}
                                  </Typography>
                                )}
                                {project.partner_ward_liaison_phone1 && (
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                  >
                                    Email: {project.partner_ward_liaison_email1}
                                  </Typography>
                                )}
                                {project.partner_ward_liaison_email2 && (
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                  >
                                    Phone: {project.partner_ward_liaison_phone1}
                                  </Typography>
                                )}
                              </Box>
                            </Grid>

                            {/* Right column - Second liaison */}
                            <Grid item xs={12} md={6}>
                              <Box sx={{ p: 1 }}>
                                {project.partner_ward_liaison2 && (
                                  <Typography variant="h6" gutterBottom>
                                    {project.partner_ward_liaison2}
                                  </Typography>
                                )}

                                {project.partner_ward_liaison_title2 && (
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                  >
                                    Title: {project.partner_ward_liaison_title2}
                                  </Typography>
                                )}
                                {project.partner_ward_liaison_email2 && (
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                  >
                                    Email: {project.partner_ward_liaison_email2}
                                  </Typography>
                                )}
                                {project.partner_ward_liaison_phone2 && (
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                  >
                                    Phone: {project.partner_ward_liaison_phone2}
                                  </Typography>
                                )}
                              </Box>
                            </Grid>
                          </Grid>

                          <Box
                            sx={{
                              mt: 2,
                              display: "flex",
                              justifyContent: "space-between",
                              flexWrap: "wrap",
                            }}
                          >
                            <Chip
                              icon={<CalendarToday />}
                              label={`Created: ${formatDate(
                                project.created_at,
                              )}`}
                              size={isMobile ? "small" : "medium"}
                              sx={{ mb: 1 }}
                            />
                            {project.updated_at &&
                              project.updated_at !== project.created_at && (
                                <Chip
                                  icon={<CalendarToday />}
                                  label={`Updated: ${formatDate(
                                    project.updated_at,
                                  )}`}
                                  size={isMobile ? "small" : "medium"}
                                  sx={{ mb: 1 }}
                                />
                              )}
                          </Box>
                        </AccordionDetails>
                      </Accordion>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
          </Grid>
        ) : (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flex: 1,
              p: 3,
              textAlign: "center",
            }}
          ></Box>
        )}
      </Paper>

      <Box
        sx={{
          mt: 5,
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "center",
          gap: 2,
          width: { xs: "100%", sm: "auto" },
        }}
      >
        <Button
          variant="contained"
          color="primary"
          onClick={handleNewProject}
          startIcon={<AddIcon />}
          disabled={isLoading || creatingProject}
          sx={{ width: { xs: "100%", sm: "auto" } }}
        >
          {creatingProject ? "Creating Project..." : "New Project"}
        </Button>

        <Button
          variant="outlined"
          color="primary"
          onClick={handleViewTimelines}
          startIcon={<TimelineIcon />}
          disabled={isLoading || selectedProjects.length === 0}
          sx={{ width: { xs: "100%", sm: "auto" } }}
        >
          View Project Timelines
        </Button>

        <Button
          variant="outlined"
          color="primary"
          onClick={handleGenerateDayOfServiceReport}
          startIcon={<Assignment />}
          sx={{ width: { xs: "100%", sm: "auto" } }}
        >
          Generate Projects Summary
        </Button>
      </Box>

      <AskYesNoDialog
        open={deleteDialogOpen}
        title="Confirm Delete"
        description="Are you sure you want to delete this project? This will be deleted for everyone."
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        onClose={handleCancelDelete}
      />

      <Dialog
        open={partnerWardDialogOpen}
        onClose={() => setPartnerWardDialogOpen(false)}
      >
        <DialogTitle>Edit Partner Group Information</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={2} alignItems="stretch">
              {/* Left Column */}
              <Grid item xs={12}>
                <TextField
                  autoFocus
                  margin="dense"
                  label="Partner Group"
                  fullWidth
                  value={partnerWardData.partner_ward}
                  onChange={(e) =>
                    handlePartnerWardChange("partner_ward", e.target.value)
                  }
                  required
                />
              </Grid>

              <Grid
                item
                xs={12}
                sm={0.4}
                sx={{ display: { sm: "none", xs: "block" } }}
              >
                <Divider
                  flexItem
                  sx={{
                    height: "100%",
                    bgcolor: "grey.400",
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={5.8}>
                <TextField
                  margin="dense"
                  label="Contact Name 1"
                  fullWidth
                  value={partnerWardData.partner_ward_liaison}
                  onChange={(e) =>
                    handlePartnerWardChange(
                      "partner_ward_liaison",
                      e.target.value,
                    )
                  }
                />
                <TextField
                  margin="dense"
                  label="Contact Title 1"
                  fullWidth
                  value={partnerWardData.partner_ward_liaison_title}
                  onChange={(e) =>
                    handlePartnerWardChange(
                      "partner_ward_liaison_title",
                      e.target.value,
                    )
                  }
                />
                <TextField
                  margin="dense"
                  label="Contact Email 1"
                  fullWidth
                  value={partnerWardData.partner_ward_liaison_email1}
                  onChange={(e) =>
                    handlePartnerWardChange(
                      "partner_ward_liaison_email1",
                      e.target.value,
                    )
                  }
                />
                <TextField
                  margin="dense"
                  label="Contact Phone 1"
                  fullWidth
                  value={partnerWardData.partner_ward_liaison_phone1}
                  onChange={(e) =>
                    handlePartnerWardChange(
                      "partner_ward_liaison_phone1",
                      e.target.value,
                    )
                  }
                />
              </Grid>

              {/* Vertical Divider */}
              <Grid
                item
                xs={12}
                sm={0.4}
                sx={{ display: { xs: "none", sm: "block" } }}
              >
                <Divider
                  orientation="vertical"
                  flexItem
                  sx={{
                    height: "100%",
                    bgcolor: "grey.400",
                    width: "1px",
                  }}
                />
              </Grid>

              <Grid
                item
                xs={12}
                sm={0.4}
                sx={{ display: { sm: "none", xs: "block" } }}
              >
                <Divider
                  flexItem
                  sx={{
                    height: "100%",
                    bgcolor: "grey.400",
                  }}
                />
              </Grid>

              {/* Right Column */}
              <Grid item xs={12} sm={5.8}>
                <TextField
                  margin="dense"
                  label="Contact Name 2 (Optional)"
                  fullWidth
                  value={partnerWardData.partner_ward_liaison2}
                  onChange={(e) =>
                    handlePartnerWardChange(
                      "partner_ward_liaison2",
                      e.target.value,
                    )
                  }
                />
                <TextField
                  margin="dense"
                  label="Contact Title 2 (Optional)"
                  fullWidth
                  value={partnerWardData.partner_ward_liaison_title2}
                  onChange={(e) =>
                    handlePartnerWardChange(
                      "partner_ward_liaison_title2",
                      e.target.value,
                    )
                  }
                />
                <TextField
                  margin="dense"
                  label="Contact Email 2 (Optional)"
                  fullWidth
                  value={partnerWardData.partner_ward_liaison_email2}
                  onChange={(e) =>
                    handlePartnerWardChange(
                      "partner_ward_liaison_email2",
                      e.target.value,
                    )
                  }
                />
                <TextField
                  margin="dense"
                  label="Contact Phone 2 (Optional)"
                  fullWidth
                  value={partnerWardData.partner_ward_liaison_phone2}
                  onChange={(e) =>
                    handlePartnerWardChange(
                      "partner_ward_liaison_phone2",
                      e.target.value,
                    )
                  }
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPartnerWardDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSavePartnerWard} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

const ContactItem = ({ icon, primary, secondary, tertiary }) => (
  <Box sx={{ display: "flex", alignItems: "flex-start", mb: 1 }}>
    <Box sx={{ mr: 1, mt: 0.5 }}>{icon}</Box>
    <Box>
      <Typography variant="body2" color="text.secondary">
        {primary}
      </Typography>
      <Typography variant="body1">{secondary}</Typography>
      {tertiary && <Typography variant="body2">{tertiary}</Typography>}
    </Box>
  </Box>
);

const DumpsterIcon = (props) => {
  return (
    <SvgIcon {...props} viewBox="0 0 576 512">
      <path d="M49.7 32c-10.5 0-19.8 6.9-22.9 16.9L.9 133c-.6 2-.9 4.1-.9 6.1C0 150.7 9.3 160 20.9 160l94 0L140.5 32 49.7 32zM272 160l0-128-98.9 0L147.5 160 272 160zm32 0l124.5 0L402.9 32 304 32l0 128zm157.1 0l94 0c11.5 0 20.9-9.3 20.9-20.9c0-2.1-.3-4.1-.9-6.1L549.2 48.9C546.1 38.9 536.8 32 526.3 32l-90.8 0 25.6 128zM32 192l4 32-4 0c-17.7 0-32 14.3-32 32s14.3 32 32 32l12 0L64 448c0 17.7 14.3 32 32 32s32-14.3 32-32l320 0c0 17.7 14.3 32 32 32s32-14.3 32-32l20-160 12 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-4 0 4-32L32 192z" />
    </SvgIcon>
  );
};

const formatSafeDate = (dateString) => {
  if (!dateString) return "";

  // First try standard moment parsing
  let parsedDate = moment(dateString);

  // If moment couldn't parse it properly, try manual parsing for MM-DD-YYYY format
  if (!parsedDate.isValid() && dateString.includes("-")) {
    const parts = dateString.split("-");
    if (parts.length === 3) {
      // If first part is 4 digits, it's likely YYYY-MM-DD already
      if (parts[0].length === 4) {
        parsedDate = moment(dateString);
      } else {
        // Otherwise, assume MM-DD-YYYY and convert to YYYY-MM-DD for better browser compatibility
        parsedDate = moment(
          `${parts[2]}-${parts[0]}-${parts[1]}`,
          "YYYY-MM-DD",
        );
      }
    }
  }

  return parsedDate.isValid()
    ? parsedDate.format("dddd, MMMM Do, YYYY")
    : dateString; // Fallback to original string if parsing still fails
};
