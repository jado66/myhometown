"use client";
import { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import {
  Button,
  Typography,
  Container,
  Box,
  FormControl,
  OutlinedInput,
  FormControlLabel,
  Checkbox,
  MenuItem,
  Select,
  InputLabel,
  Paper,
  TextField,
  Divider,
  Stack,
  Alert,
} from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";

import { AVAILABLE_FIELDS } from "./AvailableFields";
import { FieldSelectorDialog } from "./FieldSelectorDialog";
import { FormField } from "./FormFields";
import { FieldEditor } from "./FieldEditor";
import { StructuralElementAdder } from "./StructuralElementAdder";

// Initial default visible fields
const DEFAULT_VISIBLE_FIELDS = [
  "firstName",
  "lastName",
  "email",
  "phone",
  "dob",
  "gender",
];

const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export default function ClassSignup() {
  const [isEditMode, setIsEditMode] = useState(false);
  const [isFieldSelectorOpen, setIsFieldSelectorOpen] = useState(false);
  const [className, setClassName] = useState("Class");
  const [classDescription, setClassDescription] = useState("");
  const [formConfig, setFormConfig] = useState(
    DEFAULT_VISIBLE_FIELDS.reduce((acc, key) => {
      acc[key] = {
        ...AVAILABLE_FIELDS[key],
        visible: true,
      };
      return acc;
    }, {})
  );

  const [classConfig, setClassConfig] = useState({
    className: "Class",
    description: "",
    startDate: "",
    endDate: "",
    meetingDays: [],
    startTime: "",
    endTime: "",
    location: "",
    capacity: "",
    showCapacity: false,
  });

  const [fieldOrder, setFieldOrder] = useState(DEFAULT_VISIBLE_FIELDS);
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleClassConfigChange = (field, value) => {
    setClassConfig((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFieldUpdate = (field, newConfig) => {
    setFormConfig((prev) => ({
      ...prev,
      [field]: newConfig,
    }));
  };

  const handleAddElement = (elementId, elementConfig) => {
    setFormConfig((prev) => ({
      ...prev,
      [elementId]: elementConfig,
    }));
    setFieldOrder((prev) => [...prev, elementId]);
  };

  const handleAddFields = (newFields) => {
    const newConfig = { ...formConfig };
    const newOrder = [...fieldOrder];

    newFields.forEach((field) => {
      newConfig[field] = {
        ...AVAILABLE_FIELDS[field],
        visible: true, // Set visible to true by default
      };
      newOrder.push(field);
    });

    setFormConfig(newConfig);
    setFieldOrder(newOrder);
  };

  const handleRemoveField = (fieldToRemove) => {
    const newConfig = { ...formConfig };
    delete newConfig[fieldToRemove];

    setFormConfig(newConfig);
    setFieldOrder(fieldOrder.filter((field) => field !== fieldToRemove));
  };

  const handleFormChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: null,
      }));
    }
  };

  const validateClassConfig = () => {
    const newErrors = {};
    const now = new Date();
    const startDate = new Date(classConfig.startDate);
    const endDate = new Date(classConfig.endDate);

    if (!classConfig.className.trim()) {
      newErrors.className = "Class name is required";
    }

    if (!classConfig.startDate) {
      newErrors.startDate = "Start date is required";
    } else if (startDate < now) {
      newErrors.startDate = "Start date must be in the future";
    }

    if (!classConfig.endDate) {
      newErrors.endDate = "End date is required";
    } else if (endDate < startDate) {
      newErrors.endDate = "End date must be after start date";
    }

    if (!classConfig.meetingDays.length) {
      newErrors.meetingDays = "At least one meeting day is required";
    }

    if (!classConfig.startTime) {
      newErrors.startTime = "Start time is required";
    }

    if (!classConfig.endTime) {
      newErrors.endTime = "End time is required";
    } else if (
      classConfig.startTime &&
      classConfig.endTime <= classConfig.startTime
    ) {
      newErrors.endTime = "End time must be after start time";
    }

    if (!classConfig.location.trim()) {
      newErrors.location = "Location is required";
    }

    if (
      classConfig.capacity &&
      (isNaN(classConfig.capacity) || Number(classConfig.capacity) < 1)
    ) {
      newErrors.capacity = "Capacity must be a positive number";
    }

    return newErrors;
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    Object.entries(formConfig).forEach(([field, config]) => {
      if (config.visible) {
        const value = formData[field] || "";
        if (config.required && !value) {
          newErrors[field] = "This field is required";
          isValid = false;
        } else if (config.validation && value) {
          const error = config.validation(value);
          if (error) {
            newErrors[field] = error;
            isValid = false;
          }
        }
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setSubmitStatus({
        type: "error",
        message: "Please correct the errors in the form.",
      });
      return;
    }

    try {
      // Simulated API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSubmitStatus({
        type: "success",
        message: "Form submitted successfully!",
      });
      // Reset form
      setFormData({});
    } catch (error) {
      setSubmitStatus({
        type: "error",
        message: "Failed to submit form. Please try again.",
      });
    }
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(fieldOrder);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setFieldOrder(items);
  };

  const renderClassConfig = () => (
    <Stack spacing={3} sx={{ mb: 4 }}>
      {isEditMode ? (
        <>
          <TextField
            fullWidth
            label="Class Name"
            value={classConfig.className}
            onChange={(e) =>
              handleClassConfigChange("className", e.target.value)
            }
            error={!!errors.className}
            helperText={errors.className}
          />

          <TextField
            fullWidth
            multiline
            rows={3}
            label="Class Description"
            value={classConfig.description}
            onChange={(e) =>
              handleClassConfigChange("description", e.target.value)
            }
            placeholder="Enter class description here..."
          />

          <Stack direction="row" spacing={2}>
            <TextField
              fullWidth
              label="Start Date"
              type="date"
              value={classConfig.startDate}
              onChange={(e) =>
                handleClassConfigChange("startDate", e.target.value)
              }
              InputLabelProps={{ shrink: true }}
              error={!!errors.startDate}
              helperText={errors.startDate}
            />

            <TextField
              fullWidth
              label="End Date"
              type="date"
              value={classConfig.endDate}
              onChange={(e) =>
                handleClassConfigChange("endDate", e.target.value)
              }
              InputLabelProps={{ shrink: true }}
              error={!!errors.endDate}
              helperText={errors.endDate}
            />
          </Stack>

          <FormControl fullWidth error={!!errors.meetingDays}>
            <InputLabel>Meeting Days</InputLabel>
            <Select
              multiple
              value={classConfig.meetingDays}
              onChange={(e) =>
                handleClassConfigChange("meetingDays", e.target.value)
              }
              input={<OutlinedInput label="Meeting Days" />}
            >
              {DAYS_OF_WEEK.map((day) => (
                <MenuItem key={day} value={day}>
                  {day}
                </MenuItem>
              ))}
            </Select>
            {errors.meetingDays && (
              <Typography color="error" variant="caption">
                {errors.meetingDays}
              </Typography>
            )}
          </FormControl>

          <Stack direction="row" spacing={2}>
            <TextField
              fullWidth
              label="Start Time"
              type="time"
              value={classConfig.startTime}
              onChange={(e) =>
                handleClassConfigChange("startTime", e.target.value)
              }
              InputLabelProps={{ shrink: true }}
              error={!!errors.startTime}
              helperText={errors.startTime}
            />

            <TextField
              fullWidth
              label="End Time"
              type="time"
              value={classConfig.endTime}
              onChange={(e) =>
                handleClassConfigChange("endTime", e.target.value)
              }
              InputLabelProps={{ shrink: true }}
              error={!!errors.endTime}
              helperText={errors.endTime}
            />
          </Stack>

          <TextField
            fullWidth
            label="Location"
            value={classConfig.location}
            onChange={(e) =>
              handleClassConfigChange("location", e.target.value)
            }
            error={!!errors.location}
            helperText={errors.location}
          />

          <TextField
            fullWidth
            label="Class Capacity"
            type="number"
            value={classConfig.capacity}
            onChange={(e) =>
              handleClassConfigChange("capacity", e.target.value)
            }
            error={!!errors.capacity}
            helperText={
              errors.capacity || "Optional: Maximum number of students"
            }
          />

          {classConfig.capacity && (
            <FormControlLabel
              control={
                <Checkbox
                  checked={classConfig.showCapacity}
                  onChange={(e) =>
                    handleClassConfigChange(
                      "showCapacity",
                      e.target.checked ? true : undefined
                    )
                  }
                />
              }
              label="Show Class Capacity"
            />
          )}
        </>
      ) : (
        <>
          <Typography variant="h4" component="h1">
            {classConfig.className} Signup
          </Typography>

          {classConfig.description && (
            <Typography variant="body1">{classConfig.description}</Typography>
          )}

          <Stack spacing={1}>
            {(classConfig.startDate ||
              classConfig.endTime ||
              classConfig.startTime ||
              classConfig.location ||
              (classConfig.capacity && classConfig.showCapacity) ||
              (classConfig.meetingDays &&
                classConfig.meetingDays.length > 0)) && (
              <Typography variant="subtitle1" fontWeight="bold">
                Class Information:
              </Typography>
            )}

            {classConfig.meetingDays && classConfig.meetingDays.length > 0 && (
              <Typography>
                Meeting {formatMeetingDays(classConfig.meetingDays)}
                {classConfig.startTime && classConfig.endTime && (
                  <>
                    , at {formatTime(classConfig.startTime)} -{" "}
                    {formatTime(classConfig.endTime)}
                  </>
                )}
              </Typography>
            )}

            {classConfig.startDate && classConfig.endDate && (
              <Typography>
                Starting on{" "}
                {new Date(classConfig.startDate).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}{" "}
                and ending on{" "}
                {new Date(classConfig.endDate).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </Typography>
            )}

            {classConfig.location && (
              <Typography>
                <strong>Location:</strong> {classConfig.location}
              </Typography>
            )}

            {classConfig.capacity && (
              <Typography>
                <strong>Class Capacity:</strong> {classConfig.capacity} students
              </Typography>
            )}
          </Stack>
        </>
      )}

      <Divider />
    </Stack>
  );

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Stack spacing={3}>
          <Stack direction="row" justifyContent="flex-end" alignItems="center">
            <Button
              variant="contained"
              startIcon={isEditMode ? <VisibilityIcon /> : <EditIcon />}
              onClick={() => setIsEditMode(!isEditMode)}
              sx={{ ml: 2 }}
            >
              {isEditMode ? "Preview Form" : "Edit Form"}
            </Button>
          </Stack>

          {renderClassConfig()}

          {submitStatus && (
            <Alert
              severity={submitStatus.type}
              onClose={() => setSubmitStatus(null)}
            >
              {submitStatus.message}
            </Alert>
          )}

          <DragDropContext onDragEnd={onDragEnd}>
            <Box component="form" onSubmit={handleSubmit}>
              {isEditMode ? (
                <>
                  <Box sx={{ mb: 3, display: "flex", alignItems: "center" }}>
                    {isEditMode && (
                      <Stack direction="row" spacing={2} sx={{ mb: 3, mr: 2 }}>
                        <Button
                          variant="outlined"
                          startIcon={<AddCircleOutlineIcon />}
                          onClick={() => setIsFieldSelectorOpen(true)}
                        >
                          Manage Form Fields
                        </Button>
                      </Stack>
                    )}
                    <StructuralElementAdder
                      onAddElement={handleAddElement}
                      existingFields={fieldOrder}
                    />
                  </Box>

                  <Droppable droppableId="fields">
                    {(provided) => (
                      <Box {...provided.droppableProps} ref={provided.innerRef}>
                        {fieldOrder.map((field, index) => (
                          <Draggable
                            key={field}
                            draggableId={field}
                            index={index}
                          >
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                              >
                                <FieldEditor
                                  field={field}
                                  config={formConfig[field]}
                                  onUpdate={handleFieldUpdate}
                                  onRemove={handleRemoveField}
                                />
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </Box>
                    )}
                  </Droppable>
                </>
              ) : (
                <>
                  {fieldOrder.map((field) => (
                    <FormField
                      key={field}
                      field={field}
                      config={formConfig[field]}
                      value={formData[field] || ""}
                      onChange={handleFormChange}
                      error={errors[field]}
                      isEditMode={isEditMode}
                    />
                  ))}
                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    size="large"
                    sx={{ mt: 3 }}
                  >
                    Submit
                  </Button>
                </>
              )}
            </Box>
          </DragDropContext>

          <FieldSelectorDialog
            open={isFieldSelectorOpen}
            onClose={() => setIsFieldSelectorOpen(false)}
            onAddFields={handleAddFields}
            existingFields={fieldOrder}
          />
        </Stack>
      </Paper>
    </Container>
  );
}

function formatMeetingDays(days) {
  if (days.length <= 1) return days.join("");
  const lastDay = days.pop();
  return `${days.join(", ")}, and ${lastDay}`;
}

// Utility function to format time to AM/PM without leading zero
function formatTime(timeStr) {
  const [hour, minute] = timeStr.split(":");
  const date = new Date(1970, 0, 1, hour, minute);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}
