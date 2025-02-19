"use client";

import { useRouter } from "next/navigation";
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  Button,
  ListItemText,
  Paper,
  Typography,
  Container,
  Chip,
  IconButton,
  CircularProgress,
  Alert,
  Checkbox,
  Tooltip,
} from "@mui/material";
import {
  Add as AddIcon,
  Assignment,
  Delete as DeleteIcon,
  Report,
  Timeline as TimelineIcon,
} from "@mui/icons-material";
import { useLocalStorageProjectForms } from "@/hooks/use-local-storage-project-forms";
import { useEffect, useState } from "react";
import AskYesNoDialog from "@/components/util/AskYesNoDialog";
import { toast } from "react-toastify";
import { supabase } from "@/util/supabase";
import { useCommunities } from "@/hooks/use-communities";
import JsonViewer from "@/components/util/debug/DebugOutput";
import { useDaysOfServiceProjects } from "@/hooks/useDaysOfServiceProjects";

export default function ProjectFormsPage({ params }) {
  const { date, communityId } = params;

  const [cityId, setCityId] = useState();
  const [projects, setProjects] = useState([]);

  const { fetchNewCommunities } = useCommunities();

  const [isLoading, setIsLoading] = useState(true);

  const { fetchProjectsByDaysOfServiceId, error } = useDaysOfServiceProjects();

  useEffect(() => {
    if (communityId) {
      // get from supabase communities table .cityId
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
        const data = await fetchProjectsByDaysOfServiceId(
          `${communityId}_${date}`
        );

        setProjects(data);
        setIsLoading(false);
      };
      fetchProjects();
    }
  }, [communityId]);

  const router = useRouter();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [selectedProjects, setSelectedProjects] = useState([]);

  const handleProjectClick = (id) => {
    router.push(
      process.env.NEXT_PUBLIC_DOMAIN + `/days-of-service/projects/${id}`
    );
  };

  const handleNewProject = () => {
    const url =
      process.env.NEXT_PUBLIC_DOMAIN +
      `/admin-dashboard/days-of-service/${communityId}/${date}/new?cityId=${cityId}`;

    router.push(url);
  };

  const handleDeleteClick = (e, project) => {
    e.stopPropagation();
    setProjectToDelete(project);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (projectToDelete) {
      try {
        const response = await fetch(
          `/api/database/project-forms/${projectToDelete.id}`,
          { method: "DELETE" }
        );

        if (!response.ok && response.status !== 404) {
          throw new Error("Failed to delete project");
        }

        deleteProject(projectToDelete.id);
        setDeleteDialogOpen(false);
        setProjectToDelete(null);
        setSelectedProjects((prev) =>
          prev.filter((id) => id !== projectToDelete.id)
        );
        toast.success("Project deleted successfully");
      } catch (error) {
        console.error("Error deleting project:", error);
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getProjectTitle = (project) => {
    if (project.propertyOwner) return project.propertyOwner;
    if (project.address) return project.address;
    return `Project ${project.id.slice(0, 8)}...`;
  };

  return (
    <Container>
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Project Forms
        </Typography>

        <Paper
          elevation={2}
          sx={{
            height: "calc(100vh - 200px)",
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
          ) : projects.length === 0 ? (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
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
          ) : (
            <List sx={{ flex: 1, overflow: "auto" }}>
              {projects
                .sort(
                  (a, b) => new Date(b.createdTime) - new Date(a.createdTime)
                )
                .map((project) => (
                  <ListItem
                    key={project.id}
                    divider
                    disablePadding
                    secondaryAction={
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        {project.finishedTime && (
                          <Chip
                            label="Completed"
                            color="success"
                            size="small"
                            sx={{ mr: 2 }}
                          />
                        )}
                        <IconButton
                          edge="end"
                          aria-label="generate-report"
                          onClick={(e) => {
                            e.stopPropagation();
                            toast.info("Coming soon");
                          }}
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
                    }
                  >
                    <Checkbox
                      checked={selectedProjects.includes(project.id)}
                      onChange={(e) => handleCheckboxChange(e, project.id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <ListItemButton
                      onClick={() => handleProjectClick(project.id)}
                    >
                      <ListItemText
                        primary={getProjectTitle(project)}
                        secondary={
                          <>
                            <Typography
                              component="span"
                              variant="body2"
                              color="text.primary"
                            >
                              {project.propertyOwner && project.address && (
                                <>
                                  {project.address}
                                  <br />
                                </>
                              )}
                            </Typography>
                            Created: {formatDate(project.createdTime)}
                            {project.lastUpdated &&
                              project.lastUpdated !== project.createdTime &&
                              ` • Updated: ${formatDate(project.lastUpdated)}`}
                          </>
                        }
                        secondaryTypographyProps={{
                          style: { whiteSpace: "pre-line" },
                        }}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
            </List>
          )}
        </Paper>

        <Box sx={{ mt: 2, display: "flex", justifyContent: "center", gap: 2 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleNewProject}
            startIcon={<AddIcon />}
            disabled={isLoading}
          >
            New Project
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
            onClick={() => toast.info("Coming soon")}
            startIcon={<Assignment />}
            disabled={isLoading || selectedProjects.length === 0}
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
      </Box>
    </Container>
  );
}
