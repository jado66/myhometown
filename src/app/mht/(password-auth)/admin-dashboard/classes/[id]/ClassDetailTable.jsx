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
  Tabs,
  Tab,
  Divider,
  Alert,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import { AVAILABLE_FIELDS } from "@/components/class-signups/AvailableFields";
import { FIELD_TYPES } from "@/components/class-signups/FieldTypes";
import JsonViewer from "@/components/util/debug/DebugOutput";
import { toast } from "react-toastify";

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
  const [waitlistedRows, setWaitlistedRows] = useState([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newStudent, setNewStudent] = useState({});
  const [formErrors, setFormErrors] = useState({});
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [promoteDialogOpen, setPromoteDialogOpen] = useState(false);
  const [studentToPromote, setStudentToPromote] = useState(null);
  const [promoteLoading, setPromoteLoading] = useState(false);

  // Update rows when classData changes
  useEffect(() => {
    if (classData?.signups) {
      const enrolled = classData.signups.filter(
        (signup) => !signup.isWaitlisted
      );
      const waitlisted = classData.signups.filter(
        (signup) => signup.isWaitlisted
      );

      setRows(enrolled);
      setWaitlistedRows(waitlisted);
    }
  }, [classData]);

  if (!classData || !classData.signupForm || !classData.signups) {
    return null;
  }

  // Calculate enrollment status
  const enrolledCount = rows.length;
  const waitlistedCount = waitlistedRows.length;
  const totalCapacity = parseInt(classData.capacity) || 0;
  const isMainCapacityFull = enrolledCount >= totalCapacity;
  const isWaitlistEnabled = classData.isWaitlistEnabled === true;
  const waitlistCapacity = parseInt(classData.waitlistCapacity) || 0;
  const isWaitlistFull = waitlistedCount >= waitlistCapacity;
  const isCompletelyFull =
    isMainCapacityFull && (!isWaitlistEnabled || isWaitlistFull);
  const hasAvailableCapacity = enrolledCount < totalCapacity;

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
    (id) => () => {
      // Instead of deleting immediately, open confirmation dialog
      setStudentToDelete(id);
      setDeleteConfirmOpen(true);
    },
    []
  );

  const handleConfirmedDelete = async () => {
    if (onRemoveSignup && studentToDelete) {
      const success = await onRemoveSignup(studentToDelete);
      if (success) {
        // Update both regular and waitlisted rows
        setRows((prevRows) =>
          prevRows.filter((row) => row.id !== studentToDelete)
        );
        setWaitlistedRows((prevRows) =>
          prevRows.filter((row) => row.id !== studentToDelete)
        );
      }
      setDeleteConfirmOpen(false);
      setStudentToDelete(null);
    }
  };

  const handlePromoteClick = useCallback(
    (id) => () => {
      // Find the student in the waitlisted rows
      const student = waitlistedRows.find((row) => row.id === id);
      if (student) {
        setStudentToPromote(student);
        setPromoteDialogOpen(true);
      }
    },
    [waitlistedRows]
  );

  const handleConfirmedPromote = async () => {
    if (!studentToPromote) return;

    setPromoteLoading(true);
    try {
      // API call to update the student's waitlist status
      const response = await fetch(
        `/api/database/classes/${classData.id}/promote`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ studentId: studentToPromote.id }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to promote student");
      }

      // If successful, update the local state
      const promotedStudent = { ...studentToPromote, isWaitlisted: false };

      // Remove from waitlist and add to enrolled
      setWaitlistedRows((prev) =>
        prev.filter((row) => row.id !== studentToPromote.id)
      );
      setRows((prev) => [...prev, promotedStudent]);

      // Show success message
      toast.success(
        `${studentToPromote.firstName} ${studentToPromote.lastName} has been promoted from the waitlist.`
      );
    } catch (error) {
      console.error("Error promoting student:", error);
      alert("Failed to promote student. Please try again.");
    } finally {
      setPromoteLoading(false);
      setPromoteDialogOpen(false);
      setStudentToPromote(null);
    }
  };

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
            // editable: true,
            // Add valueFormatter for boolean fields
            valueFormatter:
              field.type === "checkbox"
                ? ({ value }) => (value ? "Yes" : "No")
                : undefined,
          };
        }),
    [classData.signupForm]
  );

  // Add actions column for enrolled students
  const enrolledColumns = useMemo(
    () => [
      ...baseColumns,
      {
        field: "createdAt",
        headerName: "Sign Up Date",
        width: 220,
        flex: 1,
        valueFormatter: ({ value }) => {
          const date = new Date(value);
          const day = String(date.getUTCDate()).padStart(2, "0");
          const month = String(date.getUTCMonth() + 1).padStart(2, "0");
          const year = date.getUTCFullYear();
          return `${month}/${day}/${year} `;
        },
      },
      {
        field: "actions",
        type: "actions",
        headerName: "Actions",
        width: 100,
        getActions: (params) => [
          <GridActionsCellItem
            icon={<DeleteIcon />}
            label="Remove Student"
            onClick={handleDeleteClick(params.id)}
            disabled={removeSignupLoading}
          />,
        ],
      },
    ],
    [baseColumns, handleDeleteClick, removeSignupLoading]
  );

  // Add actions column for waitlisted students with promote option
  const waitlistColumns = useMemo(
    () => [
      ...baseColumns,
      {
        field: "createdAt",
        headerName: "Sign Up Date",
        width: 220,
        flex: 1,
        valueFormatter: ({ value }) => {
          const date = new Date(value);
          const day = String(date.getUTCDate()).padStart(2, "0");
          const month = String(date.getUTCMonth() + 1).padStart(2, "0");
          const year = date.getUTCFullYear();
          return `${month}/${day}/${year} `;
        },
      },
      {
        field: "actions",
        type: "actions",
        headerName: "Actions",
        width: 160,
        getActions: (params) => [
          <GridActionsCellItem
            icon={<PersonAddIcon />}
            label="Promote to Class"
            onClick={handlePromoteClick(params.id)}
            disabled={promoteLoading || !hasAvailableCapacity}
            showInMenu={false}
          />,
          <GridActionsCellItem
            icon={<DeleteIcon />}
            label="Remove Student"
            onClick={handleDeleteClick(params.id)}
            disabled={removeSignupLoading}
            showInMenu={false}
          />,
        ],
      },
    ],
    [
      baseColumns,
      handlePromoteClick,
      handleDeleteClick,
      removeSignupLoading,
      promoteLoading,
      hasAvailableCapacity,
    ]
  );

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <>
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => {
          setDeleteConfirmOpen(false);
          setStudentToDelete(null);
        }}
      >
        <DialogTitle>Confirm Removal</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to remove this student from the class?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setDeleteConfirmOpen(false);
              setStudentToDelete(null);
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmedDelete}
            color="error"
            variant="contained"
            disabled={removeSignupLoading}
          >
            {removeSignupLoading ? "Removing..." : "Remove Student"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Promote Confirmation Dialog */}
      <Dialog
        open={promoteDialogOpen}
        onClose={() => {
          setPromoteDialogOpen(false);
          setStudentToPromote(null);
        }}
      >
        <DialogTitle>Promote from Waitlist</DialogTitle>
        <DialogContent>
          {studentToPromote && (
            <>
              <Typography>
                Are you sure you want to promote {studentToPromote.firstName}{" "}
                {studentToPromote.lastName} from the waitlist to the class?
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                This will add the student to the enrolled roster and remove them
                from the waitlist.
              </Typography>

              {!hasAvailableCapacity && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  Warning: The class is already at full capacity. Promoting this
                  student will exceed the set capacity limit.
                </Alert>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setPromoteDialogOpen(false);
              setStudentToPromote(null);
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmedPromote}
            color="primary"
            variant="contained"
            disabled={promoteLoading}
          >
            {promoteLoading ? "Promoting..." : "Promote Student"}
          </Button>
        </DialogActions>
      </Dialog>

      <Box sx={{ mb: 3 }}>
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
            disabled={signupLoading || isCompletelyFull}
          >
            {isCompletelyFull
              ? "Class is Full"
              : isMainCapacityFull && isWaitlistEnabled
              ? "Add to Waitlist"
              : signupLoading
              ? "Adding..."
              : "Add Student"}
          </Button>
        </Box>

        {/* Class capacity information */}

        {classData.capacity ? (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Enrolled: {enrolledCount}/{totalCapacity}{" "}
              {enrolledCount === 1 ? "student" : "students"}
              {isWaitlistEnabled &&
                ` • Waitlist: ${waitlistedCount}/${waitlistCapacity}`}
            </Typography>
          </Box>
        ) : (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Enrolled: {enrolledCount}{" "}
              {enrolledCount === 1 ? "student" : "students"}
            </Typography>
          </Box>
        )}

        {/* Tab navigation */}
        {classData.capacity && (
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              aria-label="roster tabs"
            >
              <Tab
                label={`Enrolled Students (${enrolledCount})`}
                id="tab-0"
                aria-controls="tabpanel-0"
              />
              {isWaitlistEnabled && (
                <Tab
                  label={`Waitlist (${waitlistedCount})`}
                  id="tab-1"
                  aria-controls="tabpanel-1"
                />
              )}
            </Tabs>
          </Box>
        )}
      </Box>

      {/* Regular enrollment table */}
      <div
        role="tabpanel"
        hidden={tabValue !== 0}
        id="tabpanel-0"
        aria-labelledby="tab-0"
      >
        {tabValue === 0 && (
          <Paper sx={{ height: 600, width: "100%" }}>
            <DataGrid
              rows={rows}
              columns={enrolledColumns}
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
              initialState={{
                sorting: {
                  sortModel: [
                    { field: classData.signupForm.fieldOrder[0], sort: "asc" },
                  ],
                },
              }}
            />
          </Paper>
        )}
      </div>

      {/* Waitlist table */}
      {isWaitlistEnabled && (
        <div
          role="tabpanel"
          hidden={tabValue !== 1}
          id="tabpanel-1"
          aria-labelledby="tab-1"
        >
          {tabValue === 1 && (
            <>
              {!hasAvailableCapacity && waitlistedRows.length > 0 && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  The class is currently at capacity. Free up space by removing
                  students from the enrolled list before promoting from the
                  waitlist.
                </Alert>
              )}
              <Paper sx={{ height: 600, width: "100%" }}>
                <DataGrid
                  rows={waitlistedRows}
                  columns={waitlistColumns}
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
                  initialState={{
                    sorting: {
                      sortModel: [
                        {
                          field: classData.signupForm.fieldOrder[0],
                          sort: "asc",
                        },
                      ],
                    },
                  }}
                />
              </Paper>
            </>
          )}
        </div>
      )}

      {/* Add Student Dialog */}
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
          {isMainCapacityFull && isWaitlistEnabled
            ? "Add to Waitlist"
            : "Add New Student"}
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
          {isMainCapacityFull && isWaitlistEnabled && (
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
            {signupLoading
              ? "Adding..."
              : isMainCapacityFull && isWaitlistEnabled
              ? "Add to Waitlist"
              : "Add Student"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ClassDetailTable;
