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
  if (!zip) {
    return false;
  }

  const cleanZip = zip.replace(/[^\d]/g, "");
  return cleanZip.length === 5 || cleanZip.length === 9;
};

const toCamelCase = (str) => {
  return str.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());
};

const snakeToCamelCase = (obj) => {
  if (!obj || typeof obj !== "object") return obj;
  return Object.keys(obj).reduce((acc, key) => {
    const camelKey = toCamelCase(key);
    acc[camelKey] = obj[key];
    return acc;
  }, {});
};

const AddressFormFields = () => {
  const {
    formData,
    handleInputChange: contextHandleInputChange,
    addressValidation,
    setAddressValidation,
    handleAddressValidated,
    isLocked,
  } = useProjectForm();

  const mapToCamelCase = (data) => ({
    addressStreet1: data.address_street1 || "",
    addressStreet2: data.address_street2 || "",
    addressCity: data.address_city || "",
    addressState: data.address_state || "",
    addressZipCode: data.address_zip_code || "",
    isAddressVerified: data.is_address_verified || false,
  });

  const mappedFormData = mapToCamelCase(formData);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [suggestedAddress, setSuggestedAddress] = useState(null);
  const [isAddressAccepted, setIsAddressAccepted] = useState(false);
  const [keepOriginal, setKeepOriginal] = useState(false);

  // Find the current state object from US_STATES
  const currentState = formData.addressState
    ? US_STATES.find((state) => state.code === formData.addressState)
    : null;

  const handleInputChange = (field, value) => {
    // Convert back to snake_case when updating formData
    const snakeField = field.replace(/([A-Z])/g, "_$1").toLowerCase();
    if (field.startsWith("address")) {
      setIsAddressAccepted(false);
      setKeepOriginal(false);
      setSuggestedAddress(null);
      contextHandleInputChange("is_address_verified", false);
      setAddressValidation((prev) => ({
        ...prev,
        isValid: false,
        isChecking: false,
        errors: {},
      }));
    }

    if (field === "addressZipCode") {
      const cleanZip = value.replace(/[^\d]/g, "").slice(0, 9);
      const formattedZip =
        cleanZip.length > 5
          ? `${cleanZip.slice(0, 5)}-${cleanZip.slice(5)}`
          : cleanZip;

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

      contextHandleInputChange("address_zip_code", formattedZip);
    } else {
      contextHandleInputChange(snakeField, value);
    }
  };

  const handleSuggestionAccept = (address) => {
    handleAddressValidated({ ...address, is_address_verified: true });
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
    contextHandleInputChange("is_address_verified", false);
    validateAddress();
  };

  const validateAddress = async () => {
    setSuggestedAddress(null);

    if (!isValidZipCode(formData.address_zip_code)) {
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

    if (
      !formData.address_street1 ||
      !formData.address_city ||
      !formData.address_state ||
      !formData.address_zip_code
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
            street1: formData.address_street1,
            street2: formData.address_street2,
            city: formData.address_city,
            state: formData.address_state,
            zipCode: formData.address_zip_code,
          },
        }),
      });

      const data = await response.json();

      if (response.ok && data.valid) {
        if (data.standardized) {
          // Convert snake_case to camelCase
          const standardizedCamelCase = snakeToCamelCase(data.standardized);
          setSuggestedAddress(standardizedCamelCase);
          setDialogOpen(true);
          setAddressValidation({
            isChecking: false,
            errors: {},
            isValid: false,
          });
        } else {
          setIsAddressAccepted(true);
          setKeepOriginal(false);
          contextHandleInputChange("is_address_verified", true);
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
    if (!formData.is_address_verified && !isAddressAccepted && !keepOriginal) {
      const debounceTimeout = setTimeout(validateAddress, 500);
      return () => clearTimeout(debounceTimeout);
    }
  }, [
    formData.address_street1,
    formData.address_street2,
    formData.address_city,
    formData.address_state,
    formData.address_zip_code,
    formData.is_address_verified,
    isAddressAccepted,
    keepOriginal,
  ]);

  const renderAddressAlert = () => {
    if (isLocked) {
      return null;
    }

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

    if (formData.is_address_verified && addressValidation.isValid) {
      return <Alert severity="success">This is a verified address</Alert>;
    }

    // Show warning for any unverified address (including valid but unconfirmed addresses)
    if (!formData.is_address_verified && formData.address_street1) {
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
          This address has not been verified
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
            value={mappedFormData.addressStreet1}
            onChange={(e) =>
              handleInputChange("addressStreet1", e.target.value)
            }
            error={!!addressValidation.errors.street1}
            helperText={addressValidation.errors.street1}
            disabled={isLocked}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            label="Apartment, suite, etc. (optional)"
            fullWidth
            value={mappedFormData.addressStreet2}
            onChange={(e) =>
              handleInputChange("addressStreet2", e.target.value)
            }
            disabled={isLocked}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            label="City"
            required
            fullWidth
            value={mappedFormData.addressCity}
            onChange={(e) => handleInputChange("addressCity", e.target.value)}
            error={!!addressValidation.errors.city}
            helperText={addressValidation.errors.city}
            disabled={isLocked}
          />
        </Grid>

        <Grid item xs={6} sm={3}>
          <Autocomplete
            options={US_STATES}
            getOptionLabel={(option) => option.name}
            value={
              US_STATES.find(
                (state) => state.code === mappedFormData.addressState
              ) || null
            }
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
                disabled={isLocked}
              />
            )}
            disabled={isLocked}
          />
        </Grid>

        <Grid item xs={6} sm={3}>
          <TextField
            label="ZIP Code"
            required
            fullWidth
            value={mappedFormData.addressZipCode}
            onChange={(e) =>
              handleInputChange("addressZipCode", e.target.value)
            }
            error={!!addressValidation.errors.zipCode}
            inputProps={{ maxLength: 10 }}
            disabled={isLocked}
          />
        </Grid>
      </Grid>

      {renderAddressAlert()}

      <AddressSuggestionDialog
        open={dialogOpen}
        onClose={handleKeepOriginal}
        currentAddress={mappedFormData}
        suggestedAddress={suggestedAddress}
        onAccept={handleSuggestionAccept}
      />
    </Box>
  );
};

export default AddressFormFields;
