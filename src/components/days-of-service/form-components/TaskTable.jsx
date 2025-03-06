import React, { useState, useRef } from "react";
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
  Chip,
  IconButton,
  Button,
  Typography,
} from "@mui/material";
import { DragIndicator, Add, Delete } from "@mui/icons-material";
import UploadImage from "@/components/util/UploadImage";

const TaskTable = ({ value, onChange }) => {
  const [tasks, setTasks] = useState(
    value?.tasks || [
      {
        id: "1",
        priority: 1,
        todos: [""],
        photos: [],
      },
    ]
  );

  const [volunteerTools, setVolunteerTools] = useState(
    value?.volunteerTools || []
  );
  const [equipment, setEquipment] = useState(value?.equipment || []);

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(tasks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const updatedItems = items.map((item, index) => ({
      ...item,
      priority: index + 1,
    }));

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
    const newTask = {
      id: Date.now().toString(),
      priority: tasks.length + 1,
      todos: [""],
      photos: [],
    };
    const newTasks = [...tasks, newTask];
    setTasks(newTasks);
    updateParent(newTasks, volunteerTools, equipment);
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

  return (
    <Box>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell style={{ padding: "6px", width: "100px" }}>
                Priority
              </TableCell>
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
                  {tasks.map((task, taskIndex) => (
                    <Draggable
                      key={task.id}
                      draggableId={task.id}
                      index={taskIndex}
                    >
                      {(provided) => (
                        <TableRow
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                        >
                          <TableCell style={{ padding: "6px" }}>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              <span {...provided.dragHandleProps}>
                                <DragIndicator />
                              </span>
                              {task.priority}
                              <IconButton
                                size="small"
                                onClick={() => {
                                  const newTasks = tasks
                                    .filter((_, index) => index !== taskIndex)
                                    .map((task, index) => ({
                                      ...task,
                                      priority: index + 1,
                                    }));
                                  setTasks(newTasks);
                                  updateParent(
                                    newTasks,
                                    volunteerTools,
                                    equipment
                                  );
                                }}
                              >
                                <Delete fontSize="small" />
                              </IconButton>
                            </Box>
                          </TableCell>
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
                                  key={todoIndex}
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
                                    src={photo}
                                    alt={`Task ${task.priority} photo ${
                                      photoIndex + 1
                                    }`}
                                    style={{
                                      width: "100%",
                                      height: "100%",
                                      objectFit: "cover",
                                    }}
                                  />
                                  <IconButton
                                    size="small"
                                    sx={{
                                      position: "absolute",
                                      top: 0,
                                      right: 0,
                                      backgroundColor: "rgba(255,255,255,0.7)",
                                    }}
                                    onClick={() =>
                                      handleRemovePhoto(taskIndex, photoIndex)
                                    }
                                  >
                                    <Delete fontSize="small" />
                                  </IconButton>
                                </Box>
                              ))}
                              <Box
                                sx={{
                                  position: "relative",
                                  width: 100,
                                  height: 100,
                                  border: "2px dashed grey",
                                  display:
                                    task.photos.length === 0 ? "block" : "none",
                                }}
                              >
                                <UploadImage
                                  setUrl={(url) =>
                                    handlePhotoUpload(taskIndex, url)
                                  }
                                />
                              </Box>
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
      <Button startIcon={<Add />} onClick={handleAddTask} sx={{ mt: 2, mb: 4 }}>
        Add Task
      </Button>

      {/* Tools and Equipment Section - uncomment and complete if needed */}
      {/* 
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6">Volunteer Tools</Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {volunteerTools.map((tool, index) => (
            <Chip
              key={index}
              label={tool}
              onDelete={() => handleRemoveTool(index)}
            />
          ))}
        </Box>
      </Box>
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6">Equipment</Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {equipment.map((item, index) => (
            <Chip
              key={index}
              label={item}
              onDelete={() => handleRemoveTool(index, true)}
            />
          ))}
        </Box>
      </Box>
      */}
    </Box>
  );
};

export default TaskTable;
