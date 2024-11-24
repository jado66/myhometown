"use client";
import { useState, useEffect } from "react";
import {
  Button,
  Checkbox,
  FormControlLabel,
  Typography,
  Dialog,
  DialogTitle,
  Box,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { useClassSignup } from "./ClassSignupContext";
import { AVAILABLE_FIELDS } from "./AvailableFields";

export const FieldSelectorDialog = ({ isOpen, handleClose }) => {
  const { fieldOrder, handleAddFields, handleRemoveField } = useClassSignup();

  // Track all selected fields, including existing ones
  const [selectedFields, setSelectedFields] = useState([]);

  // Initialize selected fields with existing fields when dialog opens
  useEffect(() => {
    setSelectedFields([...fieldOrder]);
  }, [fieldOrder]);

  // Group all available fields by category
  const allFieldsByCategory = Object.entries(AVAILABLE_FIELDS).reduce(
    (acc, [key, value]) => {
      if (!acc[value.category]) {
        acc[value.category] = [];
      }
      acc[value.category].push({ key, ...value });
      return acc;
    },
    {}
  );

  const handleSave = () => {
    const fieldsToAdd = selectedFields.filter(
      (field) => !fieldOrder.includes(field)
    );
    const fieldsToRemove = fieldOrder.filter(
      (field) => !selectedFields.includes(field)
    );

    if (fieldsToAdd.length > 0) {
      handleAddFields(fieldsToAdd);
    }
    if (fieldsToRemove.length > 0) {
      fieldsToRemove.forEach((field) => handleRemoveField(field));
    }

    handleClose();
  };

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      sx={{
        "& .MuiDialog-paper": {
          margin: 0,
          position: "absolute",
          top: "50%",
          transform: "translateY(-50%)",
        },
      }}
    >
      <DialogTitle>Manage Form Fields</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          {Object.entries(allFieldsByCategory).map(([category, fields]) => (
            <Box key={category} sx={{ mb: 3 }}>
              <Typography
                variant="subtitle1"
                sx={{ mb: 1, fontWeight: "bold" }}
              >
                {category}
              </Typography>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                  gap: 1,
                }}
              >
                {fields.map((field) => (
                  <FormControlLabel
                    key={field.key}
                    control={
                      <Checkbox
                        checked={selectedFields.includes(field.key)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedFields([...selectedFields, field.key]);
                          } else {
                            setSelectedFields(
                              selectedFields.filter((f) => f !== field.key)
                            );
                          }
                        }}
                      />
                    }
                    label={
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Typography>{field.originalLabel}</Typography>
                      </Box>
                    }
                  />
                ))}
              </Box>
            </Box>
          ))}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={selectedFields.length === 0}
        >
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
};
