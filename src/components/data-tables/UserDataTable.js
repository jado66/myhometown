import { useMemo, useState } from "react";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";

import { Typography, Chip, Box, Button } from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";

const UserDataTable = ({ data, onAddClick, onRowClick }) => {
  const getStoredState = (key, defaultValue) => {
    try {
      const savedState = localStorage.getItem(key);
      return savedState ? JSON.parse(savedState) : defaultValue;
    } catch (error) {
      console.error(`Error loading ${key} from localStorage:`, error);
      return defaultValue;
    }
  };

  const [columnSizing, setColumnSizing] = useState(
    getStoredState("tableColumnSizes", {
      name: 160,
      email: 250,
      role: 140,
      contactNumber: 150,
      permissions: 200,
      cities: 200,
      communities: 200,
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
      email: true,
      role: true,
      contactNumber: true,
      cities: true,
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
      },
      {
        accessorKey: "email",
        header: "Email Address",
        size: columnSizing.email,
      },
      {
        accessorKey: "contactNumber",
        header: "Phone",
        size: columnSizing.contactNumber,
      },
      {
        accessorKey: "permissions",
        header: "Permissions",
        size: columnSizing.permissions,
        Cell: ({ row }) => {
          const permissions = row.original.permissions;
          if (!permissions) return null;

          return (
            <Box>
              {Object.entries(permissions)
                .filter(([_, value]) => value)
                .map(([key], index) => (
                  <Chip
                    key={index}
                    label={key}
                    variant="outlined"
                    color="primary"
                    style={{ margin: 2, textTransform: "capitalize" }}
                  />
                ))}
            </Box>
          );
        },
      },
      {
        accessorKey: "cities",
        header: "Cities",
        size: columnSizing.cities,
        Cell: ({ row }) => {
          const cities = row.original.cities || [];

          return (
            <Typography variant="body2">
              {cities.map((city, index) => (
                <Chip
                  key={index}
                  label={city.name}
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
        accessorKey: "communities",
        header: "Communities",
        size: columnSizing.communities,
        Cell: ({ row }) => {
          const communities = row.original.communities || [];

          return (
            <Box>
              {communities.map((community, index) => (
                <Chip
                  key={index}
                  label={community.name}
                  variant="outlined"
                  color="secondary"
                  style={{ margin: 2 }}
                />
              ))}
            </Box>
          );
        },
      },
      {
        accessorKey: "_id",
        header: "ID",
        size: 200,
      },
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
    data,
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
        <Button
          color="primary"
          onClick={onAddClick}
          variant="contained"
          startIcon={<AddIcon />}
        >
          Add User
        </Button>
        <Typography variant="body2" color="text.secondary">
          Total Users: {data.length}
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

  return <MaterialReactTable table={table} />;
};

export default UserDataTable;
