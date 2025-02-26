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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CardHeader,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  Add as AddIcon,
  Assignment,
  CalendarToday,
  Delete as DeleteIcon,
  Edit,
  Email,
  ExpandMore,
  Phone,
  Timeline as TimelineIcon,
} from "@mui/icons-material";
import { v4 as uuidv4 } from "uuid";
import moment from "moment";
import { toast } from "react-toastify";

import { useLocalStorageProjectForms } from "@/hooks/use-local-storage-project-forms";
import { supabase } from "@/util/supabase";
import { useCommunities } from "@/hooks/use-communities";
import { useDaysOfServiceProjects } from "@/hooks/useDaysOfServiceProjects";
import { useDaysOfService } from "@/hooks/useDaysOfService";
import { useUser } from "@/hooks/use-user";

import AskYesNoDialog from "@/components/util/AskYesNoDialog";
import JsonViewer from "@/components/util/debug/DebugOutput";
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

  // Save partner ward data to Supabase
  const handleSavePartnerWard = async () => {
    try {
      const { error } = await supabase
        .from("days_of_service_project_forms")
        .update(partnerWardData)
        .eq("id", selectedProject.id);

      if (error) throw error;

      setProjects((prev) =>
        prev.map((p) =>
          p.id === selectedProject.id ? { ...p, ...partnerWardData } : p
        )
      );
      toast.success("Partner ward information updated successfully");
      setPartnerWardDialogOpen(false);
    } catch (error) {
      console.error("Error updating partner ward:", error);
      toast.error("Failed to update partner ward information");
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
          `${communityId}_${date}`
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
        `/admin-dashboard/days-of-service/${communityId}/${date}/project/${id}`
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
      if (!dayOfService.city_id) {
        throw new Error("City ID is required");
      }

      const newId = uuidv4();
      await addProject(
        newId,
        dayOfService.community_id,
        dayOfService.city_id,
        `${communityId}_${date}`,
        stakeId,
        user
      );

      // Wait for 1.5 seconds to allow for data processing
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Redirect to the project form page with all necessary IDs
      router.push(
        `${process.env.NEXT_PUBLIC_DOMAIN}/admin-dashboard/days-of-service/${communityId}/${date}/project/${newId}`
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
          prev.filter((id) => id !== projectToDelete.id)
        );
        setProjects((prev) =>
          prev.filter((project) => project.id !== projectToDelete.id)
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
        : [...prev, projectId]
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
          ","
        )}`
    );
  };

  const handleGenerateSingleReport = async (e, projectId) => {
    e.stopPropagation();
    try {
      await generateReports("single", projectId);
      toast.success("Report generated successfully");
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
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getProjectTitle = (project) => {
    let projectTitle = "";

    if (project.project_name) projectTitle += project.project_name;

    if (project.project_development_couple)
      projectTitle += ` -  Resource Couple: ${project.project_development_couple}`;

    if (!projectTitle) {
      return `Project ${project.id.slice(0, 8)}...`;
    }

    return projectTitle;
  };

  // Find the current partner stake
  const partnerStake = dayOfService?.partner_stakes?.find(
    (stake) => stake.id === stakeId
  );

  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  if (daysOfServiceLoading) {
    return <Loading center />;
  }

  return (
    <Box sx={{ p: 4 }}>
      <DosBreadcrumbs
        dayOfService={dayOfService}
        date={date}
        stakeId={stakeId}
      />

      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 5 }}>
        {partnerStake?.name || "Day of Service"} Projects for{" "}
        {dayOfService?.name || moment(date).format("dddd, MMMM Do, YYYY")}
      </Typography>

      <Typography variant="h6" color="primary" gutterBottom sx={{ mb: 5 }}>
        {projects?.length === 0 &&
          !isLoading &&
          !error &&
          "No projects have been created yet. Please create a new project to get started."}
      </Typography>

      <JsonViewer data={projects} />

      <Paper
        elevation={2}
        sx={{
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
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
          <Grid container spacing={3} sx={{ p: 3, overflowY: "auto" }}>
            {projects
              .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
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
                    }}
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
                    </Box>

                    <CardHeader
                      title={getProjectTitle(project)}
                      subheader={
                        project.project_developer &&
                        "Project Developer(s): " + project.project_developer
                      }
                      sx={{ pb: 0, pl: 6 }}
                    />

                    <CardContent sx={{ pt: 5, flex: 1 }}>
                      {project.project_id && (
                        <Typography variant="body2" color="text.secondary">
                          {project.project_id}
                        </Typography>
                      )}
                      {project.status && (
                        <Chip
                          label={project.status}
                          color="success"
                          size="small"
                          sx={{
                            textTransform: "capitalize",
                            mb: 2,
                          }}
                        />
                      )}

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
                          }}
                        >
                          <Typography variant="h6">
                            Partner Ward/Group Information
                          </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          <Box sx={{ position: "relative", mb: 2 }}>
                            <Typography variant="subtitle1" gutterBottom>
                              Partner Ward: {project.partner_ward || "Not set"}
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

                          {project.partner_ward_liaison && (
                            <Typography variant="body2" color="text.secondary">
                              Ward Liaison 1: {project.partner_ward_liaison}
                            </Typography>
                          )}
                          {project.partner_ward_liaison_phone1 && (
                            <Typography variant="body2" color="text.secondary">
                              Email: {project.partner_ward_liaison_phone1}
                            </Typography>
                          )}
                          {project.partner_ward_liaison_email2 && (
                            <Typography variant="body2" color="text.secondary">
                              Phone: {project.partner_ward_liaison_email2}
                            </Typography>
                          )}

                          {project.partner_ward_liaison1 &&
                            partner_ward_liaison.partner_ward_liaison2 && (
                              <Divider sx={{ my: 1.5 }} />
                            )}

                          {project.liaison_name_2 && (
                            <Typography variant="body2" color="text.secondary">
                              Liaison 2: {project.liaison_name_2}
                            </Typography>
                          )}
                          {project.liaison_email_2 && (
                            <Typography variant="body2" color="text.secondary">
                              Email: {project.liaison_email_2}
                            </Typography>
                          )}
                          {project.liaison_phone_2 && (
                            <Typography variant="body2" color="text.secondary">
                              Phone: {project.liaison_phone_2}
                            </Typography>
                          )}

                          {project.address_street1 && project.address_city && (
                            <Box sx={{ mt: 2 }}>
                              <ContactItem
                                icon={<LocationOn color="primary" />}
                                primary="Location"
                                secondary={`${project.address_street1}${
                                  project.address_street2
                                    ? `, ${project.address_street2}`
                                    : ""
                                }, ${project.address_city}`}
                              />
                            </Box>
                          )}

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
                                project.created_at
                              )}`}
                              size={isMobile ? "small" : "medium"}
                              sx={{ mb: 1 }}
                            />
                            {project.updated_at &&
                              project.updated_at !== project.created_at && (
                                <Chip
                                  icon={<CalendarToday />}
                                  label={`Updated: ${formatDate(
                                    project.updated_at
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
          >
            <Typography color="text.secondary">
              No projects yet. Click the button below to create your first
              project.
            </Typography>
          </Box>
        )}
      </Paper>

      <Box sx={{ mt: 5, display: "flex", justifyContent: "center", gap: 2 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleNewProject}
          startIcon={<AddIcon />}
          disabled={isLoading || creatingProject}
        >
          {creatingProject ? "Creating Project..." : "New Project"}
        </Button>

        <Button
          variant="outlined"
          color="primary"
          onClick={handleViewTimelines}
          startIcon={<TimelineIcon />}
          disabled={isLoading || selectedProjects.length === 0}
        >
          View Project Timelines
        </Button>

        <Button
          variant="outlined"
          color="primary"
          onClick={handleGenerateDayOfServiceReport}
          startIcon={<Assignment />}
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
        <DialogTitle>Edit Partner Ward Information</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={2} alignItems="stretch">
              {/* Left Column */}
              <Grid item xs={12}>
                <TextField
                  autoFocus
                  margin="dense"
                  label="Partner Ward"
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
                  label="Ward Liaison"
                  fullWidth
                  value={partnerWardData.partner_ward_liaison}
                  onChange={(e) =>
                    handlePartnerWardChange(
                      "partner_ward_liaison",
                      e.target.value
                    )
                  }
                />
                <TextField
                  margin="dense"
                  label="Liaison Email 1"
                  fullWidth
                  value={partnerWardData.partner_ward_liaison_email1}
                  onChange={(e) =>
                    handlePartnerWardChange(
                      "partner_ward_liaison_email1",
                      e.target.value
                    )
                  }
                />
                <TextField
                  margin="dense"
                  label="Liaison Phone 1"
                  fullWidth
                  value={partnerWardData.partner_ward_liaison_phone1}
                  onChange={(e) =>
                    handlePartnerWardChange(
                      "partner_ward_liaison_phone1",
                      e.target.value
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
                  label="Ward Liaison 2 (Optional)"
                  fullWidth
                  value={partnerWardData.partner_ward_liaison2}
                  onChange={(e) =>
                    handlePartnerWardChange(
                      "partner_ward_liaison2",
                      e.target.value
                    )
                  }
                />
                <TextField
                  margin="dense"
                  label="Liaison Email 2 (Optional)"
                  fullWidth
                  value={partnerWardData.partner_ward_liaison_email2}
                  onChange={(e) =>
                    handlePartnerWardChange(
                      "partner_ward_liaison_email2",
                      e.target.value
                    )
                  }
                />
                <TextField
                  margin="dense"
                  label="Liaison Phone 2 (Optional)"
                  fullWidth
                  value={partnerWardData.partner_ward_liaison_phone2}
                  onChange={(e) =>
                    handlePartnerWardChange(
                      "partner_ward_liaison_phone2",
                      e.target.value
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
