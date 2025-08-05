"use client";

import { useState, useEffect } from "react";
import { DragDropContext, type DropResult } from "react-beautiful-dnd";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Link from "next/link";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import { TicketForm } from "./TicketForm";
import type { ColumnId } from "@/types/kanban/KanbanTypes";
// import { useKanbanData } from "@/hooks/use-kanban-data";
import { KanbanColumn } from "./KanbanColumn";
import AskYesNoDialog from "../util/AskYesNoDialog";
import { useKanbanData } from "@/hooks/use-kanban-data";
import {
  CircularProgress,
  Container,
  Alert,
  Stack,
  Divider,
} from "@mui/material";

export function KanbanBoard() {
  const {
    boardData,
    loading,
    error,
    updateTaskStatusAndPriority,
    deleteTask,
    refetchTasks,
    archiveTask,
    showArchived,
    setShowArchived,
  } = useKanbanData();
  const [localBoardData, setLocalBoardData] = useState(boardData);
  const [ticketDialogOpen, setTicketDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);

  // Archive handler
  const handleArchiveClick = async (taskId: string) => {
    // Optimistically update local state
    if (localBoardData) {
      const updatedTasks = { ...localBoardData.tasks };
      if (updatedTasks[taskId]) {
        updatedTasks[taskId] = { ...updatedTasks[taskId], is_hidden: true };
      }
      setLocalBoardData({ ...localBoardData, tasks: updatedTasks });
    }
    try {
      await archiveTask(taskId);
    } catch (err) {
      setError("Failed to archive task. Please try again.");
      refetchTasks();
    }
  };

  // Handle delete button click
  const handleDeleteClick = (taskId: string) => {
    setTaskToDelete(taskId);
    setDeleteDialogOpen(true);
  };

  // Confirm deletion
  const handleConfirmDelete = async () => {
    if (!taskToDelete) return;
    setDeleteDialogOpen(false);
    // Optimistically update local state first
    if (localBoardData) {
      const updatedTasks = { ...localBoardData.tasks };
      delete updatedTasks[taskToDelete];
      const updatedColumns = { ...localBoardData.columns };
      for (const colId in updatedColumns) {
        updatedColumns[colId] = {
          ...updatedColumns[colId],
          taskIds: updatedColumns[colId].taskIds.filter(
            (id) => id !== taskToDelete
          ),
        };
      }
      setLocalBoardData({
        ...localBoardData,
        tasks: updatedTasks,
        columns: updatedColumns,
      });
    }
    try {
      await deleteTask(taskToDelete);
    } catch (err) {
      setError("Failed to delete task. Please try again.");
      refetchTasks();
    }
    setTaskToDelete(null);
  };

  // Cancel deletion
  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setTaskToDelete(null);
  };

  // Sync localBoardData with boardData when boardData changes
  useEffect(() => {
    if (boardData) {
      setLocalBoardData(boardData);
    }
  }, [boardData]);

  const [localError, setError] = useState<string | null>(null);

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination || !localBoardData) {
      return;
    }
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const startColumn = localBoardData.columns[source.droppableId as ColumnId];
    const endColumn =
      localBoardData.columns[destination.droppableId as ColumnId];
    const draggedTask = localBoardData.tasks[draggableId];

    // Optimistic update
    const newBoardData = { ...localBoardData };

    if (startColumn.id === endColumn.id) {
      // Moving within the same column
      const newTaskIds = Array.from(startColumn.taskIds);
      newTaskIds.splice(source.index, 1);
      newTaskIds.splice(destination.index, 0, draggableId);

      const newColumn = {
        ...startColumn,
        taskIds: newTaskIds,
      };

      newBoardData.columns = {
        ...newBoardData.columns,
        [newColumn.id]: newColumn,
      };

      // Update priorities for tasks in the affected column
      const affectedTasksInColumn = newTaskIds.map((id, index) => ({
        ...newBoardData.tasks[id],
        priority: index,
      }));

      setLocalBoardData(newBoardData);

      try {
        await updateTaskStatusAndPriority(
          draggableId,
          endColumn.id,
          destination.index,
          affectedTasksInColumn
        );
      } catch (err) {
        console.error("Failed to update task in Supabase:", err);
        // Revert if update fails
        setLocalBoardData(localBoardData);
        setError("Failed to update task. Please try again.");
        refetchTasks();
      }
      // Only refetch if error, not on success
    } else {
      // Moving to a different column
      const startTaskIds = Array.from(startColumn.taskIds);
      startTaskIds.splice(source.index, 1);

      const newStartColumn = {
        ...startColumn,
        taskIds: startTaskIds,
      };

      const endTaskIds = Array.from(endColumn.taskIds);
      endTaskIds.splice(destination.index, 0, draggableId);

      const newEndColumn = {
        ...endColumn,
        taskIds: endTaskIds,
      };

      newBoardData.columns = {
        ...newBoardData.columns,
        [newStartColumn.id]: newStartColumn,
        [newEndColumn.id]: newEndColumn,
      };
      newBoardData.tasks[draggableId] = {
        ...draggedTask,
        status: endColumn.id,
      };

      // Update priorities for tasks in the affected end column
      const affectedTasksInEndColumn = endTaskIds.map((id, index) => ({
        ...newBoardData.tasks[id],
        priority: index,
      }));

      setLocalBoardData(newBoardData);

      try {
        await updateTaskStatusAndPriority(
          draggableId,
          endColumn.id,
          destination.index,
          affectedTasksInEndColumn
        );
      } catch (err) {
        console.error("Failed to update task in Supabase:", err);
        // Revert if update fails
        setLocalBoardData(localBoardData);
        setError("Failed to update task. Please try again.");
        refetchTasks();
      }
      // Only refetch if error, not on success
    }
  };

  const rootUrl = process.env.NEXT_PUBLIC_DOMAIN;

  // Handler for opening/closing the ticket dialog
  const handleOpenTicketDialog = () => setTicketDialogOpen(true);
  const handleCloseTicketDialog = () => setTicketDialogOpen(false);

  // After ticket creation, update local board data without refetching
  const handleTicketCreated = (newTask: any) => {
    setTicketDialogOpen(false);
    if (!localBoardData) return;
    // Add new task to tasks
    const updatedTasks = { ...localBoardData.tasks, [newTask.id]: newTask };
    // Add to backlog column at the end
    const backlogColumn = localBoardData.columns["backlog"];
    const updatedBacklogTaskIds = [...backlogColumn.taskIds, newTask.id];
    const updatedColumns = {
      ...localBoardData.columns,
      backlog: { ...backlogColumn, taskIds: updatedBacklogTaskIds },
    };
    setLocalBoardData({
      ...localBoardData,
      tasks: updatedTasks,
      columns: updatedColumns,
    });
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          gap: 2,
        }}
      >
        <CircularProgress />
        <Typography variant="h6" color="text.secondary">
          Loading Development Board...
        </Typography>
      </Box>
    );
  }

  if (localError) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          p: 3,
        }}
      >
        <Alert severity="error" sx={{ width: "100%", maxWidth: 500 }}>
          <Typography variant="h6" component="span">
            Error:
          </Typography>{" "}
          {localError}
        </Alert>
      </Box>
    );
  }

  if (!localBoardData) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          gap: 2,
        }}
      >
        <Typography variant="h6" color="text.secondary">
          No tasks available.
        </Typography>
        <Button
          variant="contained"
          onClick={handleOpenTicketDialog}
          sx={{ textDecoration: "none", color: "white" }}
        >
          Create Your First Ticket
        </Button>

        <Dialog
          open={ticketDialogOpen}
          onClose={handleCloseTicketDialog}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ m: 0, p: 2 }}>
            Create New Ticket
            <IconButton
              aria-label="close"
              onClick={handleCloseTicketDialog}
              sx={{
                position: "absolute",
                right: 8,
                top: 8,
                color: (theme) => theme.palette.grey[500],
              }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <TicketForm
            onSuccess={handleCloseTicketDialog}
            onCancel={handleCloseTicketDialog}
            onTicketCreated={handleTicketCreated}
          />
        </Dialog>
      </Box>
    );
  }

  return (
    <>
      <DragDropContext onDragEnd={onDragEnd}>
        <Container
          maxWidth={false}
          sx={{
            display: "flex",
            flexDirection: "column",
            height: "100vh",
            p: 3,
            bgcolor: "background.default",
          }}
        >
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            mb={3}
            spacing={2}
          >
            <Typography variant="h4" component="h1" color="text.primary">
              Development Board
            </Typography>
            <Button
              variant="contained"
              onClick={handleOpenTicketDialog}
              sx={{ textDecoration: "none", color: "white" }}
            >
              Create New Ticket
            </Button>
          </Stack>
          <Divider sx={{ mb: 3 }} />
          <Box sx={{ display: "flex", flexGrow: 1, overflowX: "auto", pb: 2 }}>
            {localBoardData.columnOrder.map((columnId) => {
              const column = localBoardData.columns[columnId];
              const tasks = (column?.taskIds).map(
                (taskId) => localBoardData.tasks[taskId]
              );
              // Only pass showArchive/setShowArchive to the done column
              const isDone = column.id === "done";
              return (
                <KanbanColumn
                  key={column.id}
                  column={column}
                  tasks={tasks}
                  onDelete={handleDeleteClick}
                  onArchive={handleArchiveClick}
                  {...(isDone
                    ? {
                        showArchive: showArchived,
                        setShowArchive: setShowArchived,
                      }
                    : {})}
                />
              );
            })}
          </Box>
        </Container>
      </DragDropContext>

      <Dialog
        open={ticketDialogOpen}
        onClose={handleCloseTicketDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ m: 0, p: 2 }}>
          Create New Ticket
          <IconButton
            aria-label="close"
            onClick={handleCloseTicketDialog}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <TicketForm
          onSuccess={handleCloseTicketDialog}
          onCancel={handleCloseTicketDialog}
          onTicketCreated={handleTicketCreated}
        />
      </Dialog>
      <AskYesNoDialog
        open={deleteDialogOpen}
        title="Delete Task?"
        description="Are you sure you want to delete this task? This action cannot be undone."
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        onClose={handleCancelDelete}
      />
    </>
  );
}
