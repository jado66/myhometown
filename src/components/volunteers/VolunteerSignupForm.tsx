"use client";

import type React from "react";
import { useState, useEffect } from "react";
import {
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  Alert,
  Checkbox,
  FormControlLabel,
  Divider,
} from "@mui/material";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Person,
  LocationOn,
  Error as ErrorIcon,
} from "@mui/icons-material";
import { supabase } from "@/util/supabase";
import { submitVolunteerSignup } from "@/util/volunteers/volunteer-signup";

// Community ID mapping from new to old format
const newToOldCommunity = {
  "a78e8c7c-eca4-4f13-b6c8-e5603d1c36da": "66a811814800d08c300d88fd", // Orem - Geneva Heights
  "a6c19a50-7fc3-4759-b386-6ebdeca3ed9e":
    "fb34e335-5cc6-4e6c-b5fc-2b64588fe921", // Orem - Sharon Park
  "b3381b98-e44f-4f1f-b067-04e575c515ca": "66df56bef05bd41ef9493f33", // Provo - Pioneer Park
  "7c446e80-323d-4268-b595-6945e915330f": "66df56e6f05bd41ef9493f34", // Provo - Dixon
  "7c8731bc-1aee-406a-9847-7dc1e5255587": "66df5707f05bd41ef9493f35", // Provo - South Freedom
  "0806b0f4-9d56-4c1f-b976-ee04f60af194": "66df577bf05bd41ef9493f37", // Ogden - North
  "bf4a7d58-b880-4c18-b923-6c89e2597c71": "66df5790f05bd41ef9493f38", // Ogden - South
  "0bdf52a4-2efa-465b-a3b1-5ec4d1701967": "66df57a2f05bd41ef9493f39", // Ogden - West
  "995c1860-9d5b-472f-a206-1c2dd40947bd": "66df57b3f05bd41ef9493f3a", // Salt Lake City - Central
  "af0df8f5-dab7-47e4-aafc-9247fee6f29d": "66df57c2f05bd41ef9493f3b", // Salt Lake City - Northwest
  "5de22b0b-5dc8-4d72-b424-95b0d1c94fcc": "66df57d1f05bd41ef9493f3c", // Salt Lake City - Westside
  "252cd4b1-830c-4cdb-913f-a1460f218616": "66df57e6f05bd41ef9493f3d", // West Valley City - Central Granger
  "7d059ebc-78ee-4b47-97ab-276ae480b8de": "6838adb32243dc8160ce207d", // Layton - Layton
  "4687e12e-497f-40a2-ab1b-ab455f250fce": "66df57faf05bd41ef9493f3e", // West Valley City - North East Granger
  "2bc57e19-0c73-4781-9fc6-ef26fc729847": "66df580bf05bd41ef9493f3f", // West Valley City - West Granger
  "0076ad61-e165-4cd0-b6af-f4a30af2510c": "66df581af05bd41ef9493f40", // West Valley City - Central Valley View
  "724b1aa6-0950-40ba-9453-cdd80085c5d4": "6876c09a2a087f662c17feed", // Santaquin - Santaquin
  "dcf35fbc-8053-40fa-b4a4-faaa61e2fbef": "6912655528c9b9c20ee4dede",
};

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  contactNumber: string;
  streetAddress: string;
  addressCity: string;
  addressState: string;
  zipCode: string;
}

interface VolunteerSignupFormProps {
  communityId: string;
  communityName?: string;
}

export function VolunteerSignupForm({
  communityId,
  communityName,
}: VolunteerSignupFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [wasReferred, setWasReferred] = useState(false);
  const [referrerName, setReferrerName] = useState("");

  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    contactNumber: "",
    streetAddress: "",
    addressCity: "",
    addressState: "UT",
    zipCode: "",
  });

  const updateFormData = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.firstName.trim())
      newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = "Invalid email format";
    if (!formData.contactNumber.trim())
      newErrors.contactNumber = "Contact number is required";
    if (!formData.streetAddress.trim())
      newErrors.streetAddress = "Street address is required";
    if (!formData.addressCity.trim())
      newErrors.addressCity = "City is required";
    if (!formData.addressState) newErrors.addressState = "State is required";
    if (!formData.zipCode.trim()) newErrors.zipCode = "Zip code is required";
    else if (!/^\d{5}$/.test(formData.zipCode))
      newErrors.zipCode = "Zip code must be 5 digits";
    if (wasReferred && !referrerName.trim())
      newErrors.referrerName =
        "Please enter the name of the person who referred you";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    setSubmitError(null);
    const oldCommunityId =
      newToOldCommunity[communityId as keyof typeof newToOldCommunity] ||
      communityId;
    const result = await submitVolunteerSignup({
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      contactNumber: formData.contactNumber,
      streetAddress: formData.streetAddress,
      addressCity: formData.addressCity,
      addressState: formData.addressState,
      zipCode: formData.zipCode,
      volunteeringCityId: oldCommunityId,
      referralSource: wasReferred ? referrerName : null,
    });
    setIsSubmitting(false);
    if (result.success) {
      setSubmitted(true);
    } else {
      if (
        result.message.toLowerCase().includes("email") &&
        result.message.toLowerCase().includes("already")
      ) {
        setErrors({
          email: "This email is already registered for volunteering",
        });
      }
      setSubmitError(result.message);
    }
  };

  const resetForm = () => {
    setSubmitted(false);
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      contactNumber: "",
      streetAddress: "",
      addressCity: "",
      addressState: "UT",
      zipCode: "",
    });
    setWasReferred(false);
    setReferrerName("");
    setErrors({});
    setSubmitError(null);
  };

  if (submitted) {
    return (
      <Box sx={{ textAlign: "center", py: 8 }}>
        <Box
          sx={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            bgcolor: "primary.light",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mx: "auto",
            mb: 3,
          }}
        >
          <CheckCircle sx={{ fontSize: 40, color: "white" }} />
        </Box>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Thank You for Signing Up!
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ maxWidth: 500, mx: "auto", mb: 4 }}
        >
          We&apos;ve received your volunteer application and will be in touch
          soon with next steps.
        </Typography>
        <Button variant="outlined" onClick={resetForm}>
          Submit Another Application
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 600, mx: "auto" }}>
      <Paper sx={{ p: 4, boxShadow: 0 }}>
        <Box sx={{ mb: 4, textAlign: "center" }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Volunteer Sign Up
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Join our community and make a difference in your city
          </Typography>
        </Box>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="First Name *"
                value={formData.firstName}
                onChange={(e) => updateFormData("firstName", e.target.value)}
                error={!!errors.firstName}
                helperText={errors.firstName}
                placeholder="John"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Last Name *"
                value={formData.lastName}
                onChange={(e) => updateFormData("lastName", e.target.value)}
                error={!!errors.lastName}
                helperText={errors.lastName}
                placeholder="Doe"
              />
            </Grid>
          </Grid>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email Address *"
                name="email"
                type="email"
                value={formData.email}
                onChange={(e) => updateFormData("email", e.target.value)}
                error={!!errors.email}
                helperText={errors.email}
                placeholder="john.doe@example.com"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Contact Number *"
                type="tel"
                value={formData.contactNumber}
                onChange={(e) =>
                  updateFormData("contactNumber", e.target.value)
                }
                error={!!errors.contactNumber}
                helperText={errors.contactNumber}
                placeholder="(555) 123-4567"
              />
            </Grid>
          </Grid>
          <FormControlLabel
            control={
              <Checkbox
                checked={wasReferred}
                onChange={(e) => setWasReferred(e.target.checked)}
                color="primary"
              />
            }
            label="Check this box if someone referred you to us."
          />
          {wasReferred && (
            <TextField
              fullWidth
              label="Name of person who referred you *"
              value={referrerName}
              onChange={(e) => setReferrerName(e.target.value)}
              error={!!errors.referrerName}
              helperText={errors.referrerName}
              placeholder="Jane Doe"
            />
          )}

          <Divider sx={{ my: 3 }} />
          <TextField
            fullWidth
            label="Street Address *"
            value={formData.streetAddress}
            onChange={(e) => updateFormData("streetAddress", e.target.value)}
            error={!!errors.streetAddress}
            helperText={errors.streetAddress}
            placeholder="123 Main Street"
            sx={{ mb: 2 }}
          />
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="City *"
                value={formData.addressCity}
                onChange={(e) => updateFormData("addressCity", e.target.value)}
                error={!!errors.addressCity}
                helperText={errors.addressCity}
                placeholder="Salt Lake City"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth error={!!errors.addressState}>
                <InputLabel>State *</InputLabel>
                <Select
                  value={formData.addressState}
                  onChange={(e) =>
                    updateFormData("addressState", e.target.value)
                  }
                  defaultValue="UT"
                  disabled
                  label="State *"
                >
                  <MenuItem value="UT">Utah</MenuItem>
                </Select>
                {errors.addressState && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                    {errors.addressState}
                  </Typography>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Zip Code *"
                value={formData.zipCode}
                onChange={(e) => updateFormData("zipCode", e.target.value)}
                error={!!errors.zipCode}
                helperText={errors.zipCode}
                placeholder="84101"
                inputProps={{ maxLength: 5 }}
              />
            </Grid>
          </Grid>
          <Divider sx={{ my: 3 }} />

          <Button
            variant="contained"
            type="submit"
            disabled={isSubmitting}
            startIcon={
              isSubmitting ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <CheckCircle />
              )
            }
            sx={{ px: 4 }}
            fullWidth
          >
            {isSubmitting ? "Submitting..." : "Submit Application"}
          </Button>
          <Typography
            variant="caption"
            color="text.secondary"
            display="block"
            sx={{ mb: 2 }}
          >
            By submitting, you agree to be contacted about volunteer
            opportunities.
          </Typography>
          {submitError && (
            <Alert severity="error" icon={<ErrorIcon />} sx={{ mt: 2 }}>
              {submitError}
            </Alert>
          )}
        </form>
      </Paper>
    </Box>
  );
}
