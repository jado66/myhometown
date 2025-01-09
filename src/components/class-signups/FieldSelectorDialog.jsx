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
export const FieldSelectorDialog = ({ isOpen, handleClose }) => {
  const { fieldOrder, handleBulkFieldUpdate } = useClassSignup();

  // Track selected fields with a ref to maintain latest state
  const [selectedFields, setSelectedFields] = useState(new Set());

  // Reset selection state whenever dialog opens
  useEffect(() => {
    if (isOpen) {
      setSelectedFields(new Set(fieldOrder));
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
    // Convert sets to arrays for the bulk update
    const desiredFields = [...selectedFields];
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
                {fields.map((field) => (
                  <FormControlLabel
                    key={field.key}
                    control={
                      <Checkbox
                        checked={selectedFields.has(field.key)}
                        onChange={() => handleToggleField(field.key)}
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
          disabled={selectedFields.size === 0}
        >
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
};
