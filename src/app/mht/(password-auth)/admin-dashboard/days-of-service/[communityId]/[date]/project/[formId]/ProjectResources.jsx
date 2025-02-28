"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  TextField,
  Chip,
  Box,
  Divider,
  FormHelperText,
} from "@mui/material";
import { Info } from "@mui/icons-material";

export function ProjectResources({
  formData,
  handleInputChange,
  handleToolAdd,
}) {
  // State to manage the current input values
  const [inputValues, setInputValues] = useState({
    tools: "",
    equipment: "",
    homeownerMaterials: "",
    otherMaterials: "",
  });

  const sections = [
    {
      title: "Volunteer Tools",
      items: formData.volunteerTools,
      placeholder: "Enter tools",
      category: "tools",
      fieldName: "volunteerTools",
    },
    {
      title: "Equipment",
      items: formData.equipment,
      placeholder: "Enter equipment",
      category: "equipment",
      fieldName: "equipment",
    },
    {
      title: "Materials provided by Homeowner",
      items: formData.homeownerMaterials,
      placeholder: "Enter materials",
      category: "homeownerMaterials",
      fieldName: "homeownerMaterials",
    },
    {
      title: "Other Materials provided",
      items: formData.otherMaterials,
      placeholder: "Enter materials",
      category: "otherMaterials",
      fieldName: "otherMaterials",
    },
  ];

  const handleDelete = (category, index) => {
    const categoryMap = {
      tools: "volunteerTools",
      equipment: "equipment",
      homeownerMaterials: "homeownerMaterials",
      otherMaterials: "otherMaterials",
    };
    const fieldName = categoryMap[category];
    // Use normalizeItems to ensure we're working with an array before filtering
    const currentItems = normalizeItems(formData[fieldName]);
    const newItems = currentItems.filter((_, i) => i !== index);
    handleInputChange(fieldName, newItems);
  };

  // Helper function to normalize items to an array
  const normalizeItems = (items) => {
    if (Array.isArray(items)) return items;
    if (typeof items === "string") {
      try {
        return JSON.parse(items); // Parse stringified arrays like "[\"shovel\"]"
      } catch (e) {
        return []; // Fallback to empty array if parsing fails
      }
    }
    return []; // Fallback for undefined, null, or other types
  };

  // Handle input change for text fields
  const handleInputValueChange = (category, value) => {
    setInputValues((prev) => ({
      ...prev,
      [category]: value,
    }));
  };

  // Process comma-separated input and add items
  const handleCommaInput = (e, category) => {
    const value = e.target.value.trim();

    if (e.key === "Enter" && value) {
      e.preventDefault();

      // Split by commas and filter out empty strings
      const newItems = value
        .split(",")
        .map((item) => item.trim())
        .filter((item) => item !== "");

      const categoryMap = {
        tools: "volunteerTools",
        equipment: "equipment",
        homeownerMaterials: "homeownerMaterials",
        otherMaterials: "otherMaterials",
      };

      const fieldName = categoryMap[category];
      const currentItems = normalizeItems(formData[fieldName]);

      // Add all new items at once
      handleInputChange(fieldName, [...currentItems, ...newItems]);

      // Clear the input field
      setInputValues((prev) => ({
        ...prev,
        [category]: "",
      }));
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1, px: 1 }}>
      {sections.map((section, sectionIndex) => (
        <React.Fragment key={section.category}>
          {sectionIndex > 0 && <Divider sx={{ mx: 1 }} />}
          <Box sx={{ mb: 1 }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              {section.title}
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {normalizeItems(section.items).map((item, index) => (
                <Chip
                  key={index}
                  label={item}
                  onDelete={() => handleDelete(section.category, index)}
                  size="small"
                />
              ))}
              <TextField
                size="small"
                variant="outlined"
                placeholder={section.placeholder}
                value={inputValues[section.category]}
                onChange={(e) =>
                  handleInputValueChange(section.category, e.target.value)
                }
                onKeyDown={(e) => handleCommaInput(e, section.category)}
                sx={{ minWidth: 150 }}
              />
              {inputValues[section.category] && (
                <FormHelperText
                  sx={{
                    ml: 1,
                    color: "red",

                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <Info fontSize="small" sx={{ mr: 0.5 }} />
                  Press Enter to add
                </FormHelperText>
              )}
            </Box>
          </Box>
        </React.Fragment>
      ))}
    </Box>
  );
}
