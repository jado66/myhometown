"use client";

import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  CircularProgress,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

const ResponseDetailsDialog = ({
  open,
  onClose,
  fullSubmissionData,
  formConfig,
  selectedSubmissionId,
  onDelete,
  formId,
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Response Details
        <IconButton
          aria-label="delete"
          color="error"
          sx={{ position: "absolute", right: 8, top: 8 }}
          onClick={() => {
            onClose();
            onDelete({
              formId: formId,
              submissionId: selectedSubmissionId,
            });
          }}
        >
          <DeleteIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        {fullSubmissionData ? (
          <Box sx={{ my: 2 }}>
            {formConfig.field_order.map((fieldId) => {
              const field = formConfig.form_config[fieldId];
              if (!field) return null;

              let displayValue = fullSubmissionData[fieldId];

              // Handle array of objects (like minorVolunteers)
              if (
                Array.isArray(displayValue) &&
                displayValue.length > 0 &&
                typeof displayValue[0] === "object"
              ) {
                // For minorVolunteers array specifically
                if (fieldId === "minorVolunteers") {
                  return (
                    <Box key={fieldId} sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" color="textSecondary">
                        {field.label || "Minor Volunteers"}
                      </Typography>
                      {displayValue.map((volunteer, index) => (
                        <Box key={index} sx={{ ml: 2, mb: 1 }}>
                          <Typography variant="body1">
                            Name: {volunteer.name}, Age: {volunteer.age}, Hours:{" "}
                            {volunteer.hours}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  );
                }
              }

              // Format other values based on field type
              if (displayValue === null || displayValue === undefined) {
                displayValue = "-";
              } else if (
                fieldId === "volunteerSignature" &&
                typeof displayValue === "string" &&
                displayValue.startsWith("data:image")
              ) {
                // Handle signature image
                return (
                  <Box key={fieldId} sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="textSecondary">
                      {field.label || "Signature"}
                    </Typography>
                    <Box
                      sx={{
                        mt: 1,
                        border: "1px solid #ccc",
                        p: 1,
                        maxWidth: "100%",
                      }}
                    >
                      <img
                        src={displayValue}
                        alt="Volunteer Signature"
                        style={{ maxWidth: "100%", maxHeight: "200px" }}
                      />
                    </Box>
                  </Box>
                );
              } else if (field.type === "checkbox") {
                displayValue = displayValue ? "Yes" : "No";
              } else if (field.type === "select" && field.options) {
                const option = field.options.find(
                  (opt) => opt.value === displayValue
                );
                displayValue = option ? option.label : displayValue;
              } else if (field.type === "date" && displayValue) {
                displayValue = new Date(displayValue).toLocaleDateString();
              } else if (typeof displayValue === "object") {
                // For all other objects, stringify them
                displayValue = JSON.stringify(displayValue);
              }

              return (
                <Box key={fieldId} sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="textSecondary">
                    {field.label}
                  </Typography>
                  <Typography variant="body1">{displayValue}</Typography>
                </Box>
              );
            })}
          </Box>
        ) : (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ResponseDetailsDialog;
