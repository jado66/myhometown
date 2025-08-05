"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import { useKanbanData } from "@/hooks/use-kanban-data";
import { Alert, CircularProgress, Container, Stack } from "@mui/material";

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
      const newTask = await createTask(title, description.trim() || null);
      if (onTicketCreated) {
        onTicketCreated(newTask);
      }
      if (onSuccess) {
        onSuccess();
      } else {
        const rootUrl = process.env.NEXT_PUBLIC_DOMAIN;
        router.push(`${rootUrl}/admin-dashboard/tasks`);
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
          />
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
            justifyContent="flex-end"
            spacing={2}
            sx={{ mt: 3 }}
          >
            <Button
              variant="outlined"
              onClick={handleCancel}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              startIcon={
                loading ? <CircularProgress size={20} color="inherit" /> : null
              }
            >
              {loading ? "Creating..." : "Create Ticket"}
            </Button>
          </Stack>
        </Box>
      </Box>
    </Container>
  );
}
