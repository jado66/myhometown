import { useMemo, useState } from "react";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import { Typography, Chip, Box, Button, CircularProgress } from "@mui/material";
import { generateFullReport } from "@/util/csv-utils";
import GenerateReportDialog from "../admin/GenerateReportsDialogue";

const CityDataTable = ({ data, onAddClick, onRowClick, getCommunity }) => {
  const [openReportDialog, setOpenReportDialog] = useState(false);
  const [selectedCity, setSelectedCity] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

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
      _id: 200,
      name: 200,
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
      // {
      //   accessorKey: "cityOwners",
      //   header: "Managers",
      //   size: columnSizing.managers,
      //   Cell: ({ row }) => {
      //     const managers = row.original.cityOwners || [];

      //     return (
      //       <Typography variant="body2">
      //         {managers.map((manager, index) => (
      //           <Chip
      //             key={index}
      //             label={`${manager.firstName} ${manager.lastName}`.trim()}
      //             variant="outlined"
      //             color="primary"
      //             style={{ margin: 2 }}
      //           />
      //         ))}
      //       </Typography>
      //     );
      //   },
      // },
      {
        accessorKey: "communities",
        header: "Communities",
        size: columnSizing.communities,
        Cell: ({ row }) => {
          const communities = row.original.communities || [];

          return (
            <Typography variant="body2">
              {communities.map((community, index) => (
                <Chip
                  key={index}
                  label={community.title}
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
      {
        accessorKey: "actions",
        header: "Actions",
        size: 200,
        enableResizing: false,
        enableSorting: false,
        Cell: ({ row }) => (
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              variant="outlined"
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedCity(row.original);
                setOpenReportDialog(true);
              }}
              disabled={isGenerating}
            >
              {isGenerating && selectedCity?._id === row.original._id ? (
                <>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  Generating...
                </>
              ) : (
                "Generate Report"
              )}
            </Button>
          </Box>
        ),
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

  const handleGenerateReport = async (includedCommunities) => {
    if (!selectedCity) return;

    setIsGenerating(true);
    try {
      const csv = await generateFullReport(
        selectedCity,
        includedCommunities,
        getCommunity
      );

      // Create and trigger download
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const downloadButton = document.createElement("a");
      downloadButton.href = url;
      downloadButton.download = `${selectedCity.name}-detailed-report.csv`;
      document.body.appendChild(downloadButton);
      downloadButton.click();
      document.body.removeChild(downloadButton);
      URL.revokeObjectURL(url);

      setOpenReportDialog(false);
    } catch (error) {
      console.error("Error generating report:", error);
      alert("Error generating report. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const table = useMaterialReactTable({
    columns,
    data: data,
    defaultColumn: {
      maxSize: 400,
      minSize: 80,
      size: 160,
    },
    enableColumnResizing: true,
    enablePagination: true,
    enableColumnVisibility: true,
    enableDensityToggle: true,
    enableRowSelection: false,
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
        <Typography variant="body2" color="text.secondary">
          Total Cities: {data.length}
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
      <GenerateReportDialog
        open={openReportDialog}
        handleClose={() => setOpenReportDialog(false)}
        onSubmit={handleGenerateReport}
        city={selectedCity}
        isGenerating={isGenerating}
      />
    </>
  );
};

export default CityDataTable;
