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

const ImportCsvHelpDialog = ({ open, onClose, handleImportContact }) => (
  <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
    <DialogTitle>How to Import Contacts from CSV</DialogTitle>
    <DialogContent>
      <Typography gutterBottom>
        To import contacts, your CSV file should have the following columns
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
            Required columns must be present. Extra columns will be ignored.
          </li>
          <li>Phone numbers will be normalized automatically.</li>
          <li>
            Groups can be left blank or separated by <code>;</code>.
          </li>
        </ul>
      </Typography>
    </DialogContent>
    <DialogActions>
      <input
        accept=".csv"
        style={{ display: "none" }}
        id="import-file"
        type="file"
        onChange={handleImportContact}
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

      <Button onClick={downloadTemplate} color="primary" variant="outlined">
        Download Template
      </Button>
      <Button onClick={onClose} color="primary" variant="contained">
        Close
      </Button>
    </DialogActions>
  </Dialog>
);

export default ImportCsvHelpDialog;
