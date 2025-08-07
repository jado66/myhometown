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
    assignment_level: "City",
    city: "Salt Lake City",
    community: "",
    title: "Sister",
    start_date: "2024-01-01",
    notes: "",
  },
  {
    first_name: "John",
    last_name: "Smith",
    email: "john.smith@email.com",
    contact_number: "801-555-5678",
    assignment_level: "Community",
    city: "",
    community: "Dixon",
    title: "Elder",
    start_date: "2024-02-15",
    notes: "New arrival",
  },
];

const csvHeader = [
  "First Name",
  "Last Name",
  "Email",
  "Phone",
  "Assignment Level",
  "City",
  "Community",
  "Group",
  "Title",
  "Start Date",
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
      "city",
      "Salt Lake City",
      "",
      "Missionary",
      "Sister",
      "2024-01-01",
      "",
    ].join(",") + "\n";
  const row2 =
    [
      "John",
      "Smith",
      "john.smith@email.com",
      "801-555-5678",
      "community",
      "",
      "East Side",
      "Missionary",
      "Elder",
      "2024-02-15",
      "New arrival",
    ].join(",") + "\n";
  const csv = header + row1 + row2;
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

const ImportMissionaryCsvHelpDialog = ({ open, onClose, handleImport }) => (
  <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
    <DialogTitle>How to Import Missionaries from CSV</DialogTitle>
    <DialogContent>
      <Typography gutterBottom>
        To import missionaries, your CSV file should have the following columns
        (case-insensitive):
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
            <b>Phone</b> (optional)
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
            <b>Group</b> (optional)
          </li>
          <li>
            <b>Title</b> (optional)
          </li>
          <li>
            <b>Start Date</b> (optional, YYYY-MM-DD)
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
                <TableCell>{row.assignment_level}</TableCell>
                <TableCell sx={{ whiteSpace: "nowrap" }}>{row.city}</TableCell>
                <TableCell>{row.community}</TableCell>
                <TableCell>{row.group}</TableCell>
                <TableCell>{row.title}</TableCell>
                <TableCell>{row.start_date}</TableCell>
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
