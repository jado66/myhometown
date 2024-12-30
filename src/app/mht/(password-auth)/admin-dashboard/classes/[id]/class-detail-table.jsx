import React from "react";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { Paper } from "@mui/material";

export default function ClassDetailTable({ classData, onClose }) {
  if (!classData || !classData.signupForm || !classData.signups) {
    return null;
  }

  // Create columns configuration
  const columns = [
    {
      field: "id",
      headerName: "ID",
      width: 220,
      hide: true, // Hidden by default
    },
    ...classData.signupForm.fieldOrder.map((fieldKey) => ({
      field: fieldKey,
      headerName: classData.signupForm.formConfig[fieldKey].label,
      width: 180,
      flex: 1,
      sortable: true,
    })),
  ];

  return (
    <Paper sx={{ mt: 4, height: 400, width: "100%" }}>
      <DataGrid
        rows={classData.signups}
        columns={columns}
        pageSize={5}
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
          columns: {
            columnVisibilityModel: {
              id: false,
            },
          },
          sorting: {
            sortModel: [
              { field: classData.signupForm.fieldOrder[0], sort: "asc" },
            ],
          },
        }}
      />
    </Paper>
  );
}
