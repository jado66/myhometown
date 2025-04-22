"use client";

import { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  IconButton,
  Button,
  Typography,
  FormControlLabel,
  Checkbox,
  SvgIcon,
} from "@mui/material";
import { Add, Delete } from "@mui/icons-material";
import UploadImage from "@/components/util/UploadImage";

const TaskTable = ({ value, onChange, hasPrepDay = false, isLocked }) => {
  const [tasks, setTasks] = useState(
    value?.tasks || [
      {
        id: "1",
        priority: 1,
        todos: [""],
        photos: [],
        isPrepDay: false,
      },
    ]
  );
  const DragHandle = () => (
    <SvgIcon
      sx={{
        cursor: "grab",
        "&:hover": {
          color: "primary.main",
        },
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="32"
        height="32"
        viewBox="0 0 32 32"
      >
        <path
          fill="currentColor"
          d="M4 20h11v6.17l-2.59-2.58L11 25l5 5l5-5l-1.41-1.41L17 26.17V20h11v-2H4zm7-13l1.41 1.41L15 5.83V12H4v2h24v-2H17V5.83l2.59 2.58L21 7l-5-5z"
        />
      </svg>
    </SvgIcon>
  );

  const [volunteerTools, setVolunteerTools] = useState(
    value?.volunteerTools || []
  );
  const [equipment, setEquipment] = useState(value?.equipment || []);

  // Improved function to reassign priorities based on index
  const reassignPriorities = (taskList) => {
    if (!hasPrepDay) {
      // If no prep day, simply assign priorities based on index
      return taskList.map((task, index) => ({
        ...task,
        priority: index + 1,
      }));
    }

    // With prep day, we split tasks into two groups and assign priorities
    // separately within each group
    const prepDayTasks = [];
    const regularTasks = [];

    // First, separate tasks into two arrays
    taskList.forEach((task) => {
      if (task.isPrepDay) {
        prepDayTasks.push(task);
      } else {
        regularTasks.push(task);
      }
    });

    // Assign priorities for each group
    const updatedPrepDayTasks = prepDayTasks.map((task, index) => ({
      ...task,
      priority: index + 1,
    }));

    const updatedRegularTasks = regularTasks.map((task, index) => ({
      ...task,
      priority: index + 1,
    }));

    // Return the combined array with prep day tasks first
    return [...updatedPrepDayTasks, ...updatedRegularTasks];
  };

  // Sort tasks to show prep day tasks first if hasPrepDay is true
  const sortedTasks = hasPrepDay
    ? [...tasks].sort((a, b) => {
        // First sort by isPrepDay (prep day tasks first)
        if (a.isPrepDay && !b.isPrepDay) return -1;
        if (!a.isPrepDay && b.isPrepDay) return 1;
        // Then sort by priority within each group
        return a.priority - b.priority;
      })
    : [...tasks].sort((a, b) => a.priority - b.priority);

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(tasks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Recalculate priorities after reordering
    const updatedItems = reassignPriorities(items);

    setTasks(updatedItems);
    updateParent(updatedItems, volunteerTools, equipment);
  };

  const updateParent = (newTasks, newVolunteerTools, newEquipment) => {
    onChange({
      tasks: newTasks,
      volunteerTools: newVolunteerTools,
      equipment: newEquipment,
    });
  };

  const handleAddTask = () => {
    const isPrep = hasPrepDay && tasks.some((t) => t.isPrepDay);
    let newPriority = 1;

    // Calculate correct priority for the new task
    if (hasPrepDay) {
      const sameCategoryTasks = tasks.filter((t) => t.isPrepDay === isPrep);
      newPriority = sameCategoryTasks.length + 1;
    } else {
      newPriority = tasks.length + 1;
    }

    const newTask = {
      id: Date.now().toString(),
      priority: newPriority,
      todos: [""],
      photos: [],
      isPrepDay: false,
    };

    const newTasks = [...tasks, newTask];
    // Reassign all priorities to ensure consistency
    const updatedTasks = reassignPriorities(newTasks);

    setTasks(updatedTasks);
    updateParent(updatedTasks, volunteerTools, equipment);
  };

  const handleTodoKeyDown = (e, taskIndex, todoIndex) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const newTasks = [...tasks];
      newTasks[taskIndex].todos.splice(todoIndex + 1, 0, "");
      setTasks(newTasks);
      updateParent(newTasks, volunteerTools, equipment);
    } else if (
      e.key === "Backspace" &&
      e.target.value === "" &&
      todoIndex > 0
    ) {
      e.preventDefault();
      const newTasks = [...tasks];
      newTasks[taskIndex].todos.splice(todoIndex, 1);
      setTasks(newTasks);
      updateParent(newTasks, volunteerTools, equipment);
    }
  };

  const handleTodoChange = (taskIndex, todoIndex, value) => {
    const newTasks = [...tasks];
    newTasks[taskIndex].todos[todoIndex] = value;
    setTasks(newTasks);
    updateParent(newTasks, volunteerTools, equipment);
  };

  const handlePhotoUpload = (taskIndex, url) => {
    const newTasks = [...tasks];
    newTasks[taskIndex].photos.push(url);
    setTasks(newTasks);
    updateParent(newTasks, volunteerTools, equipment);
  };

  const handleRemovePhoto = (taskIndex, photoIndex) => {
    const newTasks = [...tasks];
    newTasks[taskIndex].photos.splice(photoIndex, 1);
    setTasks(newTasks);
    updateParent(newTasks, volunteerTools, equipment);
  };

  const handleAddTool = (value, isEquipment = false) => {
    if (value.trim()) {
      if (isEquipment) {
        const newEquipment = [...equipment, value.trim()];
        setEquipment(newEquipment);
        updateParent(tasks, volunteerTools, newEquipment);
      } else {
        const newVolunteerTools = [...volunteerTools, value.trim()];
        setVolunteerTools(newVolunteerTools);
        updateParent(tasks, newVolunteerTools, equipment);
      }
    }
  };

  const handleRemoveTool = (index, isEquipment = false) => {
    if (isEquipment) {
      const newEquipment = equipment.filter((_, i) => i !== index);
      setEquipment(newEquipment);
      updateParent(tasks, volunteerTools, newEquipment);
    } else {
      const newVolunteerTools = volunteerTools.filter((_, i) => i !== index);
      setVolunteerTools(newVolunteerTools);
      updateParent(tasks, newVolunteerTools, equipment);
    }
  };

  const handleTogglePrepDay = (taskIndex) => {
    const newTasks = [...tasks];
    newTasks[taskIndex].isPrepDay = !newTasks[taskIndex].isPrepDay;

    // Reassign priorities after toggling prep day status
    const updatedTasks = reassignPriorities(newTasks);

    setTasks(updatedTasks);
    updateParent(updatedTasks, volunteerTools, equipment);
  };

  const handleDeleteTask = (taskIndex) => {
    const newTasks = tasks.filter((_, index) => index !== taskIndex);

    // Reassign priorities after deleting a task
    const updatedTasks = reassignPriorities(newTasks);

    setTasks(updatedTasks);
    updateParent(updatedTasks, volunteerTools, equipment);
  };

  return (
    <Box>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell style={{ padding: "6px", width: "100px" }}>
                Priority
              </TableCell>
              {hasPrepDay && (
                <TableCell style={{ padding: "6px", width: "100px" }}>
                  Prep Day
                </TableCell>
              )}
              <TableCell style={{ padding: "6px", width: "400px" }}>
                Task List
              </TableCell>
              <TableCell style={{ padding: "6px", width: "150px" }}>
                Photos
              </TableCell>
            </TableRow>
          </TableHead>
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="tasks">
              {(provided) => (
                <TableBody {...provided.droppableProps} ref={provided.innerRef}>
                  {sortedTasks.map((task, taskIndex) => (
                    <Draggable
                      key={task.id}
                      draggableId={task.id}
                      index={taskIndex}
                    >
                      {(provided) => (
                        <TableRow
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          sx={{
                            backgroundColor:
                              hasPrepDay && task.isPrepDay
                                ? "rgba(144, 249, 153, 0.2)"
                                : "inherit",
                          }}
                        >
                          <TableCell style={{ padding: "6px" }}>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              {!isLocked && (
                                <span {...provided.dragHandleProps}>
                                  <DragHandle />
                                </span>
                              )}
                              <Typography sx={{ ml: isLocked && 1 }}>
                                {taskIndex + 1}
                              </Typography>
                              {!isLocked && (
                                <IconButton
                                  size="small"
                                  onClick={() => handleDeleteTask(taskIndex)}
                                >
                                  <Delete fontSize="small" />
                                </IconButton>
                              )}
                            </Box>
                          </TableCell>
                          {hasPrepDay && (
                            <TableCell style={{ padding: "6px" }}>
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    checked={task.isPrepDay || false}
                                    onChange={() =>
                                      handleTogglePrepDay(taskIndex)
                                    }
                                    size="small"
                                    disabled={isLocked}
                                  />
                                }
                                label=""
                              />
                            </TableCell>
                          )}
                          <TableCell style={{ padding: "6px" }}>
                            <Box
                              sx={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 1,
                              }}
                            >
                              {task.todos.map((todo, todoIndex) => (
                                <TextField
                                  key={`${task.id}-todo-${todoIndex}`}
                                  size="small"
                                  value={todo}
                                  onChange={(e) =>
                                    handleTodoChange(
                                      taskIndex,
                                      todoIndex,
                                      e.target.value
                                    )
                                  }
                                  onKeyDown={(e) =>
                                    handleTodoKeyDown(e, taskIndex, todoIndex)
                                  }
                                  variant="standard"
                                  fullWidth
                                  disabled={isLocked}
                                />
                              ))}
                            </Box>
                          </TableCell>
                          <TableCell style={{ padding: "6px" }}>
                            <Box
                              sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}
                            >
                              {task.photos.map((photo, photoIndex) => (
                                <Box
                                  key={photoIndex}
                                  sx={{
                                    position: "relative",
                                    width: 100,
                                    height: 100,
                                  }}
                                >
                                  <img
                                    src={photo || "/placeholder.svg"}
                                    alt={`Task ${task.priority} photo ${
                                      photoIndex + 1
                                    }`}
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
                                        backgroundColor:
                                          "rgba(255,255,255,0.7)",
                                      }}
                                      onClick={() =>
                                        handleRemovePhoto(taskIndex, photoIndex)
                                      }
                                    >
                                      <Delete fontSize="small" />
                                    </IconButton>
                                  )}
                                </Box>
                              ))}
                              {!isLocked && (
                                <Box
                                  sx={{
                                    position: "relative",
                                    width: 100,
                                    height: 100,
                                    border: "2px dashed grey",
                                    display:
                                      task.photos.length === 0
                                        ? "block"
                                        : "none",
                                  }}
                                >
                                  <UploadImage
                                    setUrl={(url) =>
                                      handlePhotoUpload(taskIndex, url)
                                    }
                                  />
                                </Box>
                              )}
                            </Box>
                          </TableCell>
                        </TableRow>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </TableBody>
              )}
            </Droppable>
          </DragDropContext>
        </Table>
      </TableContainer>
      {!isLocked && (
        <Button
          startIcon={<Add />}
          onClick={handleAddTask}
          sx={{ mt: 2, mb: 4 }}
        >
          Add Task
        </Button>
      )}
    </Box>
  );
};

export default TaskTable;
