import { Draggable } from "react-beautiful-dnd";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import PlaylistAddCheckIcon from "@mui/icons-material/PlaylistAddCheck";
import BookIcon from "@mui/icons-material/Book";
import TaskIcon from "@mui/icons-material/Task";
import BugReportIcon from "@mui/icons-material/BugReport";
import Tooltip from "@mui/material/Tooltip";
import type { Task } from "@/types/kanban/KanbanTypes";

interface KanbanCardProps {
  task: Task;
  index: number;
  onDelete?: (taskId: string) => void;
  onArchive?: (taskId: string) => void;
  columnId?: string;
}

const getTaskTypeIcon = (type: string) => {
  switch (type) {
    case "Story":
      return <BookIcon fontSize="small" sx={{ color: "#4caf50" }} />;
    case "Task":
      return <TaskIcon fontSize="small" sx={{ color: "#2196f3" }} />;
    case "Bug":
      return <BugReportIcon fontSize="small" sx={{ color: "#f44336" }} />;
    default:
      return <BookIcon fontSize="small" sx={{ color: "#4caf50" }} />;
  }
};

export function KanbanCard({
  task,
  index,
  onDelete,
  onArchive,
  columnId,
}: KanbanCardProps) {
  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <Card
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          sx={{
            mb: 2,
            border: snapshot.isDragging
              ? "2px solid #1976d2"
              : "1px solid #e0e0e0",
            boxShadow: snapshot.isDragging ? 6 : 1,
            transition: "box-shadow 0.2s, border 0.2s",
            "&:hover": {
              boxShadow: 3,
              borderColor: "#bdbdbd",
            },
            borderRadius: 2,
            position: "relative",
          }}
        >
          <CardContent
            sx={{ p: 2, "&:last-child": { pb: 2 }, position: "relative" }}
          >
            {/* Task type icon at top right */}
            <Tooltip title={task.type || "Story"} arrow>
              <div
                style={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  zIndex: 1,
                }}
              >
                {getTaskTypeIcon(task.type || "Story")}
              </div>
            </Tooltip>

            <Typography
              variant="subtitle1"
              component="h3"
              sx={{
                mb: 0.5,
                color: "text.primary",
                fontWeight: "medium",
                pr: 4, // Add padding to avoid overlap with type icon
              }}
            >
              {task.title}
            </Typography>
            {task.description && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  mb: 1,
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {task.description}
              </Typography>
            )}
            <Typography variant="caption" color="text.disabled">
              Created: {new Date(task.created_at).toLocaleDateString()}
            </Typography>
            {onDelete && (
              <IconButton
                aria-label="delete"
                size="small"
                onClick={() => onDelete(task.id)}
                sx={{
                  position: "absolute",
                  top: 36, // Moved down to avoid overlap with type icon
                  right: 4,
                  zIndex: 2,
                  opacity: 0,
                  transition: "opacity 0.2s",
                  pointerEvents: "none",
                  // Show on hover of parent Card
                  ".MuiCard-root:hover &": {
                    opacity: 1,
                    pointerEvents: "auto",
                  },
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            )}
            {/* Archive button for done column, only if not already hidden */}
            {onArchive && columnId === "done" && !task.is_hidden && (
              <Tooltip title="Archive task" arrow>
                <IconButton
                  aria-label="archive"
                  size="small"
                  onClick={() => onArchive(task.id)}
                  sx={{
                    position: "absolute",
                    bottom: 4,
                    right: 4,
                    zIndex: 2,
                    opacity: 0,
                    transition: "opacity 0.2s",
                    pointerEvents: "none",
                    color: "#a16faf",
                    // Show on hover of parent Card
                    ".MuiCard-root:hover &": {
                      opacity: 1,
                      pointerEvents: "auto",
                    },
                  }}
                >
                  <PlaylistAddCheckIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </CardContent>
        </Card>
      )}
    </Draggable>
  );
}
