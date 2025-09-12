import React from "react";
import {
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  CircularProgress,
  Typography,
  Paper,
} from "@mui/material";
import { CatalogItem } from "./catalogData";

interface OrderFormProps {
  formData: any;
  handleInputChange: (field: string, value: string) => void;
  handleSubmit: () => void;
  isSubmitting: boolean;
  selectedItems: string[];
}

export default function OrderForm({
  formData,
  handleInputChange,
  handleSubmit,
  isSubmitting,
  selectedItems,
}: OrderFormProps) {
  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
        Order Information
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Title"
            value={formData.title}
            onChange={(e) => handleInputChange("title", e.target.value)}
            variant="outlined"
            required
            size="small"
            placeholder="e.g., Executive Secretary, City Chair, Technology Specialist"
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Full Name"
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            variant="outlined"
            required
            size="small"
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            variant="outlined"
            required
            size="small"
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Phone Number"
            value={formData.phone}
            onChange={(e) => handleInputChange("phone", e.target.value)}
            variant="outlined"
            required
            size="small"
          />
        </Grid>
        <Grid item xs={12}>
          <FormControl fullWidth required size="small">
            <InputLabel>Location Type</InputLabel>
            <Select
              value={formData.locationType}
              onChange={(e) =>
                handleInputChange("locationType", e.target.value)
              }
              label="Location Type"
            >
              <MenuItem value="myHometown Utah">myHometown Utah</MenuItem>
              <MenuItem value="city">City</MenuItem>
              <MenuItem value="community">Community</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        {formData.locationType === "city" && (
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="City Name"
              value={formData.city}
              onChange={(e) => handleInputChange("city", e.target.value)}
              variant="outlined"
              required
              size="small"
            />
          </Grid>
        )}
        {formData.locationType === "community" && (
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Community Name"
              value={formData.community}
              onChange={(e) => handleInputChange("community", e.target.value)}
              variant="outlined"
              required
              size="small"
            />
          </Grid>
        )}
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Additional Requests"
            multiline
            rows={3}
            value={formData.additionalRequests}
            onChange={(e) =>
              handleInputChange("additionalRequests", e.target.value)
            }
            variant="outlined"
            helperText="Please include any special instructions, quantities, dates, or other relevant information"
            size="small"
          />
        </Grid>
        <Grid item xs={12}>
          <Button
            variant="contained"
            size="large"
            onClick={handleSubmit}
            fullWidth
            sx={{ fontWeight: "bold", py: 1.5 }}
            disabled={
              !formData.title ||
              !formData.name ||
              !formData.email ||
              !formData.phone ||
              !formData.locationType ||
              selectedItems.length === 0 ||
              isSubmitting
            }
          >
            {isSubmitting ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              "SUBMIT ORDER"
            )}
          </Button>
        </Grid>
      </Grid>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ mt: 2, textAlign: "center" }}
      >
        We will confirm receipt of your request within 24hrs
      </Typography>
    </Paper>
  );
}
