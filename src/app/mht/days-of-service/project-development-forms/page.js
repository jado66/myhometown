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
} from "@mui/material";
import { Add as AddIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { useLocalStorageProjectForms } from "@/hooks/use-local-storage-project-forms";
import { useState } from "react";
import AskYesNoDialog from "@/components/util/AskYesNoDialog";
import { toast } from "react-toastify";

export default function ProjectFormsPage() {
  const router = useRouter();
  const { projects, isLoading, error, deleteProject } =
    useLocalStorageProjectForms();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);

  const handleProjectClick = (id) => {
    router.push(`/days-of-service/project-development-forms/${id}`);
  };

  const handleNewProject = () => {
    router.push("/days-of-service/project-development-forms/new");
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
          {
            method: "DELETE",
          }
        );

        if (!response.ok && response.status !== 404) {
          throw new Error("Failed to delete project");
        }

        deleteProject(projectToDelete.id);
        setDeleteDialogOpen(false);
        setProjectToDelete(null);
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
    if (project.propertyOwner) {
      return project.propertyOwner;
    }
    if (project.address) {
      return project.address;
    }
    return `Project ${project.id.slice(0, 8)}...`;
  };

  return (
    <Container maxWidth="md">
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
                justifyContent: "center",
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
                justifyContent: "center",
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
                          aria-label="delete"
                          onClick={(e) => handleDeleteClick(e, project)}
                          sx={{ mr: 1 }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    }
                  >
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

        <Box sx={{ mt: 2, display: "flex", justifyContent: "center" }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleNewProject}
            startIcon={<AddIcon />}
            disabled={isLoading}
          >
            New Project
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
