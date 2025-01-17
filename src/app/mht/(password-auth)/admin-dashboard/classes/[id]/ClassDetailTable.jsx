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
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";

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

  // Update rows when classData changes
  useEffect(() => {
    if (classData?.signups) {
      setRows(classData.signups);
    }
  }, [classData]);

  if (!classData || !classData.signupForm || !classData.signups) {
    return null;
  }

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
    if (onAddStudent) {
      // Let the server generate the ID
      await onAddStudent(newStudent);
      setNewStudent({});
      setShowAddDialog(false);
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
      classData.signupForm.fieldOrder.map((fieldKey) => ({
        field: fieldKey,
        headerName: classData.signupForm.formConfig[fieldKey].label,
        width: 180,
        flex: 1,
        sortable: true,
        editable: true,
      })),
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
        onClose={() => setShowAddDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Add New Student
          <IconButton
            aria-label="close"
            onClick={() => setShowAddDialog(false)}
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
            {classData.signupForm.fieldOrder.map((fieldKey) => (
              <TextField
                key={fieldKey}
                label={classData.signupForm.formConfig[fieldKey].label}
                type={classData.signupForm.formConfig[fieldKey].type || "text"}
                fullWidth
                value={newStudent[fieldKey] || ""}
                onChange={(e) =>
                  setNewStudent({
                    ...newStudent,
                    [fieldKey]: e.target.value,
                  })
                }
              />
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAddDialog(false)}>Cancel</Button>
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
