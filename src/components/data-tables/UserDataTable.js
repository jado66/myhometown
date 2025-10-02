import { useMemo, useState } from "react";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";

import { Typography, Chip, Box, Button } from "@mui/material";
import { Add as AddIcon, ImportExport } from "@mui/icons-material";
import { supabase } from "@/util/supabase";

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

  const exportToCSV = () => {
    const headers = columns.map((col) => col.header).join(",") + "\n";

    const rows = processedData
      .map((row) =>
        columns
          .map((col) => {
            const cellValue = row[col.accessorKey];

            if (
              col.accessorKey === "permissions" &&
              typeof cellValue === "object"
            ) {
              // Filter by true values and join keys for permissions
              return `"${Object.keys(cellValue)
                .filter((key) => cellValue[key])
                .join(",")}"`;
            } else if (
              (col.accessorKey === "communities" ||
                col.accessorKey === "cities") &&
              Array.isArray(cellValue)
            ) {
              // Join names for communities and cities
              return `"${cellValue.map((item) => item.name).join(",")}"`;
            } else {
              // Default case for other fields
              return `"${cellValue !== undefined ? cellValue : ""}"`;
            }
          })
          .join(",")
      )
      .join("\n");

    const csvContent = headers + rows;
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "user_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const [columnSizing, setColumnSizing] = useState(
    getStoredState("tableColumnSizes", {
      name: 200, // Increased size for combined name
      email: 250,
      role: 140,
      contact_number: 150,
      permissions: 200,
      cities: 200,
      communities: 200,
      last_active_at: 180,
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
      contact_number: true,
      cities: true,
      communities: true,
      last_active_at: true,
    })
  );

  const [density, setDensity] = useState(
    getStoredState("tableDensity", "comfortable")
  );

  // Transform the data to combine first and last names
  const processedData = useMemo(() => {
    return data.map((row) => ({
      ...row,
      name: `${row.first_name || ""} ${row.last_name || ""}`.trim(),
    }));
  }, [data]);

  const columns = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        size: columnSizing.name,
        // Custom sort: sort by last name, then first name
        sortingFn: (rowA, rowB) => {
          const aLast = (rowA.original.last_name || "").toLowerCase();
          const bLast = (rowB.original.last_name || "").toLowerCase();
          if (aLast < bLast) return -1;
          if (aLast > bLast) return 1;
          // If last names are equal, sort by first name
          const aFirst = (rowA.original.first_name || "").toLowerCase();
          const bFirst = (rowB.original.first_name || "").toLowerCase();
          if (aFirst < bFirst) return -1;
          if (aFirst > bFirst) return 1;
          return 0;
        },
        Cell: ({ row }) => (
          <Typography variant="body2">{row.original.name}</Typography>
        ),
      },
      {
        accessorKey: "email",
        header: "Email Address",
        size: columnSizing.email,
      },
      {
        accessorKey: "contact_number",
        header: "Phone",
        size: columnSizing.contact_number,
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
                    label={key.replace(/_/g, " ")}
                    variant="outlined"
                    color="primary"
                    sx={{ mx: 0.5, textTransform: "capitalize" }}
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
          const cityDetails = row.original.cities_details || [];

          return (
            <Typography variant="body2">
              {cityDetails.map((city, index) => (
                <Chip
                  key={city.id}
                  label={`${city.name}, ${city.state}`}
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
          const communityDetails = row.original.communities_details || [];

          return (
            <Box>
              {communityDetails.map((community, index) => (
                <Chip
                  key={community.id}
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
        accessorKey: "last_active_at",
        header: "Last Active",
        size: columnSizing.last_active_at,
        Cell: ({ row }) => {
          const lastLogin = row.original.last_active_at;
          if (!lastLogin)
            return (
              <Typography variant="body2" color="text.secondary">
                Never
              </Typography>
            );

          const date = new Date(lastLogin);
          const now = new Date();
          const diffInMs = now - date;
          const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

          let displayText;
          if (diffInDays === 0) {
            displayText = "Today";
          } else if (diffInDays === 1) {
            displayText = "Yesterday";
          } else if (diffInDays < 7) {
            displayText = `${diffInDays} days ago`;
          } else {
            displayText = date.toLocaleDateString();
          }

          return (
            <Typography variant="body2" title={date.toLocaleString()}>
              {displayText}
            </Typography>
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
    data: processedData, // Use the processed data instead of raw data
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
        <Button
          color="primary"
          onClick={exportToCSV}
          variant="outlined"
          startIcon={<ImportExport />}
        >
          Export Table
        </Button>
        <Typography variant="body2" color="text.secondary">
          Total Users: {processedData.length}
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
