import React, { useState, useCallback, useEffect, useMemo } from "react";
import { DataGrid, GridToolbar, GridActionsCellItem } from "@mui/x-data-grid";
import {
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  Typography,
  IconButton,
  FormControlLabel,
  Checkbox,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import { AVAILABLE_FIELDS } from "@/components/class-signups/AvailableFields";
import { FIELD_TYPES } from "@/components/class-signups/FieldTypes";

const getFieldConfig = (fieldKey, formConfig) => {
  const customConfig = formConfig[fieldKey] || {};
  const baseConfig = AVAILABLE_FIELDS[fieldKey] || {};

  // We want to prioritize the type from AVAILABLE_FIELDS
  const fieldType = baseConfig.type || customConfig.type || FIELD_TYPES.text;

  return {
    ...baseConfig,
    ...customConfig, // Custom config overrides base config
    type: fieldType, // Override any type that might have been set by customConfig
    label: customConfig.label || baseConfig.label || fieldKey,
    required: customConfig.required ?? baseConfig.required ?? false,
    options: baseConfig.options || customConfig.options, // Prioritize base options
  };
};

const ClassDetailTable = ({
  classData,
  onClose,
  signupLoading,
  onUpdate,
  onAddStudent,
  onRemoveSignup,
  removeSignupLoading,
}) => {
  const [rows, setRows] = useState([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newStudent, setNewStudent] = useState({});
  const [formErrors, setFormErrors] = useState({});

  // Update rows when classData changes
  useEffect(() => {
    if (classData?.signups) {
      setRows(classData.signups);
    }
  }, [classData]);

  if (!classData || !classData.signupForm || !classData.signups) {
    return null;
  }

  const validateField = (fieldKey, value) => {
    const field = getFieldConfig(fieldKey, classData.signupForm.formConfig);

    // Check if required
    if (field.required && !value && value !== false) {
      return `${field.label} is required`;
    }

    // If field has custom validation, use it
    if (field.validation && value) {
      const validationResult = field.validation(value);
      if (validationResult) {
        return validationResult;
      }
    }

    // Built-in validation based on type
    if (value) {
      switch (field.type) {
        case "tel":
          if (!/^\+?[\d\s-]{10,}$/.test(value)) {
            return "Invalid phone number format";
          }
          break;
        case "email":
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            return "Invalid email format";
          }
          break;
      }
    }

    return null;
  };

  const validateForm = () => {
    const errors = {};
    let isValid = true;

    classData.signupForm.fieldOrder.forEach((fieldKey) => {
      const error = validateField(fieldKey, newStudent[fieldKey]);
      if (error) {
        errors[fieldKey] = error;
        isValid = false;
      }
    });

    setFormErrors(errors);
    return isValid;
  };

  const handleDeleteClick = useCallback(
    (id) => async () => {
      if (onRemoveSignup) {
        const success = await onRemoveSignup(id);
        if (success) {
          const updatedRows = rows.filter((row) => row.id !== id);
          setRows(updatedRows);
        }
      }
    },
    [rows, onRemoveSignup]
  );

  const handleEditClick = useCallback(
    (id) => () => {
      setRows((prevRows) =>
        prevRows.map((row) => (row.id === id ? { ...row, mode: "edit" } : row))
      );
    },
    []
  );

  const handleAdd = async () => {
    if (validateForm()) {
      if (onAddStudent) {
        await onAddStudent(newStudent);
        setNewStudent({});
        setFormErrors({});
        setShowAddDialog(false);
      }
    }
  };

  const handleFieldChange = (fieldKey, value) => {
    setNewStudent((prev) => ({
      ...prev,
      [fieldKey]: value,
    }));
    // Clear error when field is modified
    if (formErrors[fieldKey]) {
      setFormErrors((prev) => ({
        ...prev,
        [fieldKey]: null,
      }));
    }
  };

  const isStructuralElement = (type) => {
    return [
      FIELD_TYPES.divider,
      FIELD_TYPES.header,
      FIELD_TYPES.staticText,
      FIELD_TYPES.bannerImage,
    ].includes(type);
  };

  const renderFormField = (fieldKey) => {
    const field = getFieldConfig(fieldKey, classData.signupForm.formConfig);
    const error = formErrors[fieldKey];

    // Don't render structural elements
    if (isStructuralElement(field.type)) {
      return null;
    }

    switch (field.type) {
      case FIELD_TYPES.checkbox:
        return (
          <FormControlLabel
            control={
              <Checkbox
                checked={!!newStudent[fieldKey]}
                onChange={(e) => handleFieldChange(fieldKey, e.target.checked)}
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
              value={newStudent[fieldKey] || ""}
              onChange={(e) => handleFieldChange(fieldKey, e.target.value)}
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
            value={newStudent[fieldKey] || ""}
            onChange={(e) => handleFieldChange(fieldKey, e.target.value)}
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
            value={newStudent[fieldKey] || ""}
            onChange={(e) => handleFieldChange(fieldKey, e.target.value)}
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
            value={newStudent[fieldKey] || ""}
            onChange={(e) => handleFieldChange(fieldKey, e.target.value)}
            error={!!error}
            helperText={error || field.helpText}
            required={field.required}
          />
        );
    }
  };

  const processRowUpdate = useCallback(
    (newRow, oldRow) => {
      const updatedRow = { ...newRow, mode: undefined };
      setRows((prevRows) =>
        prevRows.map((row) => (row.id === newRow.id ? updatedRow : row))
      );
      if (onUpdate) {
        onUpdate(rows.map((row) => (row.id === newRow.id ? updatedRow : row)));
      }
      return updatedRow;
    },
    [onUpdate, rows]
  );

  // Create base columns from signup form
  const baseColumns = useMemo(
    () =>
      classData.signupForm.fieldOrder
        .filter((fieldKey) => {
          const field = getFieldConfig(
            fieldKey,
            classData.signupForm.formConfig
          );
          return !isStructuralElement(field.type);
        })
        .map((fieldKey) => {
          const field = getFieldConfig(
            fieldKey,
            classData.signupForm.formConfig
          );
          return {
            field: fieldKey,
            headerName: field.label,
            width: 180,
            flex: 1,
            sortable: true,
            editable: true,
            // Add valueFormatter for boolean fields
            valueFormatter:
              field.type === "checkbox"
                ? ({ value }) => (value ? "Yes" : "No")
                : undefined,
          };
        }),
    [classData.signupForm]
  );

  // Add actions column
  const columns = useMemo(
    () => [
      ...baseColumns,
      {
        field: "actions",
        type: "actions",
        headerName: "Actions",
        width: 100,
        getActions: (params) => [
          <GridActionsCellItem
            icon={<EditIcon />}
            label="Edit"
            onClick={handleEditClick(params.id)}
            disabled={removeSignupLoading}
          />,
          <GridActionsCellItem
            icon={<DeleteIcon />}
            label="Remove Student"
            onClick={handleDeleteClick(params.id)}
            disabled={removeSignupLoading}
            showInMenu
          />,
        ],
      },
    ],
    [baseColumns, handleEditClick, handleDeleteClick, removeSignupLoading]
  );

  return (
    <>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h6">Class Roster</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setShowAddDialog(true)}
          disabled={
            signupLoading || classData.signups.length >= classData.capacity
          }
        >
          {classData.signups.length >= classData.capacity
            ? "Class is Full"
            : signupLoading
            ? "Adding..."
            : "Add Student"}
        </Button>
      </Box>

      <Paper sx={{ height: 600, width: "100%" }}>
        <DataGrid
          rows={rows}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[5, 10, 25]}
          checkboxSelection={false}
          disableSelectionOnClick
          components={{
            Toolbar: GridToolbar,
          }}
          componentsProps={{
            toolbar: {
              showQuickFilter: true,
              quickFilterProps: { debounceMs: 500 },
            },
          }}
          density="comfortable"
          processRowUpdate={processRowUpdate}
          experimentalFeatures={{ newEditingApi: true }}
          initialState={{
            sorting: {
              sortModel: [
                { field: classData.signupForm.fieldOrder[0], sort: "asc" },
              ],
            },
          }}
        />
      </Paper>

      <Dialog
        open={showAddDialog}
        onClose={() => {
          setShowAddDialog(false);
          setNewStudent({});
          setFormErrors({});
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Add New Student
          <IconButton
            aria-label="close"
            onClick={() => {
              setShowAddDialog(false);
              setNewStudent({});
              setFormErrors({});
            }}
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
          <Button
            onClick={() => {
              setShowAddDialog(false);
              setNewStudent({});
              setFormErrors({});
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAdd}
            variant="contained"
            disabled={signupLoading}
          >
            {signupLoading ? "Adding..." : "Add Student"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ClassDetailTable;
