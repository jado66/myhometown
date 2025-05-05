"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  IconButton,
} from "@mui/material";
import { Delete } from "@mui/icons-material";
import UploadImage from "@/components/util/UploadImage";

interface TaskImage {
  type: "before" | "during" | "after";
  url: string;
}

interface Task {
  id: string;
  priority: number;
  todos: string[];
  images: TaskImage[];
}

interface TaskReportingTableProps {
  tasks: Task[];
  onChange: (updatedTasks: Task[]) => void;
  isLocked?: boolean;
  value?: Task[]; // Added value prop for consistency
}

const TaskReportingTable = ({
  tasks,
  onChange,
  isLocked = false,
  value,
}: TaskReportingTableProps) => {
  // Initialize with value first, then fallback to tasks, and ensure images array exists
  const [taskList, setTaskList] = useState<Task[]>(() => {
    if (value) {
      return value.map((task) => {
        // Ensure images array exists
        if (!task.images) {
          return { ...task, images: [] };
        }
        return task;
      });
    } else if (tasks) {
      return tasks.map((task) => {
        // Ensure images array exists
        if (!task.images) {
          return { ...task, images: [] };
        }
        return task;
      });
    }
    return [];
  });

  const handlePhotoUpload = (
    taskIndex: number,
    type: "before" | "during" | "after",
    url: string
  ) => {
    const newTasks = [...taskList];

    // Ensure images array exists
    if (!newTasks[taskIndex].images) {
      newTasks[taskIndex].images = [];
    }

    // Find if there's already an image of this type
    const existingImageIndex = newTasks[taskIndex].images.findIndex(
      (img) => img.type === type
    );

    if (existingImageIndex >= 0) {
      // Replace existing image
      newTasks[taskIndex].images[existingImageIndex].url = url;
    } else {
      // Add new image
      newTasks[taskIndex].images.push({ type, url });
    }

    setTaskList(newTasks);
    onChange(newTasks);
  };

  const handleRemovePhoto = (taskIndex: number, imageIndex: number) => {
    const newTasks = [...taskList];
    newTasks[taskIndex].images.splice(imageIndex, 1);
    setTaskList(newTasks);
    onChange(newTasks);
  };

  const getImageByType = (task: Task, type: "before" | "during" | "after") => {
    if (!task.images) return undefined;
    return task.images.find((img) => img.type === type);
  };

  return (
    <Box>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell style={{ padding: "6px", width: "100px" }}></TableCell>
              <TableCell style={{ padding: "6px", width: "400px" }}>
                Task Description
              </TableCell>
              <TableCell style={{ padding: "6px", width: "150px" }}>
                Before
              </TableCell>
              <TableCell style={{ padding: "6px", width: "150px" }}>
                During
              </TableCell>
              <TableCell style={{ padding: "6px", width: "150px" }}>
                After
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {taskList.map((task, taskIndex) => (
              <TableRow key={task.id || taskIndex}>
                <TableCell style={{ padding: "6px" }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <Typography sx={{ ml: isLocked ? 1 : 0 }}>
                      {task.priority}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell style={{ padding: "6px" }}>
                  <Typography>{task.todos[0]}</Typography>
                </TableCell>

                {/* Before Image Cell */}
                <TableCell style={{ padding: "6px" }}>
                  <ImageCell
                    image={getImageByType(task, "before")}
                    taskIndex={taskIndex}
                    type="before"
                    isLocked={isLocked}
                    onUpload={handlePhotoUpload}
                    onRemove={handleRemovePhoto}
                  />
                </TableCell>

                {/* During Image Cell */}
                <TableCell style={{ padding: "6px" }}>
                  <ImageCell
                    image={getImageByType(task, "during")}
                    taskIndex={taskIndex}
                    type="during"
                    isLocked={isLocked}
                    onUpload={handlePhotoUpload}
                    onRemove={handleRemovePhoto}
                  />
                </TableCell>

                {/* After Image Cell */}
                <TableCell style={{ padding: "6px" }}>
                  <ImageCell
                    image={getImageByType(task, "after")}
                    taskIndex={taskIndex}
                    type="after"
                    isLocked={isLocked}
                    onUpload={handlePhotoUpload}
                    onRemove={handleRemovePhoto}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

interface ImageCellProps {
  image?: TaskImage;
  taskIndex: number;
  type: "before" | "during" | "after";
  isLocked: boolean;
  onUpload: (
    taskIndex: number,
    type: "before" | "during" | "after",
    url: string
  ) => void;
  onRemove: (taskIndex: number, imageIndex: number) => void;
}

const ImageCell = ({
  image,
  taskIndex,
  type,
  isLocked,
  onUpload,
  onRemove,
}: ImageCellProps) => {
  // For the delete functionality, we just need a valid index to identify the image
  // when there is an image, we'll pass the taskIndex itself
  const imageIndex = image ? taskIndex : -1;

  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
      {image ? (
        <Box
          sx={{
            position: "relative",
            width: 100,
            height: 100,
          }}
        >
          <img
            src={image.url || "/placeholder.svg"}
            alt={`Task ${taskIndex + 1} ${type} photo`}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
          {!isLocked && (
            <IconButton
              size="small"
              sx={{
                position: "absolute",
                top: 0,
                right: 0,
                backgroundColor: "rgba(255,255,255,0.7)",
              }}
              onClick={() => onRemove(taskIndex, imageIndex)}
            >
              <Delete fontSize="small" />
            </IconButton>
          )}
        </Box>
      ) : (
        !isLocked && (
          <Box
            sx={{
              position: "relative",
              width: 100,
              height: 100,
              border: "2px dashed grey",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <UploadImage
              setUrl={(url) => onUpload(taskIndex, type, url)}
              onRemove={null}
              alwaysShow={false}
              right={false}
            />
          </Box>
        )
      )}
    </Box>
  );
};

export default TaskReportingTable;
