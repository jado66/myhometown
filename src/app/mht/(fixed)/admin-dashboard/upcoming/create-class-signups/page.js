"use client";
import { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import {
  Button,
  Typography,
  Container,
  Box,
  Paper,
  TextField,
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

export default function ClassSignup() {
  const [isEditMode, setIsEditMode] = useState(false);
  const [isFieldSelectorOpen, setIsFieldSelectorOpen] = useState(false);
  const [className, setClassName] = useState("Class");
  const [classDescription, setClassDescription] = useState("");
  const [formConfig, setFormConfig] = useState(
    DEFAULT_VISIBLE_FIELDS.reduce((acc, key) => {
      acc[key] = {
        ...AVAILABLE_FIELDS[key],
        visible: true, // Set visible to true for default fields
      };
      return acc;
    }, {})
  );

  const [fieldOrder, setFieldOrder] = useState(DEFAULT_VISIBLE_FIELDS);
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleClassNameChange = (e) => {
    setClassName(e.target.value);
  };

  const handleDescriptionChange = (e) => {
    setClassDescription(e.target.value);
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

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Stack spacing={3}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            {isEditMode ? (
              <TextField
                value={className}
                onChange={handleClassNameChange}
                variant="standard"
                sx={{
                  "& input": {
                    typography: "h4",
                    fontWeight: "bold",
                    pb: 1,
                  },
                }}
              />
            ) : (
              <Typography variant="h4" component="h1">
                {className} Signup
              </Typography>
            )}
            <Stack direction="row" spacing={2}>
              {isEditMode && (
                <Button
                  variant="outlined"
                  startIcon={<AddCircleOutlineIcon />}
                  onClick={() => setIsFieldSelectorOpen(true)}
                >
                  Manage Form Fields
                </Button>
              )}
              <Button
                variant="contained"
                startIcon={isEditMode ? <VisibilityIcon /> : <EditIcon />}
                onClick={() => setIsEditMode(!isEditMode)}
              >
                {isEditMode ? "Preview Form" : "Edit Form"}
              </Button>
            </Stack>
          </Stack>

          {isEditMode ? (
            <TextField
              fullWidth
              multiline
              rows={3}
              value={classDescription}
              onChange={handleDescriptionChange}
              label="Class Description"
              placeholder="Enter class description here..."
              variant="outlined"
            />
          ) : classDescription ? (
            <Typography variant="body1" sx={{ mb: 3 }}>
              {classDescription}
            </Typography>
          ) : null}

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
                  <StructuralElementAdder
                    onAddElement={handleAddElement}
                    existingFields={fieldOrder}
                  />
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
