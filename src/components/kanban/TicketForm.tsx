"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Typography,
  TextField,
  Button,
  Checkbox,
  Alert,
  CircularProgress,
  Container,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ListItemText,
} from "@mui/material";
import BookIcon from "@mui/icons-material/Book";
import TaskIcon from "@mui/icons-material/Task";
import BugReportIcon from "@mui/icons-material/BugReport";
import { useKanbanData } from "@/hooks/use-kanban-data";

const taskTypes = [
  { value: "Story", label: "Story", icon: BookIcon, color: "#4caf50" },
  { value: "Task", label: "Task", icon: TaskIcon, color: "#2196f3" },
  { value: "Bug", label: "Bug", icon: BugReportIcon, color: "#f44336" },
];

export function TicketForm({
  onSuccess,
  onCancel,
  onTicketCreated,
}: {
  onSuccess?: () => void;
  onCancel?: () => void;
  onTicketCreated?: (task: any) => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("Story");
  const [creatingMultiple, setCreatingMultiple] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { createTask } = useKanbanData();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    if (!title.trim()) {
      setError("Title cannot be empty.");
      setLoading(false);
      return;
    }
    try {
      const newTask = await createTask(
        title.trim(),
        description.trim() || null,
        type
      );
      if (onTicketCreated) {
        onTicketCreated(newTask);
      }

      if (onSuccess && !creatingMultiple) {
        onSuccess();
      } else {
        setTitle("");
        setDescription("");
      }
    } catch (err) {
      setError("Failed to create ticket. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      const rootUrl = process.env.NEXT_PUBLIC_DOMAIN;
      router.push(`${rootUrl}/admin-dashboard/tasks`);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          mx: "auto",
          p: 4,

          borderRadius: 2, // Consistent rounded corners
        }}
      >
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ display: "flex", flexDirection: "column", gap: 2 }}
        >
          <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
            <TextField
              label="Title"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              disabled={loading}
              fullWidth
              error={!title.trim() && !!error}
              helperText={!title.trim() && error ? "Title is required" : ""}
              variant="outlined"
              sx={{ flex: 1 }}
            />
            <FormControl>
              <InputLabel>Type</InputLabel>
              <Select
                value={type}
                label="Type"
                sx={{ minWidth: 150, height: "56px" }}
                onChange={(e) => setType(e.target.value)}
                disabled={loading}
              >
                {taskTypes.map((taskType) => {
                  const IconComponent = taskType.icon;
                  return (
                    <MenuItem key={taskType.value} value={taskType.value}>
                      <ListItemText>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <IconComponent
                            fontSize="small"
                            sx={{ color: taskType.color }}
                          />
                          {taskType.label}
                        </Box>
                      </ListItemText>
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
          </Box>
          <TextField
            label="Description (Optional)"
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            multiline
            rows={4}
            disabled={loading}
            fullWidth
            variant="outlined"
          />
          {error && (
            <Alert severity="error" sx={{ mt: 1 }}>
              {error}
            </Alert>
          )}
          <Stack
            direction="row"
            justifyContent="space-between"
            spacing={2}
            sx={{ mt: 3 }}
          >
            <Box display="flex" alignItems="center">
              <Checkbox
                id="create-another"
                disabled={loading}
                onChange={(e) => {
                  setCreatingMultiple(e.target.checked);
                }}
              />
              <Typography variant="body2">Create Another Ticket</Typography>
            </Box>
            <div>
              <Button
                variant="outlined"
                onClick={handleCancel}
                disabled={loading}
                sx={{ mx: 2 }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                startIcon={
                  loading ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : null
                }
              >
                {loading ? "Creating..." : "Create Ticket"}
              </Button>
            </div>
          </Stack>
        </Box>
      </Box>
    </Container>
  );
}
