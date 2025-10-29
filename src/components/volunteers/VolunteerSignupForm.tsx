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
  Stepper,
  Step,
  StepLabel,
  Box,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  Alert,
  LinearProgress,
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
const oldToNewCommunity = {
  "66a811814800d08c300d88fd": "a78e8c7c-eca4-4f13-b6c8-e5603d1c36da", // Orem - Geneva Heights

  "a6c19a50-7fc3-4759-b386-6ebdeca3ed9e":
    "a6c19a50-7fc3-4759-b386-6ebdeca3ed9e", // Orem - Sharon Park
  "66df56bef05bd41ef9493f33": "b3381b98-e44f-4f1f-b067-04e575c515ca", // Provo - Pioneer Park
  "66df56e6f05bd41ef9493f34": "7c446e80-323d-4268-b595-6945e915330f", // Provo - Dixon
  "66df5707f05bd41ef9493f35": "7c8731bc-1aee-406a-9847-7dc1e5255587", // Provo - South Freedom
  "66df577bf05bd41ef9493f37": "0806b0f4-9d56-4c1f-b976-ee04f60af194", // Ogden - North
  "66df5790f05bd41ef9493f38": "bf4a7d58-b880-4c18-b923-6c89e2597c71", // Ogden - South
  "66df57a2f05bd41ef9493f39": "0bdf52a4-2efa-465b-a3b1-5ec4d1701967", // Ogden - West
  "66df57b3f05bd41ef9493f3a": "995c1860-9d5b-472f-a206-1c2dd40947bd", // Salt Lake City - Central
  "66df57c2f05bd41ef9493f3b": "af0df8f5-dab7-47e4-aafc-9247fee6f29d", // Salt Lake City - Northwest
  "66df57d1f05bd41ef9493f3c": "5de22b0b-5dc8-4d72-b424-95b0d1c94fcc", // Salt Lake City - Westside
  "66df57e6f05bd41ef9493f3d": "252cd4b1-830c-4cdb-913f-a1460f218616", // West Valley City - Central Granger
  "6838adb32243dc8160ce207d": "7d059ebc-78ee-4b47-97ab-276ae480b8de", // Layton - Layton
  "66df57faf05bd41ef9493f3e": "4687e12e-497f-40a2-ab1b-ab455f250fce", // West Valley City - North East Granger
  "66df580bf05bd41ef9493f3f": "2bc57e19-0c73-4781-9fc6-ef26fc729847", // West Valley City - West Granger
  "66df581af05bd41ef9493f40": "0076ad61-e165-4cd0-b6af-f4a30af2510c", // West Valley City - Central Valley View
  "6876c09a2a087f662c17feed": "724b1aa6-0950-40ba-9453-cdd80085c5d4", // Santaquin - Santaquin
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

const STEPS = ["Personal Info", "Address", "Review"];

export function VolunteerSignupForm({
  communityId,
  communityName,
}: VolunteerSignupFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

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

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 0) {
      if (!formData.firstName.trim())
        newErrors.firstName = "First name is required";
      if (!formData.lastName.trim())
        newErrors.lastName = "Last name is required";
      if (!formData.email.trim()) newErrors.email = "Email is required";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
        newErrors.email = "Invalid email format";
      if (!formData.contactNumber.trim())
        newErrors.contactNumber = "Contact number is required";
    }

    if (step === 1) {
      if (!formData.streetAddress.trim())
        newErrors.streetAddress = "Street address is required";
      if (!formData.addressCity.trim())
        newErrors.addressCity = "City is required";
      if (!formData.addressState) newErrors.addressState = "State is required";
      if (!formData.zipCode.trim()) newErrors.zipCode = "Zip code is required";
      else if (!/^\d{5}$/.test(formData.zipCode))
        newErrors.zipCode = "Zip code must be 5 digits";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  };

  const handleFinalSubmit = async () => {
    if (!validateStep(currentStep)) return;
    setIsSubmitting(true);
    setSubmitError(null);

    // Convert new community ID to old community ID for database compatibility
    // @ts-expect-error -- TypeScript may not recognize all keys
    const oldCommunityId = oldToNewCommunity[communityId] || communityId;

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
    });
    setIsSubmitting(false);

    if (result.success) {
      setSubmitted(true);
    } else {
      // Handle duplicate email error specifically
      if (
        result.message.toLowerCase().includes("email") &&
        result.message.toLowerCase().includes("already")
      ) {
        // Set error on the email field and go back to step 1
        setErrors({
          email: "This email is already registered for volunteering",
        });
        setCurrentStep(0);
      }
      setSubmitError(result.message);
    }
  };

  const resetForm = () => {
    setSubmitted(false);
    setCurrentStep(0);
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      contactNumber: "",
      streetAddress: "",
      addressCity: "",
      addressState: "",
      zipCode: "",
    });
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
    <Box sx={{ maxWidth: 800, mx: "auto" }}>
      <Paper sx={{ p: 4, boxShadow: 0 }}>
        <Box sx={{ mb: 4, textAlign: "center" }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Volunteer Sign Up
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Join our community and make a difference in your city
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Stepper activeStep={currentStep} sx={{ mb: 2 }}>
            {STEPS.map((label, index) => (
              <Step key={label}>
                <StepLabel
                  StepIconComponent={() => {
                    const icons = [
                      <Person key="person" />,
                      <LocationOn key="location" />,
                      <CheckCircle key="check" />,
                    ];
                    return (
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          bgcolor:
                            index <= currentStep
                              ? "primary.main"
                              : "action.disabled",
                          color: "white",
                        }}
                      >
                        {icons[index]}
                      </Box>
                    );
                  }}
                >
                  {label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>
          <LinearProgress
            variant="determinate"
            value={((currentStep + 1) / STEPS.length) * 100}
            sx={{ height: 8, borderRadius: 1 }}
          />
        </Box>

        <form
          onSubmit={handleSubmit}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              if (currentStep < STEPS.length - 1) {
                if (validateStep(currentStep)) {
                  setCurrentStep((prev) =>
                    Math.min(prev + 1, STEPS.length - 1)
                  );
                }
              }
            }
          }}
        >
          {/* Step 1: Personal Information */}
          {currentStep === 0 && (
            <Box sx={{ mb: 4 }}>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}
              >
                <Person color="primary" />
                <Typography variant="h6" fontWeight="semibold">
                  Personal Information{communityName && ` - ${communityName}`}
                </Typography>
              </Box>

              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="First Name *"
                    value={formData.firstName}
                    onChange={(e) =>
                      updateFormData("firstName", e.target.value)
                    }
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

              <Grid container spacing={2}>
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
            </Box>
          )}

          {/* Step 2: Address Information */}
          {currentStep === 1 && (
            <Box sx={{ mb: 4 }}>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}
              >
                <LocationOn color="primary" />
                <Typography variant="h6" fontWeight="semibold">
                  Address Information
                </Typography>
              </Box>

              <TextField
                fullWidth
                label="Street Address *"
                value={formData.streetAddress}
                onChange={(e) =>
                  updateFormData("streetAddress", e.target.value)
                }
                error={!!errors.streetAddress}
                helperText={errors.streetAddress}
                placeholder="123 Main Street"
                sx={{ mb: 3 }}
              />

              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="City *"
                    value={formData.addressCity}
                    onChange={(e) =>
                      updateFormData("addressCity", e.target.value)
                    }
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
                      <Typography
                        variant="caption"
                        color="error"
                        sx={{ mt: 0.5 }}
                      >
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
            </Box>
          )}

          {/* Step 3: Review */}
          {currentStep === 2 && (
            <Box sx={{ mb: 4 }}>
              <Paper
                sx={{
                  p: 3,
                  background:
                    "linear-gradient(135deg, rgba(25, 118, 210, 0.05) 0%, rgba(25, 118, 210, 0.1) 100%)",
                  border: "2px solid",
                  borderColor: "primary.light",
                  borderRadius: 1,
                }}
              >
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}
                >
                  <CheckCircle color="primary" />
                  <Typography variant="h6" fontWeight="bold">
                    Review & Submit
                  </Typography>
                </Box>

                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={12} sm={4}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 0.5 }}
                    >
                      <strong>Name:</strong> {formData.firstName}{" "}
                      {formData.lastName}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 0.5 }}
                    >
                      <strong>Email:</strong> {formData.email}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={8}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 0.5 }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        <strong>Phone:</strong> {formData.contactNumber}
                      </Typography>
                      <strong>Address:</strong> {formData.streetAddress},{" "}
                      {formData.addressCity}, {formData.addressState}{" "}
                      {formData.zipCode}
                    </Typography>
                  </Grid>
                </Grid>

                <Typography
                  variant="caption"
                  color="text.secondary"
                  textAlign="center"
                  display="block"
                >
                  By submitting, you agree to be contacted about volunteer
                  opportunities.
                </Typography>
              </Paper>
            </Box>
          )}

          {/* Navigation Buttons */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              pt: 3,
              borderTop: "2px solid",
              borderColor: "divider",
            }}
          >
            <Button
              variant="outlined"
              onClick={handleBack}
              disabled={currentStep === 0}
              startIcon={<ChevronLeft />}
              sx={{ px: 3 }}
            >
              Back
            </Button>

            <Typography
              variant="body2"
              color="text.secondary"
              fontWeight="medium"
            >
              Step {currentStep + 1} of {STEPS.length}
            </Typography>

            {currentStep < STEPS.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleNext}
                endIcon={<ChevronRight />}
                sx={{ px: 3 }}
              >
                Next
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleFinalSubmit}
                disabled={isSubmitting}
                startIcon={
                  isSubmitting ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    <CheckCircle />
                  )
                }
                sx={{ px: 4 }}
              >
                {isSubmitting ? "Submitting..." : "Submit Application"}
              </Button>
            )}
          </Box>

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
