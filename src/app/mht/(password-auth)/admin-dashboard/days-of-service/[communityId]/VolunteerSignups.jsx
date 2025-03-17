"use client";
import { useEffect, useState } from "react";
import {
  Container,
  CircularProgress,
  Typography,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Paper,
  IconButton,
  Snackbar,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useCommunities } from "@/hooks/use-communities";
import { useFormResponses } from "@/hooks/useFormResponses";
import { useDaysOfServiceProjects } from "@/hooks/useDaysOfServiceProjects";
import { FormResponseTable } from "@/components/FormResponseTable";
import { Assignment, Warning } from "@mui/icons-material";
import moment from "moment";

const DaysOfServicePage = ({
  params,
  daysOfService,
  generateCommunityReport,
}) => {
  const { communityId } = params;
  const [community, setCommunity] = useState(null);
  const [formConfig, setFormConfig] = useState(null);
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [volunteerAccordionOpen, setVolunteerAccordionOpen] = useState(false);
  const [projectsAccordionOpen, setProjectsAccordionOpen] = useState(false);
  const [organizationAccordionOpen, setOrganizationAccordionOpen] =
    useState(false);
  const [responsesLoaded, setResponsesLoaded] = useState(false);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState(null);
  const [fullSubmissionData, setFullSubmissionData] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [responseToDelete, setResponseToDelete] = useState(null);
  const [projectSummary, setProjectSummary] = useState([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const { getCommunity } = useCommunities();
  const {
    getFormById,
    getFormResponses,
    getSubmissionById,
    deleteSubmission,
    loading: formLoading,
  } = useFormResponses();

  // Add the useDaysOfServiceProjects hook
  const { fetchProjectsByDaysOfStakeId, loading: projectsLoading } =
    useDaysOfServiceProjects();

  useEffect(() => {
    const loadCommunityData = async () => {
      try {
        setLoading(true);
        // Get the community data
        const communityData = await getCommunity(communityId);
        setCommunity(communityData);

        if (communityData?.volunteerSignUpId) {
          // Get the form configuration
          const formConfigData = await getFormById(
            communityData.volunteerSignUpId
          );

          if (formConfigData) {
            const formattedFormData = {
              form_config: formConfigData.form_config || {},
              field_order: formConfigData.field_order || [],
            };
            setFormConfig(formattedFormData);
          }

          // Load projects summary
          await loadProjectSummary();
        }
      } catch (error) {
        console.error("Error loading community data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadCommunityData();
  }, [communityId]);

  // Function to load project summary
  const loadProjectSummary = async () => {
    try {
      if (daysOfService && daysOfService.length > 0) {
        // Create an array to hold all projects
        let allProjects = [];

        // For each day of service
        for (const dayOfService of daysOfService) {
          // For each partner stake in this day of service
          if (
            dayOfService.partner_stakes &&
            dayOfService.partner_stakes.length > 0
          ) {
            for (const stake of dayOfService.partner_stakes) {
              // Fetch projects for this stake
              const stakeProjects = await fetchProjectsByDaysOfStakeId(
                stake.id,
                false
              );

              if (stakeProjects && stakeProjects.length > 0) {
                // Map each project to the summary format
                const mappedProjects = stakeProjects.map((project) => {
                  // Calculate total volunteer hours
                  const volunteerHours =
                    (project.actual_volunteers || 0) *
                    (project.actual_project_duration || 0);

                  // Create date object properly
                  const serviceDate = moment(
                    dayOfService.date || dayOfService.end_date
                  );

                  return {
                    id: project.id,
                    name: project.project_name || "Unnamed Project",
                    date: serviceDate,
                    dateStr: serviceDate.format("ddd, MMM DD"),
                    location: project.address_city || "Unknown",
                    stakeName: stake.name,
                    partnerGroup: project.partner_ward,
                    volunteerCount: project.actual_volunteers || 0,
                    duration: project.actual_project_duration || 0,
                    volunteerHours: volunteerHours,
                    status: project.status || "Pending",
                  };
                });

                // Add these projects to our collection
                allProjects = [...allProjects, ...mappedProjects];
              }
            }
          }
        }

        setProjectSummary(allProjects);
      }
    } catch (error) {
      console.error("Error loading projects:", error);
    }
  };

  // Load responses only when accordion is opened
  useEffect(() => {
    const loadResponses = async () => {
      if (
        volunteerAccordionOpen &&
        !responsesLoaded &&
        community?.volunteerSignUpId
      ) {
        try {
          // Get responses without large base64 signature data
          const responseData = await getFormResponses(
            community.volunteerSignUpId,
            true
          );
          setResponses(responseData || []);
          setResponsesLoaded(true);
        } catch (error) {
          console.error("Error loading responses:", error);
        }
      }
    };

    loadResponses();
  }, [volunteerAccordionOpen, responsesLoaded, community]);

  const handleVolunteerAccordionChange = (event, expanded) => {
    setVolunteerAccordionOpen(expanded);
  };

  const handleProjectsAccordionChange = (event, expanded) => {
    setProjectsAccordionOpen(expanded);
  };

  const handleOrganizationAccordionChange = (event, expanded) => {
    setOrganizationAccordionOpen(expanded);
  };

  const handleViewResponse = async (responseData) => {
    try {
      // When viewing a specific submission, fetch the full data including signature
      const submissionId = responseData.submissionId || responseData.id;
      setSelectedSubmissionId(submissionId);

      // Fetch the complete submission data with signature
      const fullData = await getSubmissionById(
        community.volunteerSignUpId,
        submissionId
      );
      setFullSubmissionData(fullData);
      setOpenDialog(true);
    } catch (error) {
      console.error("Error fetching full submission data:", error);
      setSnackbar({
        open: true,
        message: "Error loading submission details",
        severity: "error",
      });
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFullSubmissionData(null);
    setSelectedSubmissionId(null);
  };

  const handleDeleteClick = (response) => {
    setResponseToDelete(response);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setResponseToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!responseToDelete) return;

    try {
      const success = await deleteSubmission(
        responseToDelete.formId,
        responseToDelete.submissionId
      );

      if (success) {
        // Remove the deleted response from the state
        setResponses(
          responses.filter((r) => {
            const id = r.submissionId || r.id;
            return id !== responseToDelete.submissionId;
          })
        );

        setSnackbar({
          open: true,
          message: "Volunteer response deleted successfully",
          severity: "success",
        });
      } else {
        setSnackbar({
          open: true,
          message: "Failed to delete volunteer response",
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Error deleting response:", error);
      setSnackbar({
        open: true,
        message: "An error occurred while deleting the response",
        severity: "error",
      });
    } finally {
      setDeleteDialogOpen(false);
      setResponseToDelete(null);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Calculate total volunteer hours across all projects
  const totalVolunteerHours = projectSummary.reduce(
    (total, project) => total + project.volunteerHours,
    0
  );

  if (loading || formLoading || projectsLoading) {
    return (
      <Container>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="200px"
        >
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container>
      {community?.volunteerSignUpId && formConfig && (
        <>
          <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
              {community.name} Days Of Service
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Projects and volunteer participation overview
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
              Total Community Volunteer Hours:{" "}
              <strong>{totalVolunteerHours}</strong>
            </Typography>
          </Paper>

          {/* Projects Summary Accordion */}
          <Accordion
            expanded={projectsAccordionOpen}
            onChange={handleProjectsAccordionChange}
            sx={{ mb: 2 }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="projects-summary-content"
              id="projects-summary-header"
            >
              <Typography variant="h6">Projects Volunteer Summary</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Button
                variant="outlined"
                color="primary"
                sx={{ my: 2, display: "flex" }}
                onClick={generateCommunityReport}
              >
                <Assignment sx={{ mr: 1 }} />
                Print Project Volunteer Hours Report
              </Button>
              {(() => {
                // Group projects by date first
                const projectsByDate = projectSummary.reduce((acc, project) => {
                  // Use dateStr as the key for grouping
                  const dateKey = project.dateStr;
                  if (!acc[dateKey]) {
                    acc[dateKey] = [];
                  }
                  acc[dateKey].push(project);
                  return acc;
                }, {});

                // Sort dates chronologically
                const sortedDates = Object.keys(projectsByDate).sort((a, b) => {
                  return new Date(a) - new Date(b);
                });

                if (sortedDates.length === 0) {
                  return (
                    <TableContainer component={Paper} variant="outlined">
                      <Table size="medium">
                        <TableHead>
                          <TableRow>
                            <TableCell>Project Name</TableCell>
                            <TableCell>Date</TableCell>
                            <TableCell>Location</TableCell>
                            <TableCell>Organization</TableCell>
                            <TableCell>Partner Group</TableCell>
                            <TableCell align="right">Volunteers</TableCell>
                            <TableCell align="right">Duration (hrs)</TableCell>
                            <TableCell align="right">Volunteer Hours</TableCell>
                            <TableCell>Status</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          <TableRow>
                            <TableCell colSpan={9} align="center">
                              No projects found
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                  );
                }

                return sortedDates.map((dateStr) => {
                  const projectsOnDate = projectsByDate[dateStr];

                  // Calculate total volunteer hours for this date
                  const dateTotalHours = projectsOnDate.reduce(
                    (total, project) => total + project.volunteerHours,
                    0
                  );

                  // Group the projects on this date by stake
                  const projectsByStake = projectsOnDate.reduce(
                    (acc, project) => {
                      const stakeName =
                        project.stakeName || "Unknown Organization";
                      if (!acc[stakeName]) {
                        acc[stakeName] = [];
                      }
                      acc[stakeName].push(project);
                      return acc;
                    },
                    {}
                  );

                  return (
                    <Box key={dateStr} sx={{ mb: 5 }}>
                      {/* Date Header */}
                      <Paper
                        sx={{
                          p: 1,
                          mb: 2,
                          bgcolor: "primary.main",
                          color: "primary.contrastText",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Typography variant="h6">
                          Day of Service: {dateStr}
                        </Typography>
                        <Typography variant="subtitle1">
                          Total Hours: {dateTotalHours}
                        </Typography>
                      </Paper>

                      {/* Organizations under this date */}
                      {Object.entries(projectsByStake).map(
                        ([stakeName, projects]) => {
                          // Calculate total volunteer hours for this stake on this date
                          const stakeTotalHours = projects.reduce(
                            (total, project) => total + project.volunteerHours,
                            0
                          );

                          return (
                            <Box
                              key={`${dateStr}-${stakeName}`}
                              sx={{ mb: 3, p: 1.5 }}
                            >
                              <Typography
                                variant="subtitle1"
                                sx={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                }}
                              >
                                <span>{stakeName}</span>
                                <span>Total Hours: {stakeTotalHours}</span>
                              </Typography>

                              <TableContainer
                                component={Paper}
                                variant="outlined"
                              >
                                <Table size="medium">
                                  <TableHead>
                                    <TableRow>
                                      <TableCell>Project Name</TableCell>
                                      <TableCell>Location</TableCell>
                                      <TableCell>Partner Group</TableCell>
                                      <TableCell align="right">
                                        Volunteers
                                      </TableCell>
                                      <TableCell align="right">
                                        Duration (hrs)
                                      </TableCell>
                                      <TableCell align="right">
                                        Volunteer Hours
                                      </TableCell>
                                      <TableCell>Status</TableCell>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {projects.map((project) => (
                                      <TableRow key={project.id}>
                                        <TightedCell>
                                          {project.name}
                                        </TightedCell>
                                        <TightedCell>
                                          {project.location?.toLowerCase()}
                                        </TightedCell>
                                        <TightedCell>
                                          {project.partnerGroup ? (
                                            project.partnerGroup
                                          ) : (
                                            <Typography
                                              sx={{
                                                color: "danger",
                                                display: "flex",
                                                alignItems: "center",
                                              }}
                                            >
                                              <Warning
                                                sx={{
                                                  mr: 1,
                                                  color: "#dea835",
                                                }}
                                              />
                                              Needed
                                            </Typography>
                                          )}
                                        </TightedCell>
                                        <TightedCell align="right">
                                          {project.volunteerCount}
                                        </TightedCell>
                                        <TightedCell align="right">
                                          {project.duration}
                                        </TightedCell>
                                        <TightedCell align="right">
                                          {project.volunteerHours}
                                        </TightedCell>
                                        <TightedCell>
                                          {project.status}
                                        </TightedCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </TableContainer>
                            </Box>
                          );
                        }
                      )}
                    </Box>
                  );
                });
              })()}
            </AccordionDetails>
          </Accordion>

          {/* Organization Summary Accordion */}
          <Accordion
            expanded={organizationAccordionOpen}
            onChange={handleOrganizationAccordionChange}
            sx={{ mb: 2 }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="organization-summary-content"
              id="organization-summary-header"
            >
              <Typography variant="h6">
                Organization Volunteer Summary
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Button
                variant="outlined"
                color="primary"
                sx={{ my: 2, display: "flex" }}
                onClick={generateCommunityReport}
              >
                <Assignment sx={{ mr: 1 }} />
                Print Org/Group Volunteer Hours Report
              </Button>
              {(() => {
                // Group projects by date
                const projectsByDate = projectSummary.reduce((acc, project) => {
                  const dateKey = project.dateStr;
                  if (!acc[dateKey]) {
                    acc[dateKey] = [];
                  }
                  acc[dateKey].push(project);
                  return acc;
                }, {});

                // Sort dates chronologically
                const sortedDates = Object.keys(projectsByDate).sort((a, b) => {
                  return new Date(a) - new Date(b);
                });

                if (sortedDates.length === 0) {
                  return (
                    <TableContainer component={Paper} variant="outlined">
                      <Table size="medium">
                        <TableHead>
                          <TableRow>
                            <TableCell>Group Name</TableCell>
                            <TableCell>Organization</TableCell>
                            <TableCell align="right">Volunteers</TableCell>
                            <TableCell align="right">Duration (hrs)</TableCell>
                            <TableCell align="right">Volunteer Hours</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          <TableRow>
                            <TableCell colSpan={5} align="center">
                              No organization data found
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                  );
                }

                return sortedDates.map((dateStr) => {
                  const projectsOnDate = projectsByDate[dateStr];

                  // Calculate total volunteer hours for this date
                  const dateTotalHours = projectsOnDate.reduce(
                    (total, project) => total + project.volunteerHours,
                    0
                  );

                  // For organization view, we group by stake first
                  const projectsByStake = projectsOnDate.reduce(
                    (acc, project) => {
                      const stakeName =
                        project.stakeName || "Unknown Organization";
                      if (!acc[stakeName]) {
                        acc[stakeName] = [];
                      }
                      acc[stakeName].push(project);
                      return acc;
                    },
                    {}
                  );

                  return (
                    <Box key={dateStr} sx={{ mb: 5 }}>
                      {/* Date Header */}
                      <Paper
                        sx={{
                          p: 2,
                          mb: 2,
                          bgcolor: "primary.main",
                          color: "primary.contrastText",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Typography variant="h6">
                          Day of Service: {dateStr}
                        </Typography>
                        <Typography variant="subtitle1">
                          Total Hours: {dateTotalHours}
                        </Typography>
                      </Paper>

                      {/* Organizations under this date */}
                      {Object.entries(projectsByStake).map(
                        ([stakeName, stakeProjects]) => {
                          // Calculate total volunteer hours for this stake on this date
                          const stakeTotalHours = stakeProjects.reduce(
                            (total, project) => total + project.volunteerHours,
                            0
                          );

                          // Now group by partner group within this stake
                          const projectsByGroup = stakeProjects.reduce(
                            (acc, project) => {
                              const groupName =
                                project.partnerGroup || "Unknown Group";
                              if (!acc[groupName]) {
                                acc[groupName] = [];
                              }
                              acc[groupName].push(project);
                              return acc;
                            },
                            {}
                          );

                          return (
                            <Box
                              key={`${dateStr}-${stakeName}`}
                              sx={{ mb: 3, p: 1.5 }}
                            >
                              <Typography
                                variant="subtitle1"
                                sx={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                }}
                              >
                                <span>{stakeName}</span>
                                <span>Total Hours: {stakeTotalHours}</span>
                              </Typography>

                              <TableContainer
                                component={Paper}
                                variant="outlined"
                              >
                                <Table size="medium">
                                  <TableHead>
                                    <TableRow>
                                      <TableCell>Group Name</TableCell>
                                      <TableCell align="right">
                                        Volunteers
                                      </TableCell>
                                      <TableCell align="right">
                                        Duration (hrs)
                                      </TableCell>
                                      <TableCell align="right">
                                        Volunteer Hours
                                      </TableCell>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {Object.entries(projectsByGroup).map(
                                      ([groupName, groupProjects]) => {
                                        // Sum up volunteers, duration, and hours for this group
                                        const groupVolunteers =
                                          groupProjects.reduce(
                                            (sum, p) => sum + p.volunteerCount,
                                            0
                                          );
                                        const groupDuration =
                                          groupProjects.reduce(
                                            (sum, p) => sum + p.duration,
                                            0
                                          ) / groupProjects.length; // Average duration
                                        const groupHours = groupProjects.reduce(
                                          (sum, p) => sum + p.volunteerHours,
                                          0
                                        );

                                        return (
                                          <TableRow
                                            key={`${stakeName}-${groupName}`}
                                          >
                                            <TableCell>{groupName}</TableCell>
                                            <TableCell align="right">
                                              {groupVolunteers}
                                            </TableCell>
                                            <TableCell align="right">
                                              {groupDuration}
                                            </TableCell>
                                            <TableCell align="right">
                                              {groupHours}
                                            </TableCell>
                                          </TableRow>
                                        );
                                      }
                                    )}
                                  </TableBody>
                                </Table>
                              </TableContainer>
                            </Box>
                          );
                        }
                      )}
                    </Box>
                  );
                });
              })()}
            </AccordionDetails>
          </Accordion>

          {/* Volunteers Accordion - Only loads data when expanded */}
          <Accordion
            expanded={volunteerAccordionOpen}
            onChange={handleVolunteerAccordionChange}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="volunteer-signups-content"
              id="volunteer-signups-header"
            >
              <Typography variant="h6">Volunteer Signups</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <FormResponseTable
                formId={community.volunteerSignUpId}
                responses={responses}
                formData={formConfig}
                onViewResponse={handleViewResponse}
                onDeleteResponse={handleDeleteClick}
                daysOfService={daysOfService}
                isLoading={volunteerAccordionOpen && !responsesLoaded}
              />
            </AccordionDetails>
          </Accordion>

          {/* Response details dialog - Shows complete data including signature */}
          <Dialog
            open={openDialog}
            onClose={handleCloseDialog}
            maxWidth="md"
            fullWidth
          >
            <DialogTitle>
              Response Details
              <IconButton
                aria-label="delete"
                color="error"
                sx={{ position: "absolute", right: 8, top: 8 }}
                onClick={() => {
                  handleCloseDialog();
                  handleDeleteClick({
                    formId: community.volunteerSignUpId,
                    submissionId: selectedSubmissionId,
                  });
                }}
              >
                <DeleteIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent>
              {fullSubmissionData ? (
                <Box sx={{ my: 2 }}>
                  {formConfig.field_order.map((fieldId) => {
                    const field = formConfig.form_config[fieldId];
                    if (!field) return null;

                    let displayValue = fullSubmissionData[fieldId];

                    // Handle array of objects (like minorVolunteers)
                    if (
                      Array.isArray(displayValue) &&
                      displayValue.length > 0 &&
                      typeof displayValue[0] === "object"
                    ) {
                      // For minorVolunteers array specifically
                      if (fieldId === "minorVolunteers") {
                        return (
                          <Box key={fieldId} sx={{ mb: 2 }}>
                            <Typography
                              variant="subtitle2"
                              color="textSecondary"
                            >
                              {field.label || "Minor Volunteers"}
                            </Typography>
                            {displayValue.map((volunteer, index) => (
                              <Box key={index} sx={{ ml: 2, mb: 1 }}>
                                <Typography variant="body1">
                                  Name: {volunteer.name}, Age: {volunteer.age},
                                  Hours: {volunteer.hours}
                                </Typography>
                              </Box>
                            ))}
                          </Box>
                        );
                      }
                    }

                    // Format other values based on field type
                    if (displayValue === null || displayValue === undefined) {
                      displayValue = "-";
                    } else if (
                      fieldId === "volunteerSignature" &&
                      typeof displayValue === "string" &&
                      displayValue.startsWith("data:image")
                    ) {
                      // Handle signature image
                      return (
                        <Box key={fieldId} sx={{ mb: 2 }}>
                          <Typography variant="subtitle2" color="textSecondary">
                            {field.label || "Signature"}
                          </Typography>
                          <Box
                            sx={{
                              mt: 1,
                              border: "1px solid #ccc",
                              p: 1,
                              maxWidth: "100%",
                            }}
                          >
                            <img
                              src={displayValue}
                              alt="Volunteer Signature"
                              style={{ maxWidth: "100%", maxHeight: "200px" }}
                            />
                          </Box>
                        </Box>
                      );
                    } else if (field.type === "checkbox") {
                      displayValue = displayValue ? "Yes" : "No";
                    } else if (field.type === "select" && field.options) {
                      const option = field.options.find(
                        (opt) => opt.value === displayValue
                      );
                      displayValue = option ? option.label : displayValue;
                    } else if (field.type === "date" && displayValue) {
                      displayValue = new Date(
                        displayValue
                      ).toLocaleDateString();
                    } else if (typeof displayValue === "object") {
                      // For all other objects, stringify them
                      displayValue = JSON.stringify(displayValue);
                    }

                    return (
                      <Box key={fieldId} sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" color="textSecondary">
                          {field.label}
                        </Typography>
                        <Typography variant="body1">{displayValue}</Typography>
                      </Box>
                    );
                  })}
                </Box>
              ) : (
                <Box display="flex" justifyContent="center" p={3}>
                  <CircularProgress />
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Close</Button>
            </DialogActions>
          </Dialog>

          {/* Delete confirmation dialog */}
          <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogContent>
              <Typography>
                Are you sure you want to delete this volunteer response? This
                action cannot be undone.
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
              <Button
                onClick={handleConfirmDelete}
                color="error"
                variant="contained"
              >
                Delete
              </Button>
            </DialogActions>
          </Dialog>

          {/* Snackbar for notifications */}
          <Snackbar
            open={snackbar.open}
            autoHideDuration={6000}
            onClose={handleSnackbarClose}
            anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          >
            <Alert
              onClose={handleSnackbarClose}
              severity={snackbar.severity}
              sx={{ width: "100%" }}
            >
              {snackbar.message}
            </Alert>
          </Snackbar>
        </>
      )}

      {!community?.volunteerSignUpId && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="body1">
            No volunteer sign-up form has been created for this community.
          </Typography>
        </Paper>
      )}
    </Container>
  );
};

export default DaysOfServicePage;

const TightedCell = ({ children }) => (
  <TableCell sx={{ p: 1, textTransform: "capitalize" }}>{children}</TableCell>
);
