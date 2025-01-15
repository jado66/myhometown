"use client";
import { useState, useEffect, useMemo, useCallback } from "react";
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

// Define required fields (same as in FormBuilder)
const REQUIRED_FIELDS = [
  "firstName",
  "lastName",
  "phone",
  "communicationConsent",
]; // adjust these field names as needed

export const FieldSelectorDialog = ({ isOpen, handleClose }) => {
  const { fieldOrder, handleBulkFieldUpdate } = useClassSignup();

  // Track selected fields with a ref to maintain latest state
  const [selectedFields, setSelectedFields] = useState(new Set());

  // Reset selection state whenever dialog opens, ensuring required fields are always selected
  useEffect(() => {
    if (isOpen) {
      const initialSelection = new Set([...fieldOrder, ...REQUIRED_FIELDS]);
      setSelectedFields(initialSelection);
    }
  }, [isOpen, fieldOrder]);

  // Group available fields by category (memoized to prevent unnecessary recalculations)
  const fieldsByCategory = useMemo(() => {
    return Object.entries(AVAILABLE_FIELDS).reduce((acc, [key, value]) => {
      if (!acc[value.category]) {
        acc[value.category] = [];
      }
      acc[value.category].push({ key, ...value });
      return acc;
    }, {});
  }, []);

  const handleToggleField = useCallback((fieldKey) => {
    // Prevent toggling required fields
    if (REQUIRED_FIELDS.includes(fieldKey)) {
      return;
    }

    setSelectedFields((prev) => {
      const newSelection = new Set(prev);
      if (newSelection.has(fieldKey)) {
        newSelection.delete(fieldKey);
      } else {
        newSelection.add(fieldKey);
      }
      return newSelection;
    });
  }, []);

  const handleSave = useCallback(() => {
    // Ensure required fields are included in the final selection
    const finalSelection = new Set([...selectedFields, ...REQUIRED_FIELDS]);
    const desiredFields = [...finalSelection];
    handleBulkFieldUpdate(desiredFields);
    handleClose();
  }, [selectedFields, handleBulkFieldUpdate, handleClose]);

  return (
    <Dialog open={isOpen} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Manage Form Fields</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          {Object.entries(fieldsByCategory).map(([category, fields]) => (
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
                {fields.map((field) => {
                  const isRequired = REQUIRED_FIELDS.includes(field.key);
                  return (
                    <FormControlLabel
                      key={field.key}
                      control={
                        <Checkbox
                          checked={selectedFields.has(field.key) || isRequired}
                          onChange={() => handleToggleField(field.key)}
                          disabled={isRequired}
                        />
                      }
                      label={
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Typography>
                            {field.originalLabel}
                            {isRequired && (
                              <Typography
                                component="span"
                                sx={{
                                  ml: 1,
                                  color: "text.secondary",
                                  fontSize: "0.875rem",
                                }}
                              >
                                (Required)
                              </Typography>
                            )}
                          </Typography>
                        </Box>
                      }
                    />
                  );
                })}
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
          disabled={selectedFields.size === 0}
        >
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
};
