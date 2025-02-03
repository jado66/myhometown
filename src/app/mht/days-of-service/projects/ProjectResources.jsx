"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  TextField,
  Chip,
  Box,
  Divider,
} from "@mui/material";

export function ProjectResources({
  formData,
  handleInputChange,
  handleToolAdd,
}) {
  const sections = [
    {
      title: "Volunteer Tools",
      items: formData.volunteerTools,
      placeholder: "Hit enter to add tools...",
      category: "tools",
    },
    {
      title: "Equipment",
      items: formData.equipment,
      placeholder: "Hit enter to add equipment...",
      category: "equipment",
    },
    {
      title: "Materials provided by Homeowner",
      items: formData.homeownerMaterials,
      placeholder: "Hit enter to add material...",
      category: "homeownerMaterials",
    },
    {
      title: "Other Materials provided",
      items: formData.otherMaterials,
      placeholder: "Hit enter to add material...",
      category: "otherMaterials",
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
    const newItems = formData[fieldName].filter((_, i) => i !== index);
    handleInputChange(fieldName, newItems);
  };

  return (
    <>
      {sections.map((section, sectionIndex) => (
        <React.Fragment key={section.category}>
          {sectionIndex > 0 && <Divider />}
          <Box sx={{ mb: 1 }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              {section.title}
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {section.items.map((item, index) => (
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
                onKeyDown={(e) => handleToolAdd(e, section.category)}
                sx={{ minWidth: 150 }}
              />
            </Box>
          </Box>
        </React.Fragment>
      ))}
    </>
  );
}
