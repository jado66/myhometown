import React from "react";
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
} from "@mui/material";
import FileUploadIcon from "@mui/icons-material/FileUpload";

const exampleRows = [
  {
    first_name: "Jane",
    last_name: "Doe",
    email: "jane.doe@email.com",
    contact_number: "801-555-1234",
    status: "active",
    assignment_level: "city",
    city: "Salt Lake City",
    community: "",
    group: "Group A",
    title: "Sister",
    start_date: "2024-01-01",
    end_date: "2024-12-31",
    street_address: "123 Main St",
    address_city: "Salt Lake City",
    address_state: "UT",
    zip_code: "84101",
    notes: "",
  },
  {
    first_name: "John",
    last_name: "Smith",
    email: "john.smith@email.com",
    contact_number: "801-555-5678",
    status: "pending",
    assignment_level: "community",
    city: "",
    community: "Dixon",
    group: "Group B",
    title: "Elder",
    start_date: "2024-02-15",
    end_date: "2025-02-14",
    street_address: "456 Oak Ave",
    address_city: "Dixon",
    address_state: "UT",
    zip_code: "84302",
    notes: "New arrival",
  },
];

const csvHeader = [
  "First Name",
  "Last Name",
  "Email",
  "Phone",
  "Status",
  "Assignment Level",
  "City",
  "Community",
  "Group",
  "Title",
  "Start Date",
  "End Date",
  "Street Address",
  "Address City",
  "Address State",
  "Zip Code",
  "Notes",
];

function downloadTemplate() {
  const header = csvHeader.join(",") + "\n";
  const row1 =
    [
      "Jane",
      "Doe",
      "jane.doe@email.com",
      "801-555-1234",
      "active",
      "city",
      "Salt Lake City",
      "",
      "Group A",
      "CRC Director",
      "2024-01-01",
      "2024-12-31",
      "123 Main St",
      "Salt Lake City",
      "UT",
      "84101",
      "",
    ].join(",") + "\n";
  const row2 =
    [
      "John",
      "Smith",
      "john.smith@email.com",
      "801-555-5678",
      "pending",
      "community",
      "",
      "Dixon",

      "Teacher",
      "2024-02-15",
      "2025-02-14",
      "456 Oak Ave",
      "Dixon",
      "UT",
      "84302",
      "New arrival",
    ].join(",") + "\n";
  const row3 =
    [
      "Alice",
      "Johnson",
      "alice.johnson@email.com",
      "801-555-8765",
      "active",
      "state",
      "",
      "",
      "State Team",
      "Coordinator",
      "2024-03-10",
      "2025-03-09",
      "789 Pine Rd",
      "Provo",
      "UT",
      "84604",
      "Experienced missionary",
    ].join(",") + "\n";
  const csv = header + row1 + row2 + row3;
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "missionaries-template.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

const ImportMissionaryCsvHelpDialog = ({
  open,
  onClose,
  handleImport,
  importResults,
  importError,
  onSubmit,
  importing,
  importSummary,
}) => (
  <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
    <DialogTitle>Import Missionaries &amp; Volunteers from CSV</DialogTitle>
    <DialogContent>
      <Typography gutterBottom>
        To import missionaries and volunteers, your CSV file should have the
        following columns (case-insensitive):
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
            <b>Email</b> <i>(required, must be unique)</i>
          </li>
          <li>
            <b>Phone</b> (required)
          </li>
          <li>
            <b>Status</b> <i>(required: active, inactive, pending)</i>
          </li>
          <li>
            <b>Assignment Level</b> <i>(required: state, city, community)</i>
          </li>
          <li>
            <b>City</b> (required if Assignment Level is City)
          </li>
          <li>
            <b>Community</b> (required if Assignment Level is Community)
          </li>

          <li>
            <b>Title</b> (optional)
          </li>
          <li>
            <b>Start Date</b> (required, YYYY-MM-DD)
          </li>
          <li>
            <b>End Date</b> (optional, YYYY-MM-DD)
          </li>
          <li>
            <b>Street Address</b> (required)
          </li>
          <li>
            <b>Address City</b> (required)
          </li>
          <li>
            <b>Address State</b> (required)
          </li>
          <li>
            <b>Zip Code</b> (required)
          </li>
          <li>
            <b>Notes</b> (optional)
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
                <TableCell>{row.last_name}</TableCell>
                <TableCell>{row.email}</TableCell>
                <TableCell sx={{ whiteSpace: "nowrap" }}>
                  {row.contact_number}
                </TableCell>
                <TableCell>{row.status}</TableCell>
                <TableCell>{row.assignment_level}</TableCell>
                <TableCell sx={{ whiteSpace: "nowrap" }}>{row.city}</TableCell>
                <TableCell>{row.community}</TableCell>

                <TableCell>{row.title}</TableCell>
                <TableCell>{row.start_date}</TableCell>
                <TableCell>{row.end_date}</TableCell>
                <TableCell>{row.street_address}</TableCell>
                <TableCell>{row.address_city}</TableCell>
                <TableCell>{row.address_state}</TableCell>
                <TableCell>{row.zip_code}</TableCell>
                <TableCell>{row.notes}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Typography gutterBottom>
        <b>Tips:</b>
        <ul>
          <li>
            Required columns must be present. Extra columns will be ignored.
          </li>
          <li>Phone numbers will be normalized automatically.</li>
          <li>
            Assignment Level, City, and Community should match your system's
            values.
          </li>
        </ul>
      </Typography>
      {/* Results Section */}
      {importError && (
        <Paper sx={{ p: 2, mb: 2, border: "1px solid #f44336" }}>
          <Typography color="error" variant="subtitle2" gutterBottom>
            Errors Found
          </Typography>
          <Box
            component="ul"
            sx={{ pl: 3, m: 0, maxHeight: 160, overflow: "auto" }}
          >
            {importResults?.errors?.map((err, i) => (
              <li key={i}>
                <Typography variant="caption" color="error">
                  {err}
                </Typography>
              </li>
            ))}
          </Box>
        </Paper>
      )}
      {importResults?.valid?.length > 0 && !importError && (
        <Paper sx={{ p: 2, mb: 2, border: "1px solid #4caf50" }}>
          <Typography color="success.main" variant="subtitle2" gutterBottom>
            {importResults.valid.length} rows ready to import
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Click 'Import Rows' to save them.
          </Typography>
        </Paper>
      )}
      {importSummary &&
      (importSummary.success ||
        importSummary.duplicates.length ||
        importSummary.failed.length) ? (
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Import Summary
          </Typography>
          <Typography variant="caption" display="block">
            Success: {importSummary.success}
          </Typography>
          {importSummary.duplicates.length > 0 && (
            <Typography variant="caption" display="block" color="warning.main">
              Duplicates skipped ({importSummary.duplicates.length}):{" "}
              {importSummary.duplicates.slice(0, 5).join(", ")}
              {importSummary.duplicates.length > 5 ? "..." : ""}
            </Typography>
          )}
          {importSummary.failed.length > 0 && (
            <Box mt={1}>
              <Typography variant="caption" color="error" display="block">
                Failed ({importSummary.failed.length}):
              </Typography>
              <Box
                component="ul"
                sx={{ pl: 3, m: 0, maxHeight: 100, overflow: "auto" }}
              >
                {importSummary.failed.slice(0, 8).map((f, i) => (
                  <li key={i}>
                    <Typography variant="caption" color="error">
                      {f.email}: {f.reason}
                    </Typography>
                  </li>
                ))}
              </Box>
            </Box>
          )}
        </Paper>
      ) : null}
    </DialogContent>
    <DialogActions>
      <input
        accept=".csv"
        style={{ display: "none" }}
        id="import-missionary-file"
        type="file"
        onChange={handleImport}
      />
      <label htmlFor="import-missionary-file">
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
        onClick={onSubmit}
        color="success"
        variant="contained"
        size="small"
        disabled={importing || !importResults?.valid?.length || !!importError}
      >
        {importing ? "Importing..." : "Import Rows"}
      </Button>
      <Button onClick={downloadTemplate} color="primary" variant="outlined">
        Download Template
      </Button>
      <Button onClick={onClose} color="primary" variant="contained">
        Close
      </Button>
    </DialogActions>
  </Dialog>
);

export default ImportMissionaryCsvHelpDialog;
