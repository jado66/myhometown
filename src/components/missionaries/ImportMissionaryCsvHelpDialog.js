import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Paper,
  Box,
} from "@mui/material";
import FileUploadIcon from "@mui/icons-material/FileUpload";

// Updated template header to include the new required 'Type' column (Missionary or Volunteer)
// Order matches the export format used in MissionaryManagement and the validation expectations.
const csvHeader = [
  "Type",
  "Gender",
  "First Name",
  "Last Name",
  "Email",
  "Phone",
  "Status",
  "Level",
  "Assignment",

  "Position",
  "Position Detail",
  "Start Date",
  "End Date",
  "Street Address",
  "City",
  "State",
  "Zip Code",
  "Home Stake",
  "Notes",
];

function downloadTemplate() {
  const link = document.createElement("a");
  link.href = "/Template.xlsx";
  link.download = "Template.xlsx";
  link.click();
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
            <b>Type *</b> <i>(Missionary or Volunteer)</i>
          </li>
          <li>
            <b>Gender</b> <i>(Male or Female)</i>
          </li>
          <li>
            <b>First Name *</b>
          </li>
          <li>
            <b>Last Name *</b>
          </li>
          <li>
            <b>Email *</b>
          </li>
          <li>
            <b>Phone *</b>
          </li>
          <li>
            <b>Status *</b> <i>(Active, Inactive, Pending)</i>
          </li>
          <li>
            <b>Level *</b> <i>(State, City, Community)</i>
          </li>
          <li>
            <b>Assignment *</b>
          </li>
          <li>
            <b>Position *</b>
          </li>
          <li>
            <b>Position Detail </b> (Optional)
          </li>

          <li>
            <b>Start Date *</b> (MM-DD-YYYY)
          </li>
          <li>
            <b>End Date *</b> (optional, MM-DD-YYYY)
          </li>
          <li>
            <b>Street Address *</b>
          </li>
          <li>
            <b>City *</b>
          </li>
          <li>
            <b>State *</b>
          </li>
          <li>
            <b>Zip Code *</b>
          </li>
          <li>
            <b>Home Stake </b> (for missionaries only)
          </li>
          <li>
            <b>Notes</b> (optional)
          </li>
        </ul>
      </Box>

      <Typography gutterBottom>
        <b>Tips:</b>
        <ul>
          <li>
            Required columns must be present. Extra columns will be ignored.
          </li>
          <li>Phone numbers will be normalized automatically.</li>
          <li>
            State, Cities and Communities must exist in our database. The
            downloadable template will contain all of the cities and communities
            values you may use.
          </li>
          <li>
            For Level 'state' the Assignment value must be 'Utah'. For 'city' or
            'community' it must match an existing name exactly
            (case-insensitive).
          </li>
          <li>
            Type must be either Missionary or Volunteer. If omitted it defaults
            to Missionary.
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
