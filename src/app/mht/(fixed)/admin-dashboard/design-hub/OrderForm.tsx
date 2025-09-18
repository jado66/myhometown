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
  Divider,
} from "@mui/material";

import CitySelect from "@/components/data-tables/selects/CitySelect";
import CommunitySelect from "@/components/data-tables/selects/CommunitySelect";

interface OrderFormData {
  name: string;
  email: string;
  phone: string;
  locationType: string;
  community: string;
  authorizationType: string;
  city: string;
  additionalRequests: string;
  communityLabel: string;
  cityLabel: string;
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
    name: "",
    email: "",
    phone: "",
    locationType: "",
    community: "",
    communityLabel: "",
    city: "",
    cityLabel: "",
    additionalRequests: "",
    authorizationType: "",
  });

  const updateField = (field: keyof OrderFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const isFormValid =
    // formData.title &&
    formData.name &&
    formData.email &&
    formData.phone &&
    formData.locationType &&
    formData.authorizationType &&
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
          <FormControl fullWidth required>
            <InputLabel>Authorized By</InputLabel>
            <Select
              value={formData.authorizationType}
              onChange={(e) => updateField("authorizationType", e.target.value)}
              label="Authorization Type"
            >
              <MenuItem value="utah-state-executive">
                Utah State Executive
              </MenuItem>
              <MenuItem value="city-chair">City Chair</MenuItem>
              <MenuItem value="community-executive-director">
                Community Executive Director
              </MenuItem>
              <MenuItem value="crc-director">CRC Director</MenuItem>

              <MenuItem value="neighborhood-services-director">
                Neighborhood Services Director
              </MenuItem>
            </Select>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 1, mb: 2 }}
            >
              Authorization required for this request. Select who authorized
              this design request.
            </Typography>
          </FormControl>

          <Divider />

          <TextField
            label="Your Full Name"
            value={formData.name}
            onChange={(e) => updateField("name", e.target.value)}
            required
            fullWidth
          />

          <TextField
            label="Your Email"
            type="email"
            value={formData.email}
            onChange={(e) => updateField("email", e.target.value)}
            required
            fullWidth
          />

          <TextField
            label="Your Phone Number"
            value={formData.phone}
            onChange={(e) => updateField("phone", e.target.value)}
            required
            fullWidth
          />

          <FormControl fullWidth required>
            <InputLabel>To Be Designed For</InputLabel>
            <Select
              value={formData.locationType}
              onChange={(e) => {
                const newLocationType = e.target.value;
                updateField("locationType", newLocationType);
                // Clear city/community data when switching types
                if (newLocationType !== "city") {
                  updateField("city", "");
                  updateField("cityLabel", "");
                }
                if (newLocationType !== "community") {
                  updateField("community", "");
                  updateField("communityLabel", "");
                }
              }}
              label="To Be Designed For"
            >
              <MenuItem value="myHometown Utah">myHometown Utah</MenuItem>
              <MenuItem value="city">City</MenuItem>
              <MenuItem value="community">Community</MenuItem>
            </Select>
          </FormControl>

          {formData.locationType === "city" && (
            <CitySelect
              value={formData.city}
              onChange={(value: string) => {
                updateField("city", value);
              }}
              onLabelChange={(label: string) => {
                updateField("cityLabel", label);
              }}
            />
          )}

          {formData.locationType === "community" && (
            <CommunitySelect
              value={formData.community}
              onChange={(value: string) => updateField("community", value)}
              onLabelChange={(label: string) =>
                updateField("communityLabel", label)
              }
              isMulti={false}
              concatCityName={true}
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
