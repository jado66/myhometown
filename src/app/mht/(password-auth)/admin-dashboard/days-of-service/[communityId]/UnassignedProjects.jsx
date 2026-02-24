"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Typography,
  Box,
  Grid,
  Button,
  Paper,
  CircularProgress,
  Alert,
} from "@mui/material";
import { Add as AddIcon, CheckCircle } from "@mui/icons-material";
import { v4 as uuidv4 } from "uuid";
import moment from "moment";
import { toast } from "react-toastify";
import MoreVertIcon from "@mui/icons-material/MoreVert";

import { useCommunities } from "@/hooks/use-communities";
import { useDaysOfServiceProjects } from "@/hooks/useDaysOfServiceProjects";
import { useDaysOfService } from "@/hooks/useDaysOfService";
import { useUser } from "@/hooks/use-user";

import AskYesNoDialog from "@/components/util/AskYesNoDialog";
import Loading from "@/components/util/Loading";
import JsonViewer from "@/components/util/debug/DebugOutput";
import { ProjectCard } from "./ProjectCard";
import { generatePDFReport } from "@/util/reports/days-of-service/reportGenerators";

export default function UnassignedProjects({
  communityId,
  cityId: propCityId,
}) {
  const router = useRouter();
  const { user } = useUser();

  const [projects, setProjects] = useState([]);
  const [creatingProject, setCreatingProject] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [selectedProjects, setSelectedProjects] = useState([]);

  const [cityId, setCityId] = useState(propCityId);

  const [menuAnchorEl, setMenuAnchorEl] = useState({});

  // Track newly created project IDs in localStorage
  const LOCAL_STORAGE_KEY = "dos_new_project_ids";
  const [newProjectIds, setNewProjectIds] = useState(() => {
    if (typeof window === "undefined") return [];
    try {
      return JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || "[]");
    } catch {
      return [];
    }
  });

  const markProjectSeen = (projectId) => {
    setNewProjectIds((prev) => {
      const updated = prev.filter((id) => id !== projectId);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const addNewProjectId = (projectId) => {
    setNewProjectIds((prev) => {
      const updated = [...prev, projectId];
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

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

  // Hooks
  const { fetchNewCommunities } = useCommunities();
  const {
    fetchUnassignedCommunityProjects,
    deleteProject,
    error,
    addProject,
    generateReports,
  } = useDaysOfServiceProjects();

  // Fetch city and projects data
  useEffect(() => {
    // Get city ID from supabase communities table
    const fetchCityId = async () => {
      // Skip fetching if communityId is null or cityId is already provided
      if (!communityId || propCityId !== undefined) {
        return;
      }

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

    const fetchProjects = async () => {
      const data = await fetchUnassignedCommunityProjects(communityId);
      setProjects(data);
      setIsLoading(false);
    };
    fetchProjects();
  }, [communityId, propCityId]);

  // Event handlers
  const handleProjectClick = (id) => {
    markProjectSeen(id);
    router.push(
      process.env.NEXT_PUBLIC_DOMAIN +
        `/admin-dashboard/days-of-service/${communityId}/project/${id}`,
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
      const newProject = await addProject(newId, communityId, cityId, null, null, user);

      if (newProject) {
        setProjects((prev) => [newProject, ...prev]);
        addNewProjectId(newProject.id);
      }
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

  const handleGenerateSingleReport = async (e, projectId) => {
    e.stopPropagation();
    try {
      const project = projects.find((p) => p.id === projectId);
      await generatePDFReport(
        projectId,
        "",
        project?.project_name || "Project",
        null,
      );
    } catch (error) {
      console.error("Error generating report:", error);
      toast.error("Failed to generate project report");
    }
  };

  return (
    <Box sx={{ mb: 3 }} id="unassigned-projects">
      <Box sx={{ mb: 3 }}>
        {projects?.length === 0 && (
          <Typography
            variant="h5"
            color="primary"
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CheckCircle color="success" sx={{ mr: 1, fontSize: "2rem" }} />
            No Unassigned Days of Service Projects
          </Typography>
        )}
      </Box>
      <Typography variant="h6" color="primary" gutterBottom sx={{ mb: 2 }}>
        {projects?.length === 0 &&
          !isLoading &&
          !error &&
          "No projects have been created yet. Please create a new project to get started."}
      </Typography>

      {/* <JsonViewer data={projects} /> */}

      <Paper
        elevation={0}
        sx={{
          overflow: "visible",
          display: "flex",
          flexDirection: "column",
          p: 0,
        }}
      >
        {projects?.length !== 0 && (
          <Typography variant="h6" color="primary" gutterBottom sx={{ mb: 5 }}>
            Click on a project to view or edit the project form. You can select
            projects using the checkbox and generate reports or view selected
            projects as timelines.
          </Typography>
        )}
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
        ) : (
          projects?.length >= 1 && (
            <Grid
              container
              spacing={{ xs: 1, sm: 2, lg: 4 }}
              sx={{ p: { lg: 3, md: 0 }, overflow: "visible", pt: 1.5, pr: 1 }}
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
                    <ProjectCard
                      project={project}
                      isNew={newProjectIds.includes(project.id)}
                      onProjectClick={handleProjectClick}
                      onGenerateReport={(p) =>
                        handleGenerateSingleReport(
                          { stopPropagation: () => {} },
                          p.id,
                        )
                      }
                      onDelete={(p) =>
                        handleDeleteClick({ stopPropagation: () => {} }, p)
                      }
                      menuAnchorEl={menuAnchorEl}
                      onMenuOpen={handleMenuClick}
                      onMenuClose={handleMenuClose}
                    />
                  </Grid>
                ))}
            </Grid>
          )
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
      </Box>

      <AskYesNoDialog
        open={deleteDialogOpen}
        title="Confirm Delete"
        description="Are you sure you want to delete this project? This will be deleted for everyone."
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        onClose={handleCancelDelete}
      />
    </Box>
  );
}

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
