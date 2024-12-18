import React from "react";
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Chip,
  Box,
  Divider,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import {
  CalendarToday,
  AccessTime,
  LocationOn,
  People,
  ExpandMore,
} from "@mui/icons-material";
import { ExampleIcons } from "@/components/events/ClassesTreeView/IconSelect";
import ClassPreview from "./stepper-components/ClassPreview";

const ClassPreviewAccordion = ({ classData, isEdit, onSignupClick }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMore />}>
        {classData.icon && ExampleIcons[classData.icon]}
        <Typography sx={{ marginLeft: "1em" }}>{classData.title}</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <ClassPreview classData={classData} />
        <Button
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 2 }}
          onClick={onSignupClick}
        >
          {isEdit ? "View/Edit Class Signup Form" : "Sign Up"}
        </Button>
      </AccordionDetails>
    </Accordion>
  );
};

export default ClassPreviewAccordion;
