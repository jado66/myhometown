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

interface MissionaryPersonalInfoSectionProps {
  formData: any;
  setFormData: (fn: (prev: any) => any) => void;
  uploadLoading: boolean;
  handleFileSelectForCrop: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const MissionaryPersonalInfoSection: React.FC<
  MissionaryPersonalInfoSectionProps
> = ({ formData, setFormData, uploadLoading, handleFileSelectForCrop }) => (
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
                bgcolor: formData.profile_picture_url
                  ? "transparent"
                  : "grey.300",
              }}
            >
              {!formData.profile_picture_url && (
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
                    ? "Edit Photo"
                    : "Upload Photo"}
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
                  Remove Photo
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
            {["female", "male"].map((gender) => (
              <Button
                key={gender}
                variant={formData.gender === gender ? "contained" : "text"}
                onClick={() =>
                  setFormData((prev: any) => ({ ...prev, gender }))
                }
                size="medium"
                sx={{ textTransform: "capitalize" }}
                fullWidth
              >
                {gender}
              </Button>
            ))}
          </Box>
        </Grid>
        <Grid item xs={12} sm={8} md={8}>
          <Grid container spacing={2} sx={{ mb: 1 }}>
            <Grid item xs={12}>
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
              />
            </Grid>
            <Grid item xs={12}>
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
                onChange={(e) =>
                  setFormData((prev: any) => ({
                    ...prev,
                    contact_number: e.target.value,
                  }))
                }
              />
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
            />
          </Grid>
        )}
      </Grid>
    </CardContent>
  </Card>
);

export default MissionaryPersonalInfoSection;
