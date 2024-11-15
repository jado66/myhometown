import { useMemo, useState } from "react";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";

import { Typography, Chip, Box, Button } from "@mui/material";
import { Add as AddIcon, Edit, ImportExport } from "@mui/icons-material";

const CommunityDataTable = ({ data, onAddClick, onRowClick }) => {
  const getStoredState = (key, defaultValue) => {
    try {
      const savedState = localStorage.getItem(key);
      return savedState ? JSON.parse(savedState) : defaultValue;
    } catch (error) {
      console.error(`Error loading ${key} from localStorage:`, error);
      return defaultValue;
    }
  };

  const exportToCSV = () => {
    alert("Exporting to CSV is not implemented yet.");
  };

  const [columnSizing, setColumnSizing] = useState(
    getStoredState("tableColumnSizes", {
      _id: 200,
      name: 200, // Increased size for combined name
      status: 250,
      managers: 140,
      communities: 150,
    })
  );

  const [pagination, setPagination] = useState(
    getStoredState("tablePagination", {
      pageIndex: 0,
      pageSize: 10,
    })
  );

  const [columnVisibility, setColumnVisibility] = useState(
    getStoredState("tableColumnVisibility", {
      _id: false,
      name: true,
      status: true,
      managers: true,
      communities: true,
    })
  );

  const [density, setDensity] = useState(
    getStoredState("tableDensity", "comfortable")
  );

  const columns = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        size: columnSizing.name,
        // Optional: Add a custom cell renderer if you want to style the name
        Cell: ({ row }) => (
          <Typography variant="body2">{row.original.name}</Typography>
        ),
      },
      {
        accessorKey: "visibility",
        header: "Status",
        size: columnSizing.status,
        Cell: ({ row }) => {
          const status = row.original.visibility ? "Public Facing" : "Unlisted";
          return <Typography variant="body2">{status}</Typography>;
        },
      },
      {
        accessorKey: "city",
        header: "City",
        size: columnSizing.city,
      },
      {
        accessorKey: "communityOwners",
        header: "Managers",
        size: columnSizing.managers,
        Cell: ({ row }) => {
          const managers = row.original.communityOwners || [];

          return (
            <Typography variant="body2">
              {managers.map((manager, index) => (
                <Chip
                  key={index}
                  label={`${manager.firstName} ${manager.lastName}`.trim()}
                  variant="outlined"
                  color="primary"
                  style={{ margin: 2 }}
                />
              ))}
            </Typography>
          );
        },
      },

      {
        accessorKey: "_id",
        header: "ID",
        size: 200,
      },
      // Buttons for actions
      //   {
      //     accessorKey: "actions",
      //     header: "Actions",
      //     size: 150,
      //     Cell: ({ row }) => (
      //       <Box sx={{ display: "flex", gap: 1 }}>
      //         <Button
      //           variant="outlined"
      //           color="secondary"
      //           size="small"
      //           onClick={() => alert(`Edit ${row.original.name}`)}
      //         >
      //           <Edit sx={{ mr: 1 }} />
      //           Edit Community
      //         </Button>
      //       </Box>
      //     ),
      //   },
    ],
    [columnSizing]
  );

  // Save state handlers
  const saveState = (key, state) => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch (error) {
      console.error(`Error saving ${key} to localStorage:`, error);
    }
  };

  const handleColumnSizingChange = (updater) => {
    const newColumnSizing =
      typeof updater === "function" ? updater(columnSizing) : updater;

    const sizesToSave = Object.keys(newColumnSizing).reduce((acc, key) => {
      const accessorKey = key.split("_").pop();
      acc[accessorKey] = newColumnSizing[key];
      return acc;
    }, {});

    setColumnSizing(sizesToSave);
    saveState("tableColumnSizes", sizesToSave);
  };

  const handlePaginationChange = (updater) => {
    const newPagination =
      typeof updater === "function" ? updater(pagination) : updater;
    setPagination(newPagination);
    saveState("tablePagination", newPagination);
  };

  const handleColumnVisibilityChange = (updater) => {
    const newVisibility =
      typeof updater === "function" ? updater(columnVisibility) : updater;
    setColumnVisibility(newVisibility);
    saveState("tableColumnVisibility", newVisibility);
  };

  const handleDensityChange = (newDensity) => {
    setDensity(newDensity);
    saveState("tableDensity", newDensity);
  };

  const table = useMaterialReactTable({
    columns,
    data: data, // Use the processed data instead of raw data
    defaultColumn: {
      maxSize: 400,
      minSize: 80,
      size: 160,
    },
    enableColumnResizing: true,
    enablePagination: true,
    enableColumnVisibility: true,
    enableDensityToggle: true,
    columnResizeMode: "onChange",
    paginationDisplayMode: "pages",
    onColumnSizingChange: handleColumnSizingChange,
    onPaginationChange: handlePaginationChange,
    onColumnVisibilityChange: handleColumnVisibilityChange,
    onDensityChange: handleDensityChange,
    muiTableBodyRowProps: ({ row }) => ({
      onClick: () => onRowClick?.(row.original),
      sx: { cursor: "pointer" },
    }),

    renderTopToolbarCustomActions: () => (
      <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
        {/* <Button
          color="primary"
          onClick={onAddClick}
          variant="contained"
          startIcon={<AddIcon />}
        >
          Add User
        </Button> */}
        {/* <Button
          color="primary"
          onClick={exportToCSV}
          variant="outlined"
          startIcon={<ImportExport />}
        >
          Export Table
        </Button> */}
        <Typography variant="body2" color="text.secondary">
          Total Communities: {data.length}
        </Typography>
      </Box>
    ),
    state: {
      columnSizing,
      pagination,
      columnVisibility,
      density,
    },
    muiPaginationProps: {
      rowsPerPageOptions: [5, 10, 20, 50, 100],
      showFirstButton: true,
      showLastButton: true,
    },
    positionPagination: "bottom",
    rowNumberDisplayMode: "static",
  });

  return (
    <>
      <MaterialReactTable table={table} />
    </>
  );
};

export default CommunityDataTable;
