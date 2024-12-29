import React, { useState, useEffect } from "react";
import {
  Grid,
  TextField,
  Autocomplete,
  InputAdornment,
  CircularProgress,
  Typography,
  Alert,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import { useProjectForm } from "@/contexts/ProjectFormProvider";

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

const AddressFormFields = () => {
  const {
    formData,
    handleInputChange,
    addressValidation,
    setAddressValidation,
    handleAddressValidated,
  } = useProjectForm();

  // Find the current state object from US_STATES
  const currentState = formData.addressState
    ? US_STATES.find((state) => state.code === formData.addressState)
    : null;

  useEffect(() => {
    const validateAddress = async () => {
      // Skip validation if required fields are missing
      if (
        !formData.addressStreet1 ||
        !formData.addressCity ||
        !formData.addressState ||
        !formData.addressZipCode
      ) {
        setAddressValidation({
          isValid: false,
          isChecking: false,
          errors: {},
        });
        return;
      }

      setAddressValidation((prev) => ({ ...prev, isChecking: true }));

      try {
        console.log("Validating address:", formData); // Debug log

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
        console.log("Validation response:", data); // Debug log

        if (response.ok && data.valid) {
          setAddressValidation({
            isChecking: false,
            errors: {},
            isValid: true,
          });

          if (data.standardized) {
            handleAddressValidated(data.standardized);
          } else {
            handleAddressValidated({
              addressStreet1: formData.addressStreet1,
              addressStreet2: formData.addressStreet2,
              addressCity: formData.addressCity,
              addressState: formData.addressState,
              addressZipCode: formData.addressZipCode,
            });
          }
        } else {
          setAddressValidation({
            isChecking: false,
            errors: {
              general: data.error,
              suggestions: data.suggestions || [],
            },
            isValid: false,
          });
        }
      } catch (err) {
        console.error("Validation error:", err); // Debug log
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

    const debounceTimeout = setTimeout(validateAddress, 500);
    return () => clearTimeout(debounceTimeout);
  }, [
    formData.addressStreet1,
    formData.addressStreet2,
    formData.addressCity,
    formData.addressState,
    formData.addressZipCode,
  ]);

  return (
    <Grid container spacing={2}>
      {addressValidation.errors.general && (
        <Grid item xs={12}>
          <Alert severity="error">{addressValidation.errors.general}</Alert>
        </Grid>
      )}

      {addressValidation.errors.suggestions?.length > 0 && (
        <Grid item xs={12}>
          <Alert severity="info">
            <Typography variant="subtitle2">Did you mean:</Typography>
            {addressValidation.errors.suggestions.map((suggestion, index) => (
              <Typography
                key={index}
                variant="body2"
                sx={{
                  cursor: "pointer",
                  "&:hover": { textDecoration: "underline" },
                }}
                onClick={() => handleAddressValidated(suggestion)}
              >
                {suggestion.addressStreet1}, {suggestion.addressCity},{" "}
                {suggestion.addressState} {suggestion.addressZipCode}
              </Typography>
            ))}
          </Alert>
        </Grid>
      )}

      <Grid item xs={12}>
        <TextField
          label="Street Address"
          required
          fullWidth
          value={formData.addressStreet1}
          onChange={(e) => handleInputChange("addressStreet1", e.target.value)}
          error={!!addressValidation.errors.street1}
          helperText={addressValidation.errors.street1}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                {addressValidation.isChecking ? (
                  <CircularProgress size={20} />
                ) : addressValidation.isValid ? (
                  <CheckCircleIcon color="success" />
                ) : addressValidation.errors.general ? (
                  <ErrorIcon color="error" />
                ) : null}
              </InputAdornment>
            ),
          }}
        />
      </Grid>

      <Grid item xs={12}>
        <TextField
          label="Apartment, suite, etc. (optional)"
          fullWidth
          value={formData.addressStreet2}
          onChange={(e) => handleInputChange("addressStreet2", e.target.value)}
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
            handleInputChange("addressState", newValue ? newValue.code : null);
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
          onChange={(e) => handleInputChange("addressZipCode", e.target.value)}
          error={!!addressValidation.errors.zipCode}
          helperText={addressValidation.errors.zipCode}
          inputProps={{ maxLength: 5 }}
        />
      </Grid>
    </Grid>
  );
};

export default AddressFormFields;
