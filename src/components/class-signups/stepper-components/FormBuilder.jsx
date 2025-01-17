import React from "react";
import {
  TextField,
  Stack,
  Typography,
  FormControlLabel,
  Checkbox,
  Box,
  Button,
  Grid,
  Divider,
} from "@mui/material";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { AddCircleOutline } from "@mui/icons-material";
import { FieldEditor } from "../FieldEditor";
import { StructuralElementAdder } from "../StructuralElementAdder";
import { useImageUpload } from "@/hooks/use-upload-image";
import { useClassSignup } from "../ClassSignupContext";

// Define the fields that should always be required
const REQUIRED_FIELDS = ["firstName", "lastName", "phone"]; // adjust these field names as needed

export function FormBuilder({ showFieldSelector }) {
  const {
    fieldOrder,
    formConfig,
    handleFieldUpdate,
    handleRemoveField,
    onDragEnd,
    handleAddElement,
  } = useClassSignup();

  // Modify the handleFieldUpdate to prevent changing required status for certain fields
  const handleFieldUpdateWithRequiredCheck = (fieldId, updates) => {
    if (REQUIRED_FIELDS.includes(fieldId) && "required" in updates) {
      // If trying to update required status of a required field, keep it required
      const newUpdates = { ...updates, required: true };
      handleFieldUpdate(fieldId, newUpdates);
    } else {
      handleFieldUpdate(fieldId, updates);
    }
  };

  return (
    <Stack spacing={3} sx={{ py: 2 }}>
      <Typography variant="h6">Class Signup Form Builder</Typography>

      <Typography variant="subtitle1" fontWeight="bold">
        Drag and drop fields to reorder them. You can change the label on the
        field, mark it as required, and add help text.
      </Typography>

      <DragDropContext onDragEnd={onDragEnd}>
        <Stack
          spacing={2}
          sx={{ p: 2, backgroundColor: "lightgrey", borderRadius: 3 }}
        >
          <Stack direction="row" spacing={2} justifyContent="space-between">
            <Button
              variant="outlined"
              startIcon={<AddCircleOutline />}
              onClick={showFieldSelector}
              sx={{ backgroundColor: "white" }}
            >
              Manage Form Fields
            </Button>
            <StructuralElementAdder
              onAddElement={handleAddElement}
              existingFields={fieldOrder}
            />
          </Stack>

          <Divider sx={{ my: 3, border: "1px solid white" }} />

          <Droppable droppableId="fields">
            {(provided) => (
              <Box {...provided.droppableProps} ref={provided.innerRef}>
                {fieldOrder.map((field, index) => (
                  <Draggable key={field} draggableId={field} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        <FieldEditor
                          field={field}
                          config={formConfig[field]}
                          onUpdate={handleFieldUpdateWithRequiredCheck}
                          onRemove={handleRemoveField}
                          isAlwaysRequired={REQUIRED_FIELDS.includes(field)}
                        />
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </Box>
            )}
          </Droppable>
        </Stack>
      </DragDropContext>
    </Stack>
  );
}
