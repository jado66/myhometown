import React from "react";
import {
  Card,
  CardContent,
  Box,
  Typography,
  Divider,
  Grid,
  TextField,
  Button,
  Avatar,
  CircularProgress,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { Help } from "@mui/icons-material";
import { parsePhoneNumber, isValidPhoneNumber } from "libphonenumber-js";

// Validate phone number using libphonenumber-js
const validatePhoneNumber = (phoneNumber: string): string | null => {
  if (!phoneNumber) return "Phone number is required";

  // Validate format and region (default to US)
  if (!isValidPhoneNumber(phoneNumber, "US")) {
    return "Please enter a valid phone number";
  }

  try {
    const parsed = parsePhoneNumber(phoneNumber, "US");
    if (!parsed) {
      return "Please enter a valid phone number";
    }

    // Only allow +1 numbers
    if (parsed.countryCallingCode !== "1") {
      return "Only +1 numbers are allowed";
    }

    const nationalNumber = parsed.nationalNumber.toString();
    const areaCode = nationalNumber.substring(0, 3);

    // Reject specific number
    if (nationalNumber === "2345678901") {
      return "Please enter a valid phone number";
    }

    // Reject toll-free numbers (833, 844, 855, 866, 877, 888, 800)
    const tollFreeAreaCodes = ["800", "833", "844", "855", "866", "877", "888"];
    if (tollFreeAreaCodes.includes(areaCode)) {
      return "Toll-free numbers are not allowed";
    }

    // Reject special service numbers (411, 511, 611, 711, 911)
    const specialServiceNumbers = ["411", "511", "611", "711", "911"];
    if (specialServiceNumbers.includes(areaCode)) {
      return "Special service numbers are not allowed";
    }

    // Reject non-mainland US area codes (Canadian, Caribbean, US Territories)
    const nonDomesticAreaCodes = [
      // Canadian area codes
      "368",
      "403",
      "587",
      "780",
      "825", // Alberta
      "236",
      "250",
      "257",
      "604",
      "672",
      "778", // British Columbia
      "204",
      "431",
      "584", // Manitoba
      "428",
      "506", // New Brunswick
      "709",
      "879", // Newfoundland and Labrador
      "867", // Northwest Territories/Nunavut/Yukon
      "782",
      "902", // Nova Scotia/Prince Edward Island
      "226",
      "249",
      "289",
      "343",
      "365",
      "382",
      "416",
      "437",
      "519",
      "548",
      "613",
      "647",
      "683",
      "705",
      "742",
      "753",
      "807",
      "905",
      "942", // Ontario
      "263",
      "354",
      "367",
      "418",
      "438",
      "450",
      "468",
      "514",
      "579",
      "581",
      "819",
      "873", // Quebec
      "306",
      "474",
      "639", // Saskatchewan
      // Caribbean and Atlantic area codes
      "264", // Anguilla
      "268", // Antigua and Barbuda
      "242", // Bahamas
      "246", // Barbados
      "441", // Bermuda
      "284", // British Virgin Islands
      "345", // Cayman Islands
      "658", // Jamaica (overlay)
      "649", // Turks and Caicos
      "658", // Jamaica
      "664", // Montserrat
      "721", // Sint Maarten
      "758", // Saint Lucia
      "767", // Dominica
      "784", // Saint Vincent and the Grenadines
      "809", // Dominican Republic
      "829", // Dominican Republic (overlay)
      "849", // Dominican Republic (overlay)
      "868", // Trinidad and Tobago
      "869", // Saint Kitts and Nevis
      "876", // Jamaica
      // US Territory area codes
      "340", // U.S. Virgin Islands
      "670", // Northern Mariana Islands
      "671", // Guam
      "684", // American Samoa
      "787", // Puerto Rico
      "939", // Puerto Rico (overlay)
    ];
    if (nonDomesticAreaCodes.includes(areaCode)) {
      return "International numbers are not allowed";
    }

    return null;
  } catch {
    return "Please enter a valid phone number";
  }
};

interface MissionaryPersonalInfoSectionProps {
  formData: any;
  setFormData: (fn: (prev: any) => any) => void;
  uploadLoading: boolean;
  handleFileSelectForCrop: (event: React.ChangeEvent<HTMLInputElement>) => void;
  errors?: { [key: string]: string };
}

const MissionaryPersonalInfoSection: React.FC<
  MissionaryPersonalInfoSectionProps
> = ({
  formData,
  setFormData,
  uploadLoading,
  handleFileSelectForCrop,
  errors = {},
}) => (
  <Card variant="outlined" sx={{ mb: 3 }}>
    <CardContent sx={{ p: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <PersonIcon sx={{ mr: 1, color: "primary.main" }} />
        <Typography variant="h6" fontWeight="bold">
          Personal Information
        </Typography>
      </Box>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={4} md={4}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              mb: { xs: 2, sm: 0 },
            }}
          >
            <Avatar
              src={formData.profile_picture_url}
              sx={{
                width: 100,
                height: 100,
                mb: 2,
                bgcolor: errors.profile_picture_url
                  ? "#d32f2f"
                  : formData.profile_picture_url
                    ? "transparent"
                    : "grey.300",
              }}
            >
              {errors.profile_picture_url && (
                <Help color="error" sx={{ color: "#fff" }} />
              )}

              {!formData.profile_picture_url && !errors.profile_picture_url && (
                <PersonIcon sx={{ fontSize: 40 }} />
              )}
            </Avatar>
            <input
              accept="image/*"
              style={{ display: "none" }}
              id="profile-picture-upload"
              type="file"
              onChange={handleFileSelectForCrop}
              disabled={uploadLoading}
            />
            <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
              <label htmlFor="profile-picture-upload">
                <Button
                  variant="outlined"
                  component="span"
                  size="small"
                  startIcon={
                    uploadLoading ? (
                      <CircularProgress size={16} />
                    ) : (
                      <CloudUploadIcon />
                    )
                  }
                  disabled={uploadLoading}
                >
                  {uploadLoading
                    ? "Uploading..."
                    : formData.profile_picture_url
                      ? "Edit"
                      : "Upload"}
                </Button>
              </label>
              {formData.profile_picture_url && (
                <Button
                  size="small"
                  color="error"
                  onClick={() =>
                    setFormData((prev: any) => ({
                      ...prev,
                      profile_picture_url: "",
                    }))
                  }
                >
                  Remove
                </Button>
              )}
            </Box>
          </Box>
          <Box
            sx={{
              display: "flex",
              gap: 1,
              mb: 2,
              mt: 1,
              justifyContent: "center",
            }}
          >
            {["female", "male"].map((gender) => {
              const isSelected = formData.gender === gender;
              const noSelectionYet = !formData.gender; // both red when none selected
              return (
                <Button
                  key={gender}
                  color={
                    noSelectionYet
                      ? "error"
                      : isSelected
                        ? "primary"
                        : "inherit"
                  }
                  variant={
                    isSelected
                      ? "contained"
                      : noSelectionYet
                        ? "outlined"
                        : "outlined"
                  }
                  onClick={() =>
                    setFormData((prev: any) => ({
                      ...prev,
                      gender: prev.gender === gender ? "" : gender, // toggle to null/empty
                    }))
                  }
                  size="medium"
                  sx={{ textTransform: "capitalize" }}
                  fullWidth
                  aria-pressed={isSelected}
                >
                  {gender}
                </Button>
              );
            })}
          </Box>
        </Grid>
        <Grid item xs={12} sm={8} md={8}>
          <Grid container spacing={2} sx={{ mb: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="First Name"
                required
                fullWidth
                size="small"
                value={formData.first_name}
                onChange={(e) =>
                  setFormData((prev: any) => ({
                    ...prev,
                    first_name: e.target.value,
                  }))
                }
                error={!!errors.first_name}
                helperText={errors.first_name}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Last Name"
                required
                fullWidth
                size="small"
                value={formData.last_name}
                onChange={(e) =>
                  setFormData((prev: any) => ({
                    ...prev,
                    last_name: e.target.value,
                  }))
                }
                error={!!errors.last_name}
                helperText={errors.last_name}
              />
            </Grid>
          </Grid>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Email"
                type="email"
                required
                fullWidth
                size="small"
                value={formData.email}
                onChange={(e) =>
                  setFormData((prev: any) => ({
                    ...prev,
                    email: e.target.value,
                  }))
                }
                error={!!errors.email}
                helperText={errors.email}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Phone Number"
                type="tel"
                fullWidth
                required
                size="small"
                value={formData.contact_number}
                onChange={(e) => {
                  const value = e.target.value;
                  const phoneError = validatePhoneNumber(value);
                  setFormData((prev: any) => ({
                    ...prev,
                    contact_number: value,
                    _phoneValidationError: phoneError,
                  }));
                }}
                error={
                  !!(errors.contact_number || formData._phoneValidationError)
                }
                helperText={
                  errors.contact_number || formData._phoneValidationError
                }
              />
            </Grid>
            <Grid item xs={12}>
              <Box
                sx={{
                  display: "flex",
                  gap: 1,
                  mt: 0.25,
                }}
              >
                <Typography sx={{ alignSelf: "center", mr: 1 }}>
                  Status:
                </Typography>
                {(formData.person_type === "volunteer"
                  ? ["active", "released"]
                  : ["pending", "active", "released"]
                ).map((status) => {
                  const isSelected =
                    (formData.assignment_status || "pending") === status;
                  return (
                    <Button
                      key={status}
                      color={"primary"}
                      variant={isSelected ? "contained" : "outlined"}
                      onClick={() =>
                        setFormData((prev: any) => ({
                          ...prev,
                          assignment_status: status,
                        }))
                      }
                      size="medium"
                      sx={{ textTransform: "capitalize", flex: 1 }}
                      aria-pressed={isSelected}
                    >
                      {status}
                    </Button>
                  );
                })}
              </Box>
              {formData.person_type === "missionary" && (
                <Typography
                  sx={{
                    alignSelf: "center",
                    fontSize: "body2.fontSize",
                    color: "text.secondary",
                  }}
                >
                  • Pending missionaries are serving but still in the process of
                  being called.
                </Typography>
              )}

              <Typography
                sx={{
                  alignSelf: "center",
                  fontSize: "body2.fontSize",
                  color: "text.secondary",
                }}
              >
                • The release date is the last day of service in myHometown.
              </Typography>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <Divider sx={{ mb: 3, mt: 1.5 }} />
      <Grid container spacing={2}>
        <Grid item xs={8}>
          <TextField
            label="Street Address"
            fullWidth
            size="small"
            value={formData.street_address}
            onChange={(e) =>
              setFormData((prev: any) => ({
                ...prev,
                street_address: e.target.value,
              }))
            }
            error={!!errors.street_address}
            helperText={errors.street_address}
          />
        </Grid>
        <Grid item xs={4}>
          <TextField
            label="City"
            fullWidth
            size="small"
            value={formData.address_city}
            onChange={(e) =>
              setFormData((prev: any) => ({
                ...prev,
                address_city: e.target.value,
              }))
            }
            error={!!errors.address_city}
            helperText={errors.address_city}
          />
        </Grid>
        <Grid item xs={4}>
          <TextField
            label="State"
            fullWidth
            size="small"
            value={formData.address_state}
            onChange={(e) =>
              setFormData((prev: any) => ({
                ...prev,
                address_state: e.target.value,
              }))
            }
            error={!!errors.address_state}
            helperText={errors.address_state}
          />
        </Grid>
        <Grid item xs={3}>
          <TextField
            label="ZIP Code"
            fullWidth
            size="small"
            value={formData.zip_code}
            onChange={(e) =>
              setFormData((prev: any) => ({
                ...prev,
                zip_code: e.target.value,
              }))
            }
            error={!!errors.zip_code}
            helperText={errors.zip_code}
          />
        </Grid>
        {formData.person_type === "missionary" && (
          <Grid item xs={5}>
            <TextField
              label="Name of Home Stake"
              fullWidth
              size="small"
              value={formData.stake_name}
              onChange={(e) =>
                setFormData((prev: any) => ({
                  ...prev,
                  stake_name: e.target.value,
                }))
              }
              error={!!errors.stake_name}
              helperText={errors.stake_name}
            />
          </Grid>
        )}
      </Grid>
    </CardContent>
  </Card>
);

export default MissionaryPersonalInfoSection;
