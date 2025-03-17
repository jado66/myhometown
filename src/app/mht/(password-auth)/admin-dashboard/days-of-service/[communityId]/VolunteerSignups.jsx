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
  Tabs,
  Tab,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useCommunities } from "@/hooks/use-communities";
import { useFormResponses } from "@/hooks/useFormResponses";
import { FormResponseTable } from "@/components/FormResponseTable";
import JsonViewer from "@/components/util/debug/DebugOutput";

import { useDaysOfServiceProjects } from "@/hooks/useDaysOfServiceProjects";
import { Assignment, Warning } from "@mui/icons-material";
import moment from "moment";

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

const DaysOfServicePage = ({
  params,
  daysOfService,
  generateCommunityReport,
}) => {
  const { communityId } = params;
  const [community, setCommunity] = useState(null);
  const [responses, setResponses] = useState([]);
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedResponse, setSelectedResponse] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [responseToDelete, setResponseToDelete] = useState(null);
  const [projectSummary, setProjectSummary] = useState([]);

  const [activeTab, setActiveTab] = useState(0);

  const { deleteSubmission } = useFormResponses();

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const { getCommunity } = useCommunities();
  const {
    getFormById,
    getFormResponses,
    deleteFormResponse,
    loading: formLoading,
    error: formError,
  } = useFormResponses();

  // Add the useDaysOfServiceProjects hook
  const { fetchProjectsByDaysOfStakeId, loading: projectsLoading } =
    useDaysOfServiceProjects();

  useEffect(() => {
    const loadData = async () => {
      try {
        // 1. Get the community first
        const communityData = await getCommunity(communityId);
        setCommunity(communityData);

        if (communityData?.volunteerSignUpId) {
          // 2. Get the form configuration using the new hook
          const formConfigData = await getFormById(
            communityData.volunteerSignUpId
          );

          if (!formConfigData)
            throw new Error("Failed to fetch form configuration");

          // Transform the data to match the expected format for FormResponseTable
          const formattedFormData = {
            form_config: formConfigData.form_config || {},
            field_order: formConfigData.field_order || [],
          };

          setFormData(formattedFormData);

          // 3. Get the form responses using the new hook
          const responseData = await getFormResponses(
            communityData.volunteerSignUpId
          );

          setResponses(responseData || []);

          // 4. Calculate project summary
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
        }
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [communityId, daysOfService]);

  const handleDeleteClick = (response) => {
    setResponseToDelete(response);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setResponseToDelete(null);
  };

  const handleConfirmDelete = async (formId, submissionId) => {
    if (!responseToDelete) return;

    try {
      const success = await deleteSubmission(formId, submissionId);
      if (success) {
        // Remove the deleted response from the state
        setResponses(responses.filter((r) => r.id !== responseToDelete.id));

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

  const handleViewResponse = (responseData) => {
    setSelectedResponse(responseData);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  // Calculate total volunteer hours across all projects
  const totalVolunteerHours = projectSummary.reduce(
    (total, project) => total + project.volunteerHours,
    0
  );

  // Group projects by stake for display
  const projectsByStake = projectSummary.reduce((acc, project) => {
    const stakeName = project.stakeName || "Unknown Organization";
    if (!acc[stakeName]) {
      acc[stakeName] = [];
    }
    acc[stakeName].push(project);
    return acc;
  }, {});

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

  // Render function with updated table
  return (
    <Container>
      {community?.volunteerSignUpId && formData && (
        <>
          <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
              {community.name} Days Of Service
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Projects and volunteer participation overview
            </Typography>
            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <Button
                variant="outlined"
                color="primary"
                sx={{ mt: 4, mx: 2, display: "flex" }}
                onClick={generateCommunityReport}
              >
                <Assignment sx={{ mr: 1 }} />
                Generate Project Volunteer Hours Report
              </Button>

              <Button
                variant="outlined"
                color="primary"
                sx={{ mt: 4, mx: 2, display: "flex" }}
                onClick={generateCommunityReport}
              >
                <Assignment sx={{ mr: 1 }} />
                Generate Org/Group Volunteer Hours Report
              </Button>
            </Box>
          </Paper>

          {/* Projects Summary Table */}
          <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
            <Typography variant="h5" component="h2" gutterBottom>
              Volunteer Summary
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
              Total Community Volunteer Hours:{" "}
              <strong>{totalVolunteerHours}</strong>
            </Typography>

            <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
              <Tabs
                value={activeTab}
                onChange={(e, newValue) => setActiveTab(newValue)}
                aria-label="volunteer summary tabs"
              >
                <Tab
                  label="Projects Volunteer Summary"
                  id="tab-0"
                  aria-controls="tabpanel-0"
                />
                <Tab
                  label="Organization Volunteer Summary"
                  id="tab-1"
                  aria-controls="tabpanel-1"
                />
              </Tabs>
            </Box>

            {/* Projects Volunteer Summary Tab */}
            <TabPanel value={activeTab} index={0}>
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
            </TabPanel>

            {/* Organization Volunteer Summary Tab */}
            <TabPanel value={activeTab} index={1}>
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
            </TabPanel>
          </Paper>

          {/* Volunteers Accordion */}
          <Accordion>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="volunteer-signups-content"
              id="volunteer-signups-header"
            >
              <Typography variant="h6">Volunteer Signups</Typography>
            </AccordionSummary>
            <AccordionDetails>
              {responses.length > 0 ? (
                <FormResponseTable
                  formId={community.volunteerSignUpId}
                  responses={responses}
                  formData={formData}
                  onViewResponse={handleViewResponse}
                  onDeleteResponse={handleDeleteClick}
                  daysOfService={daysOfService}
                />
              ) : (
                <Typography variant="body1">
                  No volunteer responses have been submitted yet.
                </Typography>
              )}
            </AccordionDetails>
          </Accordion>

          {/* Response details dialog */}
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
                  handleDeleteClick(selectedResponse);
                }}
              >
                <DeleteIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent>
              <JsonViewer data={selectedResponse} />

              {selectedResponse && (
                <Box sx={{ my: 2 }}>
                  {formData.field_order.map((fieldId) => {
                    const field = formData.form_config[fieldId];
                    if (!field) return null;

                    let displayValue = selectedResponse[fieldId];

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

                      if (fieldId === "volunteerSignature") {
                        // Handle signature image
                        return (
                          <Box key={fieldId} sx={{ mb: 2 }}>
                            <img
                              src={volunteer.volunteerSignature}
                              alt="Volunteer Signature"
                            />
                          </Box>
                        );
                      }

                      // For other object arrays
                      return (
                        <Box key={fieldId} sx={{ mb: 2 }}>
                          <Typography variant="subtitle2" color="textSecondary">
                            {field.label || fieldId}
                          </Typography>
                          <Typography variant="body1">
                            {JSON.stringify(displayValue)}
                          </Typography>
                        </Box>
                      );
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
