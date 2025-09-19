// BulkImportDialog.tsx
import React, { useState, useRef } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  LinearProgress,
  IconButton,
  Grid,
  Card,
  CardContent,
} from "@mui/material";
import {
  CloudUpload,
  Close,
  FileUpload,
  CheckCircle,
  Error as ErrorIcon,
  Download,
} from "@mui/icons-material";
import Papa from "papaparse";

const FIELD_MAPPINGS = [
  { field: "first_name", label: "First Name", required: true },
  { field: "last_name", label: "Last Name", required: true },
  { field: "email", label: "Email", required: true },
  { field: "contact_number", label: "Phone Number", required: true },
  { field: "gender", label: "Gender", required: true },
  { field: "assignment_level", label: "Assignment Level", required: false },
  { field: "city_name", label: "City Name", required: false },
  { field: "community_name", label: "Community Name", required: false },
  { field: "group", label: "Group", required: false },
  { field: "title", label: "Title", required: false },
  { field: "stake_name", label: "Stake Name", required: false },
  { field: "start_date", label: "Call Date", required: false },
  { field: "duration", label: "Duration", required: false },
  { field: "notes", label: "Notes", required: false },
];

interface BulkImportDialogProps {
  open: boolean;
  onClose: () => void;
  onImport: (missionaries: any[]) => Promise<void>;
  cities: any[];
  communities: any[];
}

export const BulkImportDialog: React.FC<BulkImportDialogProps> = ({
  open,
  onClose,
  onImport,
  cities,
  communities,
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [csvData, setCsvData] = useState<any[]>([]);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [fieldMappings, setFieldMappings] = useState<Record<string, string>>(
    {}
  );
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [importing, setImporting] = useState(false);
  const [importResults, setImportResults] = useState<{
    success: number;
    failed: number;
    errors: string[];
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const steps = ["Upload CSV", "Map Fields", "Preview", "Import"];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setCsvData(results.data);
        setCsvHeaders(Object.keys(results.data[0] || {}));
        setActiveStep(1);
        initializeFieldMappings(Object.keys(results.data[0] || {}));
      },
      error: (error) => {
        console.error("Error parsing CSV:", error);
      },
    });
  };

  const initializeFieldMappings = (headers: string[]) => {
    const mappings: Record<string, string> = {};
    FIELD_MAPPINGS.forEach(({ field }) => {
      const matchingHeader = headers.find(
        (h) =>
          h.toLowerCase().replace(/[_\s]/g, "") ===
          field.toLowerCase().replace(/[_\s]/g, "")
      );
      if (matchingHeader) {
        mappings[field] = matchingHeader;
      }
    });
    setFieldMappings(mappings);
  };

  const handleMappingChange = (field: string, csvColumn: string) => {
    setFieldMappings({
      ...fieldMappings,
      [field]: csvColumn,
    });
  };

  const generatePreview = () => {
    const preview = csvData.slice(0, 5).map((row) => {
      const missionary: any = {};
      Object.entries(fieldMappings).forEach(([field, csvColumn]) => {
        if (csvColumn) {
          missionary[field] = row[csvColumn] || "";
        }
      });

      // Map city and community names to IDs
      if (missionary.city_name) {
        const city = cities.find(
          (c) => c.name.toLowerCase() === missionary.city_name.toLowerCase()
        );
        missionary.city_id = city ? city._id : "";
      }

      if (missionary.community_name) {
        const community = communities.find(
          (c) =>
            c.name.toLowerCase() === missionary.community_name.toLowerCase()
        );
        missionary.community_id = community ? community._id : "";
      }

      // Default values
      missionary.assignment_status = "active";
      missionary.assignment_level = missionary.assignment_level || "state";
      missionary.gender = missionary.gender || "female";

      return missionary;
    });

    setPreviewData(preview);
    setActiveStep(2);
  };

  const handleImport = async () => {
    setImporting(true);
    const results = { success: 0, failed: 0, errors: [] as string[] };

    const missionariesToImport = csvData.map((row) => {
      const missionary: any = {};
      Object.entries(fieldMappings).forEach(([field, csvColumn]) => {
        if (csvColumn) {
          missionary[field] = row[csvColumn] || "";
        }
      });

      // Map city and community names to IDs
      if (missionary.city_name) {
        const city = cities.find(
          (c) => c.name.toLowerCase() === missionary.city_name.toLowerCase()
        );
        missionary.city_id = city ? city._id : "";
        delete missionary.city_name;
      }

      if (missionary.community_name) {
        const community = communities.find(
          (c) =>
            c.name.toLowerCase() === missionary.community_name.toLowerCase()
        );
        missionary.community_id = community ? community._id : "";
        delete missionary.community_name;
      }

      // Default values
      missionary.assignment_status = "active";
      missionary.assignment_level = missionary.assignment_level || "state";
      missionary.gender = missionary.gender || "female";

      return missionary;
    });

    try {
      await onImport(missionariesToImport);
      results.success = missionariesToImport.length;
    } catch (error: any) {
      results.failed = missionariesToImport.length;
      results.errors.push(error.message);
    }

    setImportResults(results);
    setImporting(false);
    setActiveStep(3);
  };

  const downloadTemplate = () => {
    const headers = [
      "first_name",
      "last_name",
      "email",
      "contact_number",
      "gender",
      "assignment_level",
      "city_name",
      "community_name",
      "group",
      "title",
      "stake_name",
      "start_date",
      "duration",
      "notes",
    ];

    const template = [
      headers.join(","),
      "John,Doe,john.doe@example.com,801-555-1234,male,city,Salt Lake City,Downtown,Executive Board,City Chair,Salt Lake Stake,2024-01-15,18 months,Example missionary",
    ].join("\n");

    const blob = new Blob([template], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "missionary_import_template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const reset = () => {
    setActiveStep(0);
    setCsvData([]);
    setCsvHeaders([]);
    setFieldMappings({});
    setPreviewData([]);
    setImportResults(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">
            Bulk Missionaries &amp; Volunteers Missionaries
          </Typography>
          <IconButton onClick={onClose} edge="end">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Step 1: Upload CSV */}
        {activeStep === 0 && (
          <Box>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="body1" gutterBottom>
                  Upload a CSV file containing missionary information. The file
                  should include:
                </Typography>
                <Box sx={{ mt: 2, mb: 2 }}>
                  {FIELD_MAPPINGS.filter((f) => f.required).map((field) => (
                    <Chip
                      key={field.field}
                      label={field.label}
                      size="small"
                      color="primary"
                      sx={{ mr: 1, mb: 1 }}
                    />
                  ))}
                </Box>
                <Button
                  variant="outlined"
                  startIcon={<Download />}
                  onClick={downloadTemplate}
                  size="small"
                >
                  Download Template
                </Button>
              </CardContent>
            </Card>

            <Box
              sx={{
                border: "2px dashed",
                borderColor: "primary.main",
                borderRadius: 2,
                p: 4,
                textAlign: "center",
                cursor: "pointer",
                "&:hover": { backgroundColor: "action.hover" },
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              <CloudUpload
                sx={{ fontSize: 48, color: "primary.main", mb: 2 }}
              />
              <Typography variant="h6" gutterBottom>
                Click to upload CSV file
              </Typography>
              <Typography variant="body2" color="text.secondary">
                or drag and drop
              </Typography>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                hidden
                onChange={handleFileUpload}
              />
            </Box>
          </Box>
        )}

        {/* Step 2: Map Fields */}
        {activeStep === 1 && (
          <Box>
            <Alert severity="info" sx={{ mb: 3 }}>
              Map your CSV columns to the missionary fields. Required fields are
              marked with *.
            </Alert>

            <Grid container spacing={2}>
              {FIELD_MAPPINGS.map(({ field, label, required }) => (
                <Grid item xs={12} sm={6} key={field}>
                  <FormControl fullWidth>
                    <InputLabel>
                      {label} {required && "*"}
                    </InputLabel>
                    <Select
                      value={fieldMappings[field] || ""}
                      onChange={(e) =>
                        handleMappingChange(field, e.target.value)
                      }
                      label={`${label} ${required ? "*" : ""}`}
                    >
                      <MenuItem value="">
                        <em>-- Not mapped --</em>
                      </MenuItem>
                      {csvHeaders.map((header) => (
                        <MenuItem key={header} value={header}>
                          {header}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              ))}
            </Grid>

            <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
              <Button
                variant="contained"
                onClick={generatePreview}
                disabled={
                  !FIELD_MAPPINGS.filter((f) => f.required).every(
                    (f) => fieldMappings[f.field]
                  )
                }
              >
                Continue to Preview
              </Button>
            </Box>
          </Box>
        )}

        {/* Step 3: Preview */}
        {activeStep === 2 && (
          <Box>
            <Alert severity="info" sx={{ mb: 3 }}>
              Preview of first 5 records. Total records to import:{" "}
              {csvData.length}
            </Alert>

            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Phone</TableCell>
                    <TableCell>Assignment</TableCell>
                    <TableCell>Location</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {previewData.map((missionary, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        {missionary.first_name} {missionary.last_name}
                      </TableCell>
                      <TableCell>{missionary.email}</TableCell>
                      <TableCell>{missionary.contact_number}</TableCell>
                      <TableCell>
                        {missionary.title || missionary.group || "N/A"}
                      </TableCell>
                      <TableCell>
                        {missionary.city_id
                          ? cities.find((c) => c._id === missionary.city_id)
                              ?.name
                          : "State Level"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Box
              sx={{ mt: 3, display: "flex", justifyContent: "space-between" }}
            >
              <Button onClick={() => setActiveStep(1)}>Back</Button>
              <Button
                variant="contained"
                startIcon={<FileUpload />}
                onClick={handleImport}
                disabled={importing}
              >
                Import {csvData.length} Missionaries
              </Button>
            </Box>

            {importing && <LinearProgress sx={{ mt: 2 }} />}
          </Box>
        )}

        {/* Step 4: Results */}
        {activeStep === 3 && importResults && (
          <Box>
            <Box sx={{ textAlign: "center", py: 4 }}>
              {importResults.failed === 0 ? (
                <>
                  <CheckCircle
                    sx={{ fontSize: 64, color: "success.main", mb: 2 }}
                  />
                  <Typography variant="h5" gutterBottom>
                    Import Successful!
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {importResults.success} missionaries imported successfully
                  </Typography>
                </>
              ) : (
                <>
                  <ErrorIcon
                    sx={{ fontSize: 64, color: "error.main", mb: 2 }}
                  />
                  <Typography variant="h5" gutterBottom>
                    Import Failed
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {importResults.errors.join(", ")}
                  </Typography>
                </>
              )}
            </Box>

            <Box
              sx={{ mt: 4, display: "flex", justifyContent: "center", gap: 2 }}
            >
              <Button variant="outlined" onClick={reset}>
                Import Another File
              </Button>
              <Button variant="contained" onClick={onClose}>
                Done
              </Button>
            </Box>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};
