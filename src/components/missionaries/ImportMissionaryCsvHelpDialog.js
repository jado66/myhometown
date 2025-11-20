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
  IconButton,
  CircularProgress,
} from "@mui/material";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

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

const instructions = [
  "Download the Excel template.",
  "Add your missionaries and volunteers to the template. Ensure all required columns are filled out.",
  "Remove the rows (1-28) containing the instructions.",
  "Save the file as a CSV.",
  "Upload the CSV file using the 'Import CSV' button.",
  "Review the import results and fix any errors if necessary.",
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
}) => {
  // Check if CSV has been processed (either has results or error)
  const csvProcessed =
    importResults?.valid?.length > 0 ||
    importResults?.errors?.length > 0 ||
    importError;

  // Check if data import is complete (successfully saved to database)
  const dataImportComplete =
    importSummary &&
    (importSummary.success > 0 ||
      importSummary.duplicates.length > 0 ||
      importSummary.failed.length > 0);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Import Missionaries &amp; Volunteers from CSV
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        {/* Show spinner while importing to database */}
        {importing && (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              py: 4,
            }}
          >
            <CircularProgress size={60} sx={{ mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              Importing to database...
            </Typography>
          </Box>
        )}

        {/* Success view after data import is complete */}
        {!importing && dataImportComplete && (
          <>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                mb: 3,
              }}
            >
              <CheckCircleIcon
                sx={{ fontSize: 80, color: "success.main", mb: 2 }}
              />
              <Typography variant="h5" gutterBottom>
                Import Complete!
              </Typography>
            </Box>

            {/* Import Summary */}
            <Paper sx={{ p: 2, mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Import Summary
              </Typography>
              <Typography variant="caption" display="block">
                Success: {importSummary.success}
              </Typography>
              {importSummary.duplicates.length > 0 && (
                <Box mt={1}>
                  <Typography
                    variant="caption"
                    display="block"
                    color="warning.main"
                  >
                    Duplicates skipped ({importSummary.duplicates.length}):
                  </Typography>
                  <Box
                    component="ul"
                    sx={{ pl: 3, m: 0, maxHeight: 100, overflow: "auto" }}
                  >
                    {importSummary.duplicates.map((dup, i) => (
                      <li key={i}>
                        <Typography variant="caption" color="warning.main">
                          {dup.name} ({dup.email})
                        </Typography>
                      </li>
                    ))}
                  </Box>
                </Box>
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
          </>
        )}

        {/* Initial view (before CSV upload) - only show if no CSV processed and not importing */}
        {!importing && !csvProcessed && !dataImportComplete && (
          <>
            <Typography gutterBottom>
              To import missionaries and volunteers:
            </Typography>

            <Box component="ol" sx={{ pl: 3, mb: 2 }}>
              {instructions.map((step, index) => (
                <li key={index}>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    {step}
                  </Typography>
                </li>
              ))}
            </Box>

            <Typography gutterBottom>
              <b>Tips:</b>
              <ul>
                <li>
                  Gender, Position Detail, Start Date, End Date, Home Stake, and
                  Notes are optional.
                </li>
                <li>Phone numbers will be formatted automatically.</li>
                <li>
                  Cities, Communities, and Positions must exist in our database.
                </li>
                <li>
                  The downloadable template will provide all valid options.
                </li>
              </ul>
            </Typography>
          </>
        )}

        {/* Validation Results - shown after CSV is processed but before data import */}
        {!importing && csvProcessed && !dataImportComplete && (
          <>
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
              <Paper
                sx={{
                  p: 3,
                  mb: 2,
                  border: "2px solid #4caf50",
                  backgroundColor: "#f1f8f4",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                <Box sx={{ textAlign: "center" }}>
                  <Typography
                    color="success.main"
                    variant="h6"
                    gutterBottom
                    fontWeight="bold"
                  >
                    ✓ {importResults.valid.length} rows ready to import
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Click the button below to save them to the database.
                  </Typography>
                </Box>

                {!importing &&
                  csvProcessed &&
                  !dataImportComplete &&
                  importResults?.valid?.length > 0 &&
                  !importError && (
                    <Button
                      onClick={onSubmit}
                      color="success"
                      variant="contained"
                      size="large"
                      startIcon={<CheckCircleIcon />}
                      sx={{
                        px: 4,
                        py: 1.5,
                        fontSize: "1rem",
                        fontWeight: "bold",
                        textTransform: "none",
                        boxShadow: 3,
                        "&:hover": {
                          boxShadow: 6,
                          transform: "translateY(-2px)",
                        },
                        transition: "all 0.2s ease-in-out",
                      }}
                    >
                      Import {importResults.valid.length} Row
                      {importResults.valid.length !== 1 ? "s" : ""} to Database
                    </Button>
                  )}
              </Paper>
            )}
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button
          onClick={downloadTemplate}
          color="primary"
          variant="outlined"
          sx={{ mr: "auto" }}
        >
          Download Template
        </Button>
        <input
          accept=".csv"
          style={{ display: "none" }}
          id="import-missionary-file"
          type="file"
          onChange={(e) => {
            handleImport(e);
            e.target.value = ""; // Clear the input so the same file can be selected again
          }}
          disabled={importing || csvProcessed || dataImportComplete}
        />
        <label htmlFor="import-missionary-file">
          <Button
            variant="contained"
            component="span"
            startIcon={<FileUploadIcon />}
            size="small"
            disabled={importing || csvProcessed || dataImportComplete}
          >
            Import CSV
          </Button>
        </label>
        {/* Only show Import Rows button when validation passed and not importing/complete */}
      </DialogActions>
    </Dialog>
  );
};

export default ImportMissionaryCsvHelpDialog;
