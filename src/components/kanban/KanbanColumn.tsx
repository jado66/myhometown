import { Droppable } from "react-beautiful-dnd";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { KanbanCard } from "./KanbanCard";
import { useState } from "react";
import type { Column, Task } from "@/types/kanban/KanbanTypes";
import { Stack } from "@mui/material";
import AssignmentIcon from "@mui/icons-material/Assignment";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";

import PlaylistAddCheckIcon from "@mui/icons-material/PlaylistAddCheck";
import { ReportGmailerrorred } from "@mui/icons-material";

interface KanbanColumnProps {
  column: Column;
  tasks: Task[];
  onDelete?: (taskId: string) => void;
  onArchive?: (taskId: string) => void;
  showArchive?: boolean;
  setShowArchive?: (show: boolean) => void;
}

// Helper to check if a task is archived
function isArchived(task: Task) {
  return !!task.is_hidden;
}

//   { name: "Purple", value: "#a16faf" },
//   { name: "Blue", value: "#1b75bc" },
//   { name: "Yellow", value: "#febc18" },
//   { name: "Green", value: "#318d43" },
//   { name: "Orange", value: "#e45620" },
export function KanbanColumn({
  column,
  tasks,
  onDelete,
  onArchive,
  showArchive,
  setShowArchive,
}: KanbanColumnProps) {
  // Map column IDs to icons and colors using custom palette
  const customColors = {
    purple: "#a16faf",
    blue: "#1b75bc",
    yellow: "#febc18",
    green: "#318d43",
    orange: "#e45620",
    grey: "#bdbdbd",
    darkGrey: "#616161",
  };

  const getColumnIconAndColor = (id: string) => {
    switch (id) {
      case "backlog":
        return {
          icon: <AssignmentIcon sx={{ color: customColors.darkGrey, mr: 1 }} />,
          color: customColors.darkGrey,
        };
      case "in-progress":
        return {
          icon: <HourglassEmptyIcon sx={{ color: customColors.blue, mr: 1 }} />,
          color: customColors.blue,
        };
      case "testing":
        return {
          icon: (
            <ReportGmailerrorred sx={{ color: customColors.orange, mr: 1 }} />
          ),
          color: customColors.orange,
        };
      case "done":
        return {
          icon: <CheckCircleIcon sx={{ color: customColors.green, mr: 1 }} />,
          color: customColors.green,
        };
      default:
        return {
          icon: <AssignmentIcon sx={{ color: customColors.grey, mr: 1 }} />,
          color: customColors.grey,
        };
    }
  };

  const { icon, color } = getColumnIconAndColor(column.id);

  // Show/hide archived toggle for done column (controlled from parent)
  const [hovered, setHovered] = useState(false);

  // Only for done column: filter tasks based on showArchive
  let displayTasks = tasks;
  if (column.id === "done" && showArchive === false) {
    displayTasks = tasks.filter((t) => !isArchived(t));
  }

  return (
    <Paper
      elevation={2}
      sx={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        minWidth: 0,
        p: 2,
        mx: 1,
        border: "1px solid #e0e0e0",
        bgcolor: "background.paper",
        flexShrink: 1,
        borderRadius: 2, // Consistent rounded corners
        position: "relative",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          mb: 2,
          position: "relative",
        }}
      >
        {icon}
        <Typography
          variant="h5"
          component="h2"
          sx={{
            textTransform: "capitalize",
            color,
            fontWeight: "bold",
            letterSpacing: 0.5,
          }}
        >
          {column.title}
        </Typography>
        {/* Show archive toggle only for done column and on hover */}
        {column.id === "done" && hovered && setShowArchive && (
          <Box sx={{ position: "absolute", right: 0, top: 0 }}>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
                fontSize: 14,
                color: color,
                background: "#f5f5f5",
                borderRadius: 8,
                padding: "2px 8px",
                marginLeft: 8,
              }}
            >
              <input
                type="checkbox"
                checked={!!showArchive}
                onChange={() => setShowArchive(!showArchive)}
                style={{ marginRight: 4 }}
              />
              Show Archive
            </label>
          </Box>
        )}
      </Box>
      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <Box
            ref={provided.innerRef}
            {...provided.droppableProps}
            sx={{
              flexGrow: 1,
              minHeight: 100,
              p: 1,
              borderRadius: 1,
              transition: "background-color 0.2s",
              bgcolor: snapshot.isDraggingOver ? "action.hover" : "transparent",
            }}
          >
            <Stack spacing={2}>
              {/* Use Stack for consistent spacing between cards */}
              {displayTasks.map((task, index) => (
                <KanbanCard
                  key={task.id}
                  task={task}
                  index={index}
                  onDelete={onDelete}
                  onArchive={onArchive}
                  columnId={column.id}
                />
              ))}
            </Stack>
            {provided.placeholder}
          </Box>
        )}
      </Droppable>
    </Paper>
  );
}
