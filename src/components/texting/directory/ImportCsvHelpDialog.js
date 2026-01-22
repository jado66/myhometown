import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  CircularProgress,
  Alert,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import FileUploadIcon from "@mui/icons-material/FileUpload";

const exampleRows = [
  {
    first_name: "Jane",
    middle_name: "A.",
    last_name: "Doe",
    email: "jane.doe@email.com",
    phone: "801-555-1234",
    groups: "Teacher",
  },
  {
    first_name: "John",
    middle_name: "",
    last_name: "Smith",
    email: "",
    phone: "801-555-5678",
    groups: "Missionary",
  },
];

const csvHeader = [
  "First Name",
  "Middle Name",
  "Last Name",
  "Email",
  "Phone",
  "Groups",
];

function downloadTemplate() {
  const header = csvHeader.join(",") + "\n";
  const row1 =
    [
      "Jane",
      "A.",
      "Doe",
      "jane.doe@email.com",
      "801-555-1234",
      "Missionary",
    ].join(",") + "\n";
  const row2 =
    ["John", "", "Smith", "", "801-555-5678", "Work"].join(",") + "\n";
  const csv = header + row1 + row2;
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "contacts-template.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

const ImportCsvHelpDialog = ({ open, onClose, handleImportContact }) => {
  const [isImporting, setIsImporting] = useState(false);
  const [importSummary, setImportSummary] = useState(null);

  const handleFileSelect = async (event) => {
    setIsImporting(true);
    try {
      const summary = await handleImportContact(event);
      if (summary) {
        setImportSummary(summary);
      }
    } finally {
      setIsImporting(false);
    }
  };

  const handleReset = () => {
    setImportSummary(null);
  };

  const handleClose = () => {
    setImportSummary(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>How to Import Contacts from CSV</DialogTitle>
      <DialogContent>
        {isImporting ? (
          // Spinner view during import
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              py: 4,
              gap: 2,
            }}
          >
            <CircularProgress size={48} />
            <Typography variant="h6">Importing contacts...</Typography>
            <Typography variant="body2" color="text.secondary">
              Please wait while your contacts are being processed.
            </Typography>
          </Box>
        ) : importSummary ? (
          // Summary view after import
          <Box sx={{ py: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
              Import Summary
            </Typography>

            <Box sx={{ display: "flex", gap: 3, mb: 3 }}>
              {/* Success box */}
              {importSummary.imported > 0 && (
                <Paper
                  sx={{
                    p: 2,
                    flex: 1,
                    backgroundColor: "#e8f5e9",
                    borderLeft: "4px solid #4caf50",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 1,
                    }}
                  >
                    <CheckCircleIcon sx={{ color: "#4caf50" }} />
                    <Typography variant="subtitle2" fontWeight="bold">
                      Imported
                    </Typography>
                  </Box>
                  <Typography variant="h5">{importSummary.imported}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    new contacts added
                  </Typography>
                </Paper>
              )}

              {/* Merged box */}
              {importSummary.merged > 0 && (
                <Paper
                  sx={{
                    p: 2,
                    flex: 1,
                    backgroundColor: "#fff3e0",
                    borderLeft: "4px solid #ff9800",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 1,
                    }}
                  >
                    <CheckCircleIcon sx={{ color: "#ff9800" }} />
                    <Typography variant="subtitle2" fontWeight="bold">
                      Merged
                    </Typography>
                  </Box>
                  <Typography variant="h5">{importSummary.merged}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    groups added to existing contacts
                  </Typography>
                </Paper>
              )}

              {/* Errors box */}
              {importSummary.errors > 0 && (
                <Paper
                  sx={{
                    p: 2,
                    flex: 1,
                    backgroundColor: "#ffebee",
                    borderLeft: "4px solid #f44336",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 1,
                    }}
                  >
                    <ErrorIcon sx={{ color: "#f44336" }} />
                    <Typography variant="subtitle2" fontWeight="bold">
                      Errors
                    </Typography>
                  </Box>
                  <Typography variant="h5">{importSummary.errors}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {importSummary.errors === 1 ? "issue" : "issues"}{" "}
                    encountered
                  </Typography>
                </Paper>
              )}
            </Box>

            {/* Error details */}
            {importSummary.errorDetails &&
              importSummary.errorDetails.length > 0 && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  <Typography
                    variant="subtitle2"
                    fontWeight="bold"
                    sx={{ mb: 1 }}
                  >
                    Errors Found:
                  </Typography>
                  <Box
                    component="ul"
                    sx={{
                      pl: 2,
                      mb: 0,
                      "& li": { mb: 0.5, fontSize: "0.875rem" },
                    }}
                  >
                    {importSummary.errorDetails
                      .slice(0, 5)
                      .map((error, idx) => (
                        <li key={idx}>{error}</li>
                      ))}
                    {importSummary.errorDetails.length > 5 && (
                      <li>
                        ... and {importSummary.errorDetails.length - 5} more
                        errors
                      </li>
                    )}
                  </Box>
                </Alert>
              )}

            {/* Success message */}
            {importSummary.imported > 0 && importSummary.errors === 0 && (
              <Alert severity="success">
                All contacts imported successfully!
              </Alert>
            )}
          </Box>
        ) : (
          // Initial help view
          <>
            <Typography gutterBottom>
              To import contacts, your CSV file should have the following
              columns (case-insensitive):
            </Typography>
            <Box mb={2}>
              <ul>
                <li>
                  <b>First Name</b> <i>(required)</i>
                </li>
                <li>
                  <b>Last Name</b> <i>(required)</i>
                </li>
                <li>
                  <b>Phone</b> <i>(required)</i>
                </li>
                <li>
                  <b>Middle Name</b> (optional)
                </li>
                <li>
                  <b>Email</b> (optional)
                </li>
                <li>
                  <b>Groups</b> (recommended)
                </li>
              </ul>
            </Box>
            <Typography gutterBottom>Example:</Typography>
            <TableContainer component={Paper} sx={{ mb: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    {csvHeader.map((header) => (
                      <TableCell key={header}>
                        <b>{header}</b>
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {exampleRows.map((row, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{row.first_name}</TableCell>
                      <TableCell>{row.middle_name}</TableCell>
                      <TableCell>{row.last_name}</TableCell>
                      <TableCell>{row.email}</TableCell>
                      <TableCell>{row.phone}</TableCell>
                      <TableCell>{row.groups}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Typography gutterBottom>
              <b>Tips:</b>
              <ul>
                <li>
                  Required columns must be present. Extra columns will be
                  ignored.
                </li>
                <li>Phone numbers will be normalized automatically.</li>
                <li>
                  Groups can be left blank or separated by <code>;</code>.
                </li>
              </ul>
            </Typography>
          </>
        )}
      </DialogContent>
      <DialogActions>
        {!isImporting && !importSummary && (
          <>
            <input
              accept=".csv"
              style={{ display: "none" }}
              id="import-file"
              type="file"
              onChange={handleFileSelect}
            />
            <label htmlFor="import-file">
              <Button
                variant="contained"
                component="span"
                startIcon={<FileUploadIcon />}
                size="small"
              >
                Import CSV
              </Button>
            </label>

            <Button
              onClick={downloadTemplate}
              color="primary"
              variant="outlined"
            >
              Download Template
            </Button>
          </>
        )}

        {importSummary && (
          <Button onClick={handleReset} color="primary" variant="contained">
            Import Another File
          </Button>
        )}

        <Button
          onClick={handleClose}
          color="primary"
          variant={importSummary ? "contained" : "contained"}
        >
          {importSummary ? "Close" : "Close"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ImportCsvHelpDialog;
