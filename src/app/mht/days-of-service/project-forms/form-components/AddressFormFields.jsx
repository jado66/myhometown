import React, { useState, useEffect } from "react";
import {
  Grid,
  TextField,
  Autocomplete,
  Box,
  Alert,
  Button,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useProjectForm } from "@/contexts/ProjectFormProvider";
import AddressSuggestionDialog from "./AddressSuggestionDialog";

const US_STATES = [
  { code: "AL", name: "Alabama" },
  { code: "AK", name: "Alaska" },
  { code: "AZ", name: "Arizona" },
  { code: "AR", name: "Arkansas" },
  { code: "CA", name: "California" },
  { code: "CO", name: "Colorado" },
  { code: "CT", name: "Connecticut" },
  { code: "DE", name: "Delaware" },
  { code: "FL", name: "Florida" },
  { code: "GA", name: "Georgia" },
  { code: "HI", name: "Hawaii" },
  { code: "ID", name: "Idaho" },
  { code: "IL", name: "Illinois" },
  { code: "IN", name: "Indiana" },
  { code: "IA", name: "Iowa" },
  { code: "KS", name: "Kansas" },
  { code: "KY", name: "Kentucky" },
  { code: "LA", name: "Louisiana" },
  { code: "ME", name: "Maine" },
  { code: "MD", name: "Maryland" },
  { code: "MA", name: "Massachusetts" },
  { code: "MI", name: "Michigan" },
  { code: "MN", name: "Minnesota" },
  { code: "MS", name: "Mississippi" },
  { code: "MO", name: "Missouri" },
  { code: "MT", name: "Montana" },
  { code: "NE", name: "Nebraska" },
  { code: "NV", name: "Nevada" },
  { code: "NH", name: "New Hampshire" },
  { code: "NJ", name: "New Jersey" },
  { code: "NM", name: "New Mexico" },
  { code: "NY", name: "New York" },
  { code: "NC", name: "North Carolina" },
  { code: "ND", name: "North Dakota" },
  { code: "OH", name: "Ohio" },
  { code: "OK", name: "Oklahoma" },
  { code: "OR", name: "Oregon" },
  { code: "PA", name: "Pennsylvania" },
  { code: "RI", name: "Rhode Island" },
  { code: "SC", name: "South Carolina" },
  { code: "SD", name: "South Dakota" },
  { code: "TN", name: "Tennessee" },
  { code: "TX", name: "Texas" },
  { code: "UT", name: "Utah" },
  { code: "VT", name: "Vermont" },
  { code: "VA", name: "Virginia" },
  { code: "WA", name: "Washington" },
  { code: "WV", name: "West Virginia" },
  { code: "WI", name: "Wisconsin" },
  { code: "WY", name: "Wyoming" },
].sort((a, b) => a.name.localeCompare(b.name));

const isValidZipCode = (zip) => {
  const cleanZip = zip.replace(/[^\d]/g, "");
  return cleanZip.length === 5 || cleanZip.length === 9;
};

const AddressFormFields = () => {
  const {
    formData,
    handleInputChange: contextHandleInputChange,
    addressValidation,
    setAddressValidation,
    handleAddressValidated,
  } = useProjectForm();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [suggestedAddress, setSuggestedAddress] = useState(null);
  const [isAddressAccepted, setIsAddressAccepted] = useState(false);
  const [keepOriginal, setKeepOriginal] = useState(false);

  // Find the current state object from US_STATES
  const currentState = formData.addressState
    ? US_STATES.find((state) => state.code === formData.addressState)
    : null;

  const handleInputChange = (field, value) => {
    // Reset validation states when any address field changes
    if (field.startsWith("address")) {
      setIsAddressAccepted(false);
      setKeepOriginal(false);
      setSuggestedAddress(null);
      contextHandleInputChange("isAddressVerified", false);
      setAddressValidation((prev) => ({
        ...prev,
        isValid: false,
        isChecking: false,
        errors: {},
      }));
    }

    // Handle ZIP code formatting and validation
    if (field === "addressZipCode") {
      const cleanZip = value.replace(/[^\d]/g, "").slice(0, 9);
      const formattedZip =
        cleanZip.length > 5
          ? `${cleanZip.slice(0, 5)}-${cleanZip.slice(5)}`
          : cleanZip;

      // Add immediate validation for ZIP code
      if (
        cleanZip.length > 0 &&
        cleanZip.length !== 5 &&
        cleanZip.length !== 9
      ) {
        setAddressValidation((prev) => ({
          ...prev,
          errors: {
            ...prev.errors,
            zipCode:
              "Please enter a valid 5-digit ZIP code or 9-digit ZIP+4 code",
          },
        }));
      }

      contextHandleInputChange(field, formattedZip);
    } else {
      contextHandleInputChange(field, value);
    }
  };

  const handleSuggestionAccept = (address) => {
    handleAddressValidated({ ...address, isAddressVerified: true });
    setIsAddressAccepted(true);
    setKeepOriginal(false);
    setDialogOpen(false);
    setAddressValidation((prev) => ({
      ...prev,
      isValid: true,
      errors: {},
    }));
  };

  const handleKeepOriginal = () => {
    setKeepOriginal(true);
    setDialogOpen(false);
    setAddressValidation((prev) => ({
      ...prev,
      isValid: false,
      isChecking: false,
    }));
  };

  const handleRecheckAddress = () => {
    setIsAddressAccepted(false);
    setKeepOriginal(false);
    contextHandleInputChange("isAddressVerified", false);
    validateAddress();
  };

  const validateAddress = async () => {
    // Reset suggested address when validating
    setSuggestedAddress(null);

    // Validate ZIP code format first
    if (!isValidZipCode(formData.addressZipCode)) {
      setAddressValidation({
        isChecking: false,
        isValid: false,
        errors: {
          zipCode:
            "Please enter a valid 5-digit ZIP code or 9-digit ZIP+4 code",
        },
      });
      return;
    }

    // Skip validation if required fields are missing
    if (
      !formData.addressStreet1 ||
      !formData.addressCity ||
      !formData.addressState ||
      !formData.addressZipCode
    ) {
      return;
    }

    setAddressValidation((prev) => ({ ...prev, isChecking: true }));

    try {
      const response = await fetch("/api/validate-address", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address: {
            street1: formData.addressStreet1,
            street2: formData.addressStreet2,
            city: formData.addressCity,
            state: formData.addressState,
            zipCode: formData.addressZipCode,
          },
        }),
      });

      const data = await response.json();

      if (response.ok && data.valid) {
        if (data.standardized) {
          // Address needs standardization - show dialog
          setSuggestedAddress(data.standardized);
          setDialogOpen(true);
          setAddressValidation({
            isChecking: false,
            errors: {},
            isValid: false, // Keep as false until explicitly verified
          });
        } else {
          // Address is already in correct format - mark as verified
          setIsAddressAccepted(true);
          setKeepOriginal(false);
          contextHandleInputChange("isAddressVerified", true);
          setAddressValidation({
            isChecking: false,
            errors: {},
            isValid: true,
          });
        }
      } else {
        setAddressValidation({
          isChecking: false,
          errors: {
            general: data.error,
          },
          isValid: false,
        });
      }
    } catch (err) {
      console.error("Validation error:", err);
      setAddressValidation({
        isChecking: false,
        errors: {
          general:
            "Unable to verify address. Please check your input and try again.",
        },
        isValid: false,
      });
    }
  };

  useEffect(() => {
    // Skip validation if address is already verified
    if (!formData.isAddressVerified && !isAddressAccepted && !keepOriginal) {
      const debounceTimeout = setTimeout(validateAddress, 500);
      return () => clearTimeout(debounceTimeout);
    }
  }, [
    formData.addressStreet1,
    formData.addressStreet2,
    formData.addressCity,
    formData.addressState,
    formData.addressZipCode,
    formData.isAddressVerified,
    isAddressAccepted,
    keepOriginal,
  ]);

  const renderAddressAlert = () => {
    if (addressValidation.isChecking) {
      return <Alert severity="info">Verifying address...</Alert>;
    }

    if (addressValidation.errors.zipCode) {
      return <Alert severity="error">{addressValidation.errors.zipCode}</Alert>;
    }

    if (addressValidation.errors.general) {
      return (
        <Alert
          severity="error"
          action={
            <Button
              color="inherit"
              size="small"
              startIcon={<RefreshIcon />}
              onClick={handleRecheckAddress}
            >
              Retry
            </Button>
          }
        >
          {addressValidation.errors.general}
        </Alert>
      );
    }

    if (formData.isAddressVerified && addressValidation.isValid) {
      return <Alert severity="success">Address verified with USPS</Alert>;
    }

    // Show warning for any unverified address (including valid but unconfirmed addresses)
    if (!formData.isAddressVerified && formData.addressStreet1) {
      return (
        <Alert
          severity="warning"
          action={
            <Button
              color="inherit"
              size="small"
              startIcon={<RefreshIcon />}
              onClick={handleRecheckAddress}
            >
              Recheck Address
            </Button>
          }
        >
          This address has not been verified with USPS
        </Alert>
      );
    }

    return null;
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            label="Street Address"
            required
            fullWidth
            value={formData.addressStreet1}
            onChange={(e) =>
              handleInputChange("addressStreet1", e.target.value)
            }
            error={!!addressValidation.errors.street1}
            helperText={addressValidation.errors.street1}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            label="Apartment, suite, etc. (optional)"
            fullWidth
            value={formData.addressStreet2}
            onChange={(e) =>
              handleInputChange("addressStreet2", e.target.value)
            }
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            label="City"
            required
            fullWidth
            value={formData.addressCity}
            onChange={(e) => handleInputChange("addressCity", e.target.value)}
            error={!!addressValidation.errors.city}
            helperText={addressValidation.errors.city}
          />
        </Grid>

        <Grid item xs={6} sm={3}>
          <Autocomplete
            options={US_STATES}
            getOptionLabel={(option) => option.name}
            value={currentState}
            onChange={(event, newValue) => {
              handleInputChange(
                "addressState",
                newValue ? newValue.code : null
              );
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="State"
                required
                error={!!addressValidation.errors.state}
                helperText={addressValidation.errors.state}
              />
            )}
          />
        </Grid>

        <Grid item xs={6} sm={3}>
          <TextField
            label="ZIP Code"
            required
            fullWidth
            value={formData.addressZipCode}
            onChange={(e) =>
              handleInputChange("addressZipCode", e.target.value)
            }
            error={!!addressValidation.errors.zipCode}
            helperText={addressValidation.errors.zipCode}
            inputProps={{ maxLength: 10 }}
          />
        </Grid>
      </Grid>

      {renderAddressAlert()}

      <AddressSuggestionDialog
        open={dialogOpen}
        onClose={handleKeepOriginal}
        currentAddress={formData}
        suggestedAddress={suggestedAddress}
        onAccept={handleSuggestionAccept}
      />
    </Box>
  );
};

export default AddressFormFields;
