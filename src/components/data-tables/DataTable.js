"use-client";

import { Button } from "@mui/material";
import {
  DataGrid,
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarExport,
  GridToolbarQuickFilter,
} from "@mui/x-data-grid";
import { useState, useEffect } from "react";

const CustomToolbar = ({ buttonText, buttonFunction }) => (
  <GridToolbarContainer>
    <GridToolbarColumnsButton />
    <GridToolbarFilterButton />
    <GridToolbarExport />
    {buttonText && buttonFunction && (
      <Button variant="contained" onClick={buttonFunction} size="small">
        {buttonText}
      </Button>
    )}
    <GridToolbarQuickFilter />
    {/* Render button if text and function are provided */}
  </GridToolbarContainer>
);

const DataTable = ({
  rows,
  columns,
  id,
  hiddenColumns,
  buttonText,
  buttonFunction,
}) => {
  const [hasLoaded, setHasLoaded] = useState(false);
  const [initialState, setInitialState] = useState({
    columns: {
      columnVisibilityModel: hiddenColumns.reduce((obj, column) => {
        obj[column] = false;
        return obj;
      }, {}),
    },
    pagination: { paginationModel: { pageSize: 15 } },
  });

  useEffect(() => {
    const storedState = localStorage.getItem(`dataTable-${id}-initialState`);

    if (storedState) {
      setInitialState(JSON.parse(storedState));
    }

    setHasLoaded(true);
  }, [id]);

  useEffect(() => {
    if (hasLoaded) {
      localStorage.setItem(
        `dataTable${id}-initialState`,
        JSON.stringify(initialState)
      );
    }
  }, [initialState]);

  const handlePaginationModelChange = (params) => {
    setInitialState((prevState) => ({
      ...prevState,
      pagination: { paginationModel: { pageSize: params.pageSize } },
    }));
  };

  const handleColumnVisibilityChange = (params) => {
    setInitialState((prevState) => ({
      ...prevState,
      columns: { columnVisibilityModel: params },
    }));
  };

  if (hasLoaded) {
    return (
      <DataGrid
        rows={rows}
        getRowId={(row) => row._id}
        columns={columns}
        pageSize={15}
        rowsPerPageOptions={[5, 10, 20, 50, 100]}
        disableRowSelectionOnClick
        disableCellSelectionOnClick
        pageSizeOptions={[5, 10, 20, 50, 100]}
        slots={{
          toolbar: () => (
            <CustomToolbar
              buttonText={buttonText}
              buttonFunction={buttonFunction}
            />
          ),
        }}
        initialState={initialState}
        onColumnVisibilityModelChange={handleColumnVisibilityChange}
        onPaginationModelChange={handlePaginationModelChange}
        sx={{
          "&.MuiDataGrid-root .MuiDataGrid-cell:focus-within": {
            outline: "none !important",
          },
        }}
      />
    );
  }

  return <div>Loading...</div>;
};

export { DataTable };
