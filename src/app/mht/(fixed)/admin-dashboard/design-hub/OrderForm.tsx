"use client";

import type React from "react";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
} from "@mui/material";

interface OrderFormData {
  title: string;
  name: string;
  email: string;
  phone: string;
  locationType: string;
  community: string;
  city: string;
  additionalRequests: string;
}

interface OrderFormProps {
  onSubmit: (data: OrderFormData) => void;
  isSubmitting: boolean;
  hasItems: boolean;
}

export function OrderForm({
  onSubmit,
  isSubmitting,
  hasItems,
}: OrderFormProps) {
  const [formData, setFormData] = useState<OrderFormData>({
    title: "",
    name: "",
    email: "",
    phone: "",
    locationType: "",
    community: "",
    city: "",
    additionalRequests: "",
  });

  const updateField = (field: keyof OrderFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const isFormValid =
    formData.title &&
    formData.name &&
    formData.email &&
    formData.phone &&
    formData.locationType &&
    hasItems;

  return (
    <Card>
      <CardHeader>
        <Typography variant="h6">Order Information</Typography>
      </CardHeader>
      <CardContent>
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ display: "flex", flexDirection: "column", gap: 3 }}
        >
          <TextField
            label="Full Name"
            value={formData.name}
            onChange={(e) => updateField("name", e.target.value)}
            required
            fullWidth
          />
          <TextField
            label="MHT Position"
            value={formData.title}
            onChange={(e) => updateField("title", e.target.value)}
            placeholder="e.g., Executive Secretary, City Chair"
            required
            fullWidth
          />
          <TextField
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => updateField("email", e.target.value)}
            required
            fullWidth
          />

          <TextField
            label="Phone Number"
            value={formData.phone}
            onChange={(e) => updateField("phone", e.target.value)}
            required
            fullWidth
          />

          <FormControl fullWidth required>
            <InputLabel>Location Type</InputLabel>
            <Select
              value={formData.locationType}
              onChange={(e) => updateField("locationType", e.target.value)}
              label="Location Type"
            >
              <MenuItem value="myHometown Utah">myHometown Utah</MenuItem>
              <MenuItem value="city">City</MenuItem>
              <MenuItem value="community">Community</MenuItem>
            </Select>
          </FormControl>

          {formData.locationType === "city" && (
            <TextField
              label="City Name"
              value={formData.city}
              onChange={(e) => updateField("city", e.target.value)}
              required
              fullWidth
            />
          )}

          {formData.locationType === "community" && (
            <TextField
              label="Community Name"
              value={formData.community}
              onChange={(e) => updateField("community", e.target.value)}
              required
              fullWidth
            />
          )}

          <TextField
            label="Additional Information"
            value={formData.additionalRequests}
            onChange={(e) => updateField("additionalRequests", e.target.value)}
            placeholder="Any special instructions, quantities, dates, or other relevant information"
            multiline
            rows={3}
            fullWidth
          />

          <Button
            type="submit"
            variant="contained"
            disabled={!isFormValid || isSubmitting}
            fullWidth
            size="large"
          >
            {isSubmitting ? "Submitting..." : "Submit Order"}
          </Button>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ textAlign: "center" }}
          >
            We will confirm receipt of your request within 24hrs
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}
