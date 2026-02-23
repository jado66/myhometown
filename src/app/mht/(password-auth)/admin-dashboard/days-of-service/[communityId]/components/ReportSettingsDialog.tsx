"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControlLabel,
  Switch,
  Checkbox,
  Typography,
  Divider,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormGroup,
  Tooltip,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import InfoIcon from "@mui/icons-material/Info";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { Security } from "@mui/icons-material";

// Define field categories and their fields
const FIELD_CATEGORIES = {
  propertyOwner: {
    label: "Property Owner Information",
    fields: [
      { id: "property_owner", label: "Owner Name", isPII: true },
      { id: "property_owner_2", label: "Secondary Owner", isPII: true },
      { id: "phone_number", label: "Phone Number", isPII: true },
      { id: "phone_number_2", label: "Secondary Phone", isPII: true },
      { id: "email", label: "Email", isPII: true },
      { id: "email_2", label: "Secondary Email", isPII: true },
      { id: "address_street1", label: "Street Address", isPII: true },
      { id: "address_street2", label: "Address Line 2", isPII: true },
      { id: "address_city", label: "City", isPII: false },
      { id: "address_state", label: "State", isPII: false },
      { id: "address_zip_code", label: "Zip Code", isPII: true },
    ],
  },
  projectCoordination: {
    label: "Project Coordination",
    fields: [
      {
        id: "project_development_couple",
        label: "Resource Couple",
        isPII: true,
      },
      {
        id: "project_development_couple_phone1",
        label: "Resource Phone 1",
        isPII: true,
      },
      {
        id: "project_development_couple_email1",
        label: "Resource Email 1",
        isPII: true,
      },
      {
        id: "project_development_couple_phone2",
        label: "Resource Phone 2",
        isPII: true,
      },
      {
        id: "project_development_couple_email2",
        label: "Resource Email 2",
        isPII: true,
      },
      { id: "host_name", label: "Host Name", isPII: true },
      { id: "host_phone", label: "Host Phone", isPII: true },
      { id: "host_email", label: "Host Email", isPII: true },
    ],
  },
  groupInfo: {
    label: "Group & Volunteer Info",
    fields: [
      { id: "partner_ward", label: "Partner Group", isPII: false },
      { id: "partner_ward_liaison", label: "Group Contact", isPII: true },
      {
        id: "partner_ward_liaison_phone1",
        label: "Contact Phone",
        isPII: true,
      },
      {
        id: "partner_ward_liaison_email1",
        label: "Contact Email",
        isPII: true,
      },
      { id: "volunteers_needed", label: "Volunteers Needed", isPII: false },
      { id: "actual_volunteers", label: "Actual Volunteers", isPII: false },
    ],
  },
  projectDetails: {
    label: "Project Details",
    fields: [
      { id: "project_name", label: "Project Name", isPII: false },
      { id: "work_summary", label: "Work Summary", isPII: false },
      { id: "tasks", label: "Tasks", isPII: false },
      { id: "project_duration", label: "Estimated Duration", isPII: false },
      { id: "actual_project_duration", label: "Actual Duration", isPII: false },
    ],
  },
  materialsEquipment: {
    label: "Materials & Equipment",
    fields: [
      { id: "equipment", label: "Equipment", isPII: false },
      { id: "volunteerTools", label: "Volunteer Tools", isPII: false },
      { id: "homeownerMaterials", label: "Homeowner Materials", isPII: false },
      { id: "otherMaterials", label: "Other Materials", isPII: false },
      { id: "is_dumpster_needed", label: "Dumpster Needed", isPII: false },
      {
        id: "is_second_dumpster_needed",
        label: "Second Dumpster",
        isPII: false,
      },
    ],
  },
  budget: {
    label: "Budget Information",
    fields: [
      { id: "budget_estimates", label: "Budget Estimates", isPII: false },
      {
        id: "homeowner_ability_estimates",
        label: "Homeowner Contribution",
        isPII: false,
      },
    ],
  },
};

// Define report types
const REPORT_TYPES = {
  SINGLE: "singleReport",
  SUMMARY: "summaryReport",
};

interface ReportSettingsDialogProps {
  open: boolean;
  onClose: () => void;
  onGenerate: (settings: ReportSettings) => void;
  reportType: "singleReport" | "summaryReport";
  projectId?: string;
}

export interface ReportSettings {
  includedFields: Record<string, boolean>;
  anonymizePII: boolean;
}

export function ReportSettingsDialog({
  open,
  onClose,
  onGenerate,
  reportType,
  projectId,
}: ReportSettingsDialogProps) {
  // Use different localStorage keys based on report type
  const storageKey = `reportSettings_${reportType}`;

  // Default settings - include all fields, don't anonymize
  const defaultSettings = {
    includedFields: Object.entries(FIELD_CATEGORIES).reduce(
      (acc, [category, { fields }]) => {
        fields.forEach((field) => {
          acc[field.id] = true;
        });
        return acc;
      },
      {} as Record<string, boolean>,
    ),
    anonymizePII: false,
  };

  // Load settings from localStorage
  const [savedSettings, setSavedSettings] = useLocalStorage(
    storageKey,
    defaultSettings,
  );

  // Local state for current dialog session
  const [settings, setSettings] = useState<ReportSettings>(savedSettings);

  // Update local state when saved settings change
  useEffect(() => {
    setSettings(savedSettings);
  }, [savedSettings]);

  // Handle toggling individual fields
  const handleFieldToggle = (fieldId: string) => {
    setSettings((prev) => ({
      ...prev,
      includedFields: {
        ...prev.includedFields,
        [fieldId]: !prev.includedFields[fieldId],
      },
    }));
  };

  // Handle toggling all fields in a category
  const handleCategoryToggle = (categoryFields: { id: string }[]) => {
    // Check if all fields in category are currently selected
    const allSelected = categoryFields.every(
      (field) => settings.includedFields[field.id],
    );

    // Toggle all fields in the category
    setSettings((prev) => {
      const newIncludedFields = { ...prev.includedFields };
      categoryFields.forEach((field) => {
        newIncludedFields[field.id] = !allSelected;
      });
      return {
        ...prev,
        includedFields: newIncludedFields,
      };
    });
  };

  // Handle toggling anonymize PII
  const handleAnonymizeToggle = () => {
    setSettings((prev) => ({
      ...prev,
      anonymizePII: !prev.anonymizePII,
      // turn off all PII fields if anonymize is toggled on
      includedFields: Object.entries(prev.includedFields).reduce(
        (acc, [fieldId, isIncluded]) => {
          acc[fieldId] =
            isIncluded &&
            !FIELD_CATEGORIES.projectCoordination.fields.some(
              (field) => field.id === fieldId,
            );
          return acc;
        },
        {} as Record<string, boolean>,
      ),
    }));
  };

  // Handle selecting all fields
  const handleSelectAll = () => {
    const newIncludedFields = { ...settings.includedFields };
    Object.values(FIELD_CATEGORIES).forEach((category) => {
      category.fields.forEach((field) => {
        newIncludedFields[field.id] = true;
      });
    });

    setSettings((prev) => ({
      ...prev,
      includedFields: newIncludedFields,
      anonymizePII: false, // Reset anonymize PII when selecting all fields
    }));
  };

  // Handle deselecting all fields
  const handleDeselectAll = () => {
    const newIncludedFields = { ...settings.includedFields };
    Object.values(FIELD_CATEGORIES).forEach((category) => {
      category.fields.forEach((field) => {
        newIncludedFields[field.id] = false;
      });
    });

    setSettings((prev) => ({
      ...prev,
      includedFields: newIncludedFields,
    }));
  };

  // Handle generating report with current settings
  const handleGenerate = () => {
    // Save settings to localStorage
    setSavedSettings(settings);
    // Call the onGenerate callback with current settings
    onGenerate(settings);
    // Close the dialog
    onClose();
  };

  // Check if all fields in a category are selected
  const isCategorySelected = (categoryFields: { id: string }[]) => {
    return categoryFields.every((field) => settings.includedFields[field.id]);
  };

  // Check if some (but not all) fields in a category are selected
  const isCategoryIndeterminate = (categoryFields: { id: string }[]) => {
    const selectedCount = categoryFields.filter(
      (field) => settings.includedFields[field.id],
    ).length;
    return selectedCount > 0 && selectedCount < categoryFields.length;
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      aria-labelledby="report-settings-dialog-title"
    >
      <DialogTitle id="report-settings-dialog-title">
        {reportType === REPORT_TYPES.SINGLE
          ? "Single Project Report Settings"
          : "Organization Summary Report Settings"}
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Customize which information to include in your report
          </Typography>

          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.anonymizePII}
                  onChange={handleAnonymizeToggle}
                  color="primary"
                />
              }
              label="Anonymize Personal Information"
            />
            <Tooltip title="When enabled, personal information like names, phone numbers, and addresses will be hidden or replaced with placeholders">
              <InfoIcon color="action" fontSize="small" sx={{ ml: 1 }} />
            </Tooltip>
          </Box>

          <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
            <Button variant="outlined" size="small" onClick={handleSelectAll}>
              Select All
            </Button>
            <Button variant="outlined" size="small" onClick={handleDeselectAll}>
              Deselect All
            </Button>
          </Box>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Field categories */}
        {Object.entries(FIELD_CATEGORIES).map(([categoryKey, category]) => (
          <Accordion key={categoryKey}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <FormControlLabel
                onClick={(e) => {
                  e.stopPropagation();
                  handleCategoryToggle(category.fields);
                }}
                onFocus={(e) => e.stopPropagation()}
                control={
                  <Checkbox
                    checked={isCategorySelected(category.fields)}
                    indeterminate={isCategoryIndeterminate(category.fields)}
                  />
                }
                label={
                  <Typography
                    variant="subtitle1"
                    sx={{ display: "flex", alignItems: "center" }}
                  >
                    {category.label}{" "}
                    {settings.anonymizePII &&
                      category.fields.some((field) => field.isPII) && (
                        <Tooltip title="Personal information is hidden">
                          <Security
                            color="action"
                            fontSize="small"
                            sx={{ ml: 1 }}
                          />
                        </Tooltip>
                      )}
                  </Typography>
                }
              />
            </AccordionSummary>
            <AccordionDetails>
              <FormGroup>
                {category.fields.map((field) => (
                  <FormControlLabel
                    key={field.id}
                    control={
                      <Checkbox
                        checked={
                          field.isPII && settings.anonymizePII
                            ? false
                            : settings.includedFields[field.id] || false
                        }
                        onChange={() => handleFieldToggle(field.id)}
                        disabled={settings.anonymizePII && field.isPII}
                      />
                    }
                    label={
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        {field.label}
                        {field.isPII && (
                          <Tooltip title="Contains personal information">
                            <Security
                              color="action"
                              fontSize="small"
                              sx={{ ml: 1 }}
                            />
                          </Tooltip>
                        )}
                      </Box>
                    }
                  />
                ))}
              </FormGroup>
            </AccordionDetails>
          </Accordion>
        ))}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button onClick={handleGenerate} variant="contained" color="primary">
          Generate Report
        </Button>
      </DialogActions>
    </Dialog>
  );
}
