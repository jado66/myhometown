// StudentFormDialog.jsx
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
  Divider,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { FIELD_TYPES } from "@/components/class-signups/FieldTypes";
import { getFieldConfig, isStructuralElement } from "./ClassDetailTable.utils";

const StudentFormDialog = ({
  open,
  onClose,
  dialogMode,
  editingStudent,
  studentData,
  formErrors,
  classData,
  isMainCapacityFull,
  isWaitlistEnabled,
  onSubmit,
  onFieldChange,
  signupLoading,
  editLoading,
}) => {
  const renderFormField = (fieldKey) => {
    const field = getFieldConfig(fieldKey, classData.signupForm.formConfig);
    const error = formErrors[fieldKey];

    if (isStructuralElement(field.type)) {
      return null;
    }

    switch (field.type) {
      case FIELD_TYPES.checkbox:
        return (
          <FormControlLabel
            control={
              <Checkbox
                checked={!!studentData[fieldKey]}
                onChange={(e) => onFieldChange(fieldKey, e.target.checked)}
              />
            }
            label={field.label}
          />
        );

      case FIELD_TYPES.select:
        return (
          <FormControl fullWidth error={!!error}>
            <InputLabel>{field.label}</InputLabel>
            <Select
              value={studentData[fieldKey] || ""}
              onChange={(e) => onFieldChange(fieldKey, e.target.value)}
              label={field.label}
            >
              {field.options?.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
            {error && <FormHelperText>{error}</FormHelperText>}
          </FormControl>
        );

      case FIELD_TYPES.textarea:
        return (
          <TextField
            label={field.label}
            multiline
            rows={4}
            fullWidth
            value={studentData[fieldKey] || ""}
            onChange={(e) => onFieldChange(fieldKey, e.target.value)}
            error={!!error}
            helperText={error || field.helpText}
            required={field.required}
          />
        );

      case FIELD_TYPES.date:
        return (
          <TextField
            label={field.label}
            type="date"
            fullWidth
            value={studentData[fieldKey] || ""}
            onChange={(e) => onFieldChange(fieldKey, e.target.value)}
            error={!!error}
            helperText={error || field.helpText}
            required={field.required}
            InputLabelProps={{
              shrink: true,
            }}
          />
        );

      case FIELD_TYPES.email:
      case FIELD_TYPES.tel:
      case FIELD_TYPES.text:
      default:
        return (
          <TextField
            label={field.label}
            type={field.type || "text"}
            fullWidth
            value={studentData[fieldKey] || ""}
            onChange={(e) => onFieldChange(fieldKey, e.target.value)}
            error={!!error}
            helperText={error || field.helpText}
            required={field.required}
          />
        );
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {dialogMode === "edit"
          ? `Edit Student: ${editingStudent?.firstName} ${editingStudent?.lastName}`
          : isMainCapacityFull && isWaitlistEnabled
          ? "Add to Waitlist"
          : "Add New Student"}
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        {dialogMode === "add" && isMainCapacityFull && isWaitlistEnabled && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              The class is currently at full capacity. This student will be
              added to the waitlist.
            </Typography>
            <Divider sx={{ my: 2 }} />
          </Box>
        )}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2 }}>
          {classData.signupForm.fieldOrder
            .filter((fieldKey) => {
              const field = getFieldConfig(
                fieldKey,
                classData.signupForm.formConfig
              );
              return !isStructuralElement(field.type);
            })
            .map((fieldKey) => (
              <Box key={fieldKey}>{renderFormField(fieldKey)}</Box>
            ))}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={onSubmit}
          variant="contained"
          disabled={signupLoading || editLoading}
        >
          {signupLoading || editLoading
            ? dialogMode === "edit"
              ? "Updating..."
              : "Adding..."
            : dialogMode === "edit"
            ? "Update Student"
            : isMainCapacityFull && isWaitlistEnabled
            ? "Add to Waitlist"
            : "Add Student"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default StudentFormDialog;
