import React, { useState } from "react";
import {
  Box,
  Button,
  Typography,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Chip,
  CircularProgress,
} from "@mui/material";
import { Upload, Description, Check, Warning } from "@mui/icons-material";

export const RecipientImporter = ({
  onImportRecipients,
  existingRecipients = [],
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [importedData, setImportedData] = useState([]);
  const [validRecipients, setValidRecipients] = useState([]);
  const [invalidRecipients, setInvalidRecipients] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");

  // Function to validate and format phone numbers
  const formatPhoneNumber = (phone) => {
    if (!phone) return null;

    // Remove all non-digit characters
    const digits = phone.replace(/\D/g, "");

    // Handle different phone number formats
    if (digits.length === 7) {
      // 7-digit local number - format as XXX-XXXX
      return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    } else if (digits.length === 10) {
      // 10-digit number - format as (XXX) XXX-XXXX
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    } else if (digits.length === 11 && digits[0] === "1") {
      // 11-digit number starting with 1 - format as (XXX) XXX-XXXX
      return `(${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
    }

    return null;
  };

  // Function to parse CSV content
  const parseCSV = (content) => {
    const lines = content.split("\n").filter((line) => line.trim());
    const recipients = [];

    // Skip header if it exists
    const startIndex =
      lines[0].toLowerCase().includes("name") ||
      lines[0].toLowerCase().includes("phone")
        ? 1
        : 0;

    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Split by comma - handle simple case first
      const commaIndex = line.indexOf(",");
      if (commaIndex > 0) {
        const name = line.substring(0, commaIndex).replace(/"/g, "").trim();
        const phone = line
          .substring(commaIndex + 1)
          .replace(/"/g, "")
          .trim();

        // Split name into first and last
        const nameParts = name.split(" ");
        const firstName = nameParts[0] || name; // Use full name as firstName if no spaces
        const lastName =
          nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";

        const formattedPhone = formatPhoneNumber(phone);

        recipients.push({
          originalName: name,
          firstName: firstName,
          lastName: lastName,
          originalPhone: phone,
          formattedPhone: formattedPhone,
          lineNumber: i + 1,
        });

        // Debug logging
        console.log(`Line ${i + 1}: "${line}"`);
        console.log(`  Name: "${name}", Phone: "${phone}"`);
        console.log(`  First: "${firstName}", Last: "${lastName}"`);
        console.log(`  Formatted Phone: "${formattedPhone}"`);
      }
    }

    return recipients;
  };

  // Handle file upload
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsProcessing(true);
    setError("");

    try {
      const content = await file.text();
      console.log("File content:", content);

      const parsed = parseCSV(content);
      console.log("Parsed recipients:", parsed);

      if (parsed.length === 0) {
        setError(
          "No valid recipients found in the file. Please check the format."
        );
        setIsProcessing(false);
        return;
      }

      setImportedData(parsed);

      // Separate valid and invalid recipients
      const existingPhones = new Set(existingRecipients.map((r) => r.value));
      const valid = [];
      const invalid = [];

      parsed.forEach((recipient) => {
        if (recipient.formattedPhone) {
          // Check for duplicates
          const isDuplicate = existingPhones.has(recipient.formattedPhone);

          const displayName = recipient.lastName
            ? `${recipient.firstName} ${recipient.lastName}`
            : recipient.firstName;

          const formattedRecipient = {
            value: recipient.formattedPhone,
            label: `${displayName} - ${recipient.formattedPhone}`,
            contactId: null,
            firstName: recipient.firstName,
            lastName: recipient.lastName,
            phone: recipient.formattedPhone,
            email: "",
            groups: [],
            ownerType: "imported",
            ownerId: null,
            isDuplicate,
          };

          console.log("Formatted recipient:", formattedRecipient);

          if (isDuplicate) {
            invalid.push({
              ...recipient,
              reason: "Already in recipient list",
              formatted: formattedRecipient,
            });
          } else {
            valid.push({
              ...recipient,
              formatted: formattedRecipient,
            });
          }
        } else {
          invalid.push({
            ...recipient,
            reason: "Invalid phone number format",
          });
        }
      });

      console.log("Valid recipients:", valid);
      console.log("Invalid recipients:", invalid);

      setValidRecipients(valid);
      setInvalidRecipients(invalid);
      setIsDialogOpen(true);
    } catch (err) {
      console.error("File parsing error:", err);
      setError("Error reading file. Please make sure it's a valid CSV file.");
    }

    setIsProcessing(false);
    // Reset file input
    event.target.value = "";
  };

  // Handle import confirmation
  const handleConfirmImport = () => {
    const recipientsToAdd = validRecipients.map((r) => r.formatted);
    console.log("Importing recipients:", recipientsToAdd);
    onImportRecipients(recipientsToAdd);
    setIsDialogOpen(false);
    resetState();
  };

  // Reset component state
  const resetState = () => {
    setImportedData([]);
    setValidRecipients([]);
    setInvalidRecipients([]);
    setError("");
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    resetState();
  };

  return (
    <Box>
      <Box sx={{ mb: 2 }}>
        <input
          accept=".csv,.txt"
          style={{ display: "none" }}
          id="csv-recipient-file-upload"
          type="file"
          onChange={handleFileUpload}
          disabled={isProcessing}
        />
        <label htmlFor="csv-recipient-file-upload">
          <Button
            variant="outlined"
            component="span"
            startIcon={
              isProcessing ? <CircularProgress size={20} /> : <Upload />
            }
            disabled={isProcessing}
            sx={{ mr: 1 }}
          >
            {isProcessing ? "Processing..." : "Import Recipients"}
          </Button>
        </label>
        <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
          Upload a CSV file with Name and Phone Number columns (supports 7, 10,
          or 11-digit numbers)
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Import Preview Dialog */}
      <Dialog
        open={isDialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Description />
            Import Recipients Preview
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Typography
              variant="h6"
              color="success.main"
              sx={{ display: "flex", alignItems: "center", gap: 1 }}
            >
              <Check /> Valid Recipients ({validRecipients.length})
            </Typography>
            {validRecipients.length > 0 ? (
              <List dense sx={{ maxHeight: 200, overflow: "auto" }}>
                {validRecipients.map((recipient, index) => {
                  const displayName = recipient.lastName
                    ? `${recipient.firstName} ${recipient.lastName}`
                    : recipient.firstName;

                  return (
                    <ListItem key={index}>
                      <ListItemText
                        primary={`${displayName} - ${recipient.formattedPhone}`}
                      />
                    </ListItem>
                  );
                })}
              </List>
            ) : (
              <Typography color="text.secondary">
                No valid recipients found
              </Typography>
            )}
          </Box>

          {invalidRecipients.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography
                variant="h6"
                color="warning.main"
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
              >
                <Warning /> Issues Found ({invalidRecipients.length})
              </Typography>
              <List dense sx={{ maxHeight: 200, overflow: "auto" }}>
                {invalidRecipients.slice(0, 5).map((recipient, index) => (
                  <ListItem key={index}>
                    <ListItemText
                      primary={`${recipient.originalName} - ${recipient.originalPhone}`}
                      secondary={
                        <Chip
                          label={recipient.reason}
                          size="small"
                          color="warning"
                          variant="outlined"
                        />
                      }
                    />
                  </ListItem>
                ))}
                {invalidRecipients.length > 5 && (
                  <ListItem>
                    <ListItemText
                      primary={`... and ${
                        invalidRecipients.length - 5
                      } more issues`}
                      sx={{ fontStyle: "italic" }}
                    />
                  </ListItem>
                )}
              </List>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleConfirmImport}
            variant="contained"
            disabled={validRecipients.length === 0}
            startIcon={<Check />}
          >
            Import {validRecipients.length} Recipients
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
