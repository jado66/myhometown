"use client";

import { Droppable } from "react-beautiful-dnd";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { KanbanCard } from "./KanbanCard";
import { useState, useRef, useEffect } from "react";
import type { Column, Task } from "@/types/kanban/KanbanTypes";
import { Stack, Button, Collapse } from "@mui/material";
import AssignmentIcon from "@mui/icons-material/Assignment";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

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

  const [isExpanded, setIsExpanded] = useState(false);
  const [visibleCount, setVisibleCount] = useState(5); // Default to show 5 tickets
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate how many tickets can fit in the available space
  useEffect(() => {
    const calculateVisibleTickets = () => {
      if (containerRef.current) {
        // Approximate height per ticket (card + spacing)
        const ticketHeight = 120; // Adjust based on your card height
        const availableHeight = window.innerHeight - 300; // Account for header, padding, etc.
        const maxVisible = Math.max(
          3,
          Math.floor(availableHeight / ticketHeight)
        );
        setVisibleCount(maxVisible);
      }
    };

    calculateVisibleTickets();
    window.addEventListener("resize", calculateVisibleTickets);
    return () => window.removeEventListener("resize", calculateVisibleTickets);
  }, []);

  // Only for done column: filter tasks based on showArchive
  let displayTasks = tasks;
  if (column.id === "done" && showArchive === false) {
    displayTasks = tasks.filter((t) => !isArchived(t));
  }

  const visibleTasks = isExpanded
    ? displayTasks
    : displayTasks.slice(0, visibleCount);
  const overflowCount = displayTasks.length - visibleCount;
  const hasOverflow = overflowCount > 0 && !isExpanded;

  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

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
        borderRadius: 2,
        position: "relative",
        maxHeight: isExpanded ? "none" : "calc(100vh - 200px)",
        overflow: isExpanded ? "visible" : "hidden",
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
              maxHeight: isExpanded ? "calc(100vh - 200px)" : "auto",
              p: 1,
              borderRadius: 1,
              transition: "background-color 0.2s",
              bgcolor: snapshot.isDraggingOver ? "action.hover" : "transparent",
              overflow: isExpanded ? "auto" : "hidden",
              overflowX: "hidden",
              overflowY: isExpanded ? "auto" : "hidden",
            }}
          >
            <div ref={containerRef}>
              <Stack spacing={2}>
                {visibleTasks.map((task, index) => (
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

              {hasOverflow && (
                <Button
                  onClick={handleToggleExpand}
                  sx={{
                    mt: 2,
                    width: "100%",
                    color: color,
                    borderColor: color,
                    "&:hover": {
                      borderColor: color,
                      backgroundColor: `${color}10`,
                    },
                  }}
                  variant="outlined"
                  startIcon={<ExpandMoreIcon />}
                >
                  + {overflowCount} more
                </Button>
              )}

              <Collapse in={isExpanded}>
                {isExpanded && overflowCount > 0 && (
                  <Stack spacing={2} sx={{ mt: 2 }}>
                    {displayTasks.slice(visibleCount).map((task, index) => (
                      <KanbanCard
                        key={task.id}
                        task={task}
                        index={index + visibleCount}
                        onDelete={onDelete}
                        onArchive={onArchive}
                        columnId={column.id}
                      />
                    ))}
                  </Stack>
                )}

                {isExpanded && overflowCount > 0 && (
                  <Button
                    onClick={handleToggleExpand}
                    sx={{
                      mt: 2,
                      width: "100%",
                      color: color,
                      borderColor: color,
                      "&:hover": {
                        borderColor: color,
                        backgroundColor: `${color}10`,
                      },
                    }}
                    variant="outlined"
                    startIcon={<ExpandLessIcon />}
                  >
                    Show less
                  </Button>
                )}
              </Collapse>
            </div>
            {provided.placeholder}
          </Box>
        )}
      </Droppable>
    </Paper>
  );
}
